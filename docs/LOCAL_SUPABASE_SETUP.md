# Local Supabase Deployment Guide for AIMS Kochi

This guide is intended for the AIMS IT department to deploy a self-hosted instance of Supabase on the campus local server. This replaces the cloud-based Supabase tier, keeping all lab data internally secure and eliminating usage limits.

## 1. System Requirements

The server should preferably be running Linux (Ubuntu/Debian recommended) with the following minimum specs:
- **RAM**: Minimum 4GB (8GB recommended)
- **CPU**: 2+ Cores
- **Docker**: Docker and Docker Compose (v2) must be installed.

## 2. Setting Up the Supabase Instance

We have provided the official Supabase Docker configuration in the `supabase-local/` directory. 

1. Copy the `supabase-local/` directory from the repository to your server.
2. Navigate into the directory on your server:
   ```bash
   cd supabase-local
   ```
3. Create your `.env` file by copying the provided example:
   ```bash
   cp .env.example .env
   ```
4. **Important**: Open the `.env` file and configure your credentials. At a minimum, set:
   - `POSTGRES_PASSWORD`: Make this highly secure.
   - `JWT_SECRET`: Generate a random secure string.
   - `ANON_KEY`: Generate a random secure string (or use the one provided by default, but it's recommended to regenerate it).
   - `SERVICE_ROLE_KEY`: Generate a random secure string.

5. Start the Supabase stack in the background:
   ```bash
   docker compose up -d
   ```

Supabase will now take a few moments to spin up all the necessary services (PostgreSQL, Auth API, Storage API, Realtime API, and the Studio UI). 

You can access the Supabase Management UI by navigating to:
`http://<SERVER_IP>:8000`

## 3. Initializing the Database Schema

Since we are transitioning to a fresh local deployment, we need to recreate our database tables and storage bucket rules. We have provided `schema.sql` to automate this.

1. Open a browser and go to your newly running Supabase Studio (`http://<SERVER_IP>:8000`).
2. Log in with the default Studio credentials. (Usually admin / admin, but check the `.env` file if it prompts you, or it might just give you access directly).
3. In the left sidebar, navigate to the **SQL Editor**.
4. Click **New query**.
5. Open the `supabase-local/schema.sql` file provided with this codebase, copy all its contents, and paste it into the editor.
6. Click **Run**. 

This will automatically create the `analyses` table, setup the row-level security policies, create the `colony-images` storage bucket, and set up bucket permissions.

## 4. Connecting the Mobile App

Once the server is running, the developers will need to update the React Native app to point to your new local instance. 

Provide the developers with:
1. The **IP Address** of the server.
2. The **ANON_KEY** you configured in step 2.

The developers will put these values in the app's `.env` file:
```env
EXPO_PUBLIC_SUPABASE_URL=http://<SERVER_IP>:8000
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-new-anon-key-here
```

**Note on Wi-Fi**: Mobile devices running the app must be connected to the AIMS local network/Wi-Fi to communicate with this server.
