/*
  # Initial Database Schema for Bacterial Pathogen Analyzer

  1. New Tables
    - `analyses`
      - `id` (uuid, primary key) - Unique identifier for each analysis
      - `user_id` (uuid, foreign key) - References auth.users table
      - `characteristics` (text array) - Selected bacterial characteristics
      - `culture_medium` (text) - Selected culture medium
      - `image_url` (text, nullable) - URL to stored colony image
      - `result` (text, nullable) - Analysis result from ML model
      - `confidence` (decimal, nullable) - Confidence score (0.0-1.0)
      - `created_at` (timestamptz) - Timestamp of analysis creation

  2. Security
    - Enable RLS on `analyses` table
    - Add policy for users to manage their own analyses
    - Add policy for authenticated users to insert new analyses
    - Add policy for authenticated users to read their own analyses

  3. Storage
    - Create storage bucket for colony images
    - Add storage policies for user image access
*/

-- Create the analyses table
CREATE TABLE IF NOT EXISTS analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  characteristics text[] NOT NULL DEFAULT '{}',
  culture_medium text NOT NULL DEFAULT '',
  image_url text,
  result text,
  confidence decimal(5,4) CHECK (confidence >= 0.0 AND confidence <= 1.0),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Create policies for analyses table
CREATE POLICY "Users can manage their own analyses"
  ON analyses
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy for reading analyses
CREATE POLICY "Users can read their own analyses"
  ON analyses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policy for inserting analyses
CREATE POLICY "Users can create their own analyses"
  ON analyses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policy for updating analyses
CREATE POLICY "Users can update their own analyses"
  ON analyses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy for deleting analyses
CREATE POLICY "Users can delete their own analyses"
  ON analyses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create storage bucket for colony images
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'colony-images',
    'colony-images',
    false,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  );
EXCEPTION
  WHEN unique_violation THEN
    -- Bucket already exists, do nothing
    NULL;
END $$;

-- Create storage policies for colony images
CREATE POLICY "Users can upload their own images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'colony-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own images"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'colony-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'colony-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'colony-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_result ON analyses(result);
CREATE INDEX IF NOT EXISTS idx_analyses_user_created ON analyses(user_id, created_at DESC);

-- Create a function to get analysis statistics
CREATE OR REPLACE FUNCTION get_user_analysis_stats(user_uuid uuid)
RETURNS TABLE (
  total_analyses bigint,
  positive_results bigint,
  negative_results bigint,
  average_confidence numeric,
  analyses_this_week bigint,
  analyses_this_month bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_analyses,
    COUNT(*) FILTER (WHERE result ILIKE '%Probably%') as positive_results,
    COUNT(*) FILTER (WHERE result IS NOT NULL AND result NOT ILIKE '%Probably%') as negative_results,
    ROUND(AVG(confidence), 3) as average_confidence,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as analyses_this_week,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as analyses_this_month
  FROM analyses 
  WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_user_analysis_stats(uuid) TO authenticated;