import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Define ES module compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.warn('Warning: .env file not found at', envPath);
}

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: Missing required environment variables.');
  console.error(
    'Please ensure EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file.',
  );
  process.exit(1);
}

// Initialize Supabase Admin Client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const BUCKET_NAME = 'colony-images';
const TABLE_NAME = 'analyses';

async function cleanupImages() {
  console.log('Starting cleanup process...');

  try {
    // 1. Fetch all image records from the database
    console.log('Fetching database records...');
    const { data: analyses, error: dbError } = await supabase
      .from(TABLE_NAME)
      .select('image_url');

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    // Extract all used paths
    // Handle both raw paths (new format) and full URLs (legacy format)
    const usedPaths = new Set<string>();

    analyses?.forEach((record) => {
      if (!record.image_url) return;

      const url = record.image_url;

      // Check if it's a URL or a path
      if (url.startsWith('http')) {
        // Extract path from URL
        // Format: .../colony-images/user_id/filename.jpg
        const marker = `/${BUCKET_NAME}/`;
        const index = url.indexOf(marker);
        if (index !== -1) {
          let path = url.substring(index + marker.length);
          // Remove query parameters if any
          const queryIndex = path.indexOf('?');
          if (queryIndex !== -1) {
            path = path.substring(0, queryIndex);
          }
          usedPaths.add(decodeURIComponent(path));
        }
      } else {
        // It's already a path
        usedPaths.add(url);
      }
    });

    console.log(
      `Found ${usedPaths.size} unique images referenced in database.`,
    );

    // 2. List all files in the storage bucket
    console.log('Listing storage files...');
    // Note: list() has a limit (default 100). We need to paginate if there are many.
    // For this script, we'll try to fetch a large number.

    let allFiles: { name: string; id: string; metadata: any }[] = [];
    // We need to list recursively.
    // Since structure is `userId/filename.jpg`, we first list root folders (userIds) then files.

    // First, list top-level folders
    const { data: rootFolders, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list();

    if (listError) {
      throw new Error(`Storage list error: ${listError.message}`);
    }

    for (const folder of rootFolders || []) {
      // If it's a folder (no metadata.mimetype usually, or purely by convention of this app)
      // The app creates folder per user ID
      if (!folder.metadata) {
        // This is a folder
        const { data: files, error: fileError } = await supabase.storage
          .from(BUCKET_NAME)
          .list(folder.name, { limit: 1000 });

        if (fileError) {
          console.error(`Error listing folder ${folder.name}:`, fileError);
          continue;
        }

        if (files) {
          files.forEach((f) => {
            allFiles.push({
              ...f,
              name: `${folder.name}/${f.name}`, // Construct full path
            });
          });
        }
      } else {
        // It's a file at root (shouldn't happen based on app logic, but handling it)
        allFiles.push({
          ...folder,
          name: folder.name,
        });
      }
    }

    console.log(`Found ${allFiles.length} total files in storage.`);

    // 3. Identify orphans
    const orphans = allFiles.filter((file) => !usedPaths.has(file.name));
    console.log(`Found ${orphans.length} orphaned images.`);

    if (orphans.length === 0) {
      console.log('No images to delete.');
      return;
    }

    // 4. Delete orphans
    const pathsToDelete = orphans.map((f) => f.name);
    console.log('Deleting orphans...');

    // Supabase remove() takes an array of paths
    const { error: removeError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(pathsToDelete);

    if (removeError) {
      throw new Error(`Delete error: ${removeError.message}`);
    }

    console.log(`Successfully deleted ${orphans.length} images.`);
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}

cleanupImages();
