-- schema.sql
-- This file combines all original Cloud migrations into a single setup script for the local instance.

-- 1. Create the analyses table
CREATE TABLE IF NOT EXISTS public.analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  characteristics text[] NOT NULL DEFAULT '{}',
  culture_medium text NOT NULL DEFAULT '',
  image_url text,
  result text,
  confidence decimal(5,4) CHECK (confidence >= 0.0 AND confidence <= 1.0),
  created_at timestamptz DEFAULT now() NOT NULL,
  colony_age text DEFAULT ''
);

-- 2. Enable Row Level Security
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for analyses table
CREATE POLICY "Users can manage their own analyses"
  ON public.analyses
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own analyses"
  ON public.analyses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analyses"
  ON public.analyses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analyses"
  ON public.analyses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyses"
  ON public.analyses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. Create storage bucket for colony images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'colony-images',
  'colony-images',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 5. Create storage policies for colony images
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

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON public.analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON public.analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_result ON public.analyses(result);
CREATE INDEX IF NOT EXISTS idx_analyses_user_created ON public.analyses(user_id, created_at DESC);

-- 7. Create a function to get analysis statistics
CREATE OR REPLACE FUNCTION public.get_user_analysis_stats(user_uuid uuid)
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
  FROM public.analyses 
  WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_user_analysis_stats(uuid) TO authenticated;

-- 8. Add Delete User Function
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.delete_user() TO authenticated;
