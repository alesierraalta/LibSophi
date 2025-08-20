-- Palabreo Storage Setup Script
-- This script creates the necessary storage buckets and policies

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

-- Create images bucket for profile pictures, banners, and work covers
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create documents bucket for attachments (optional)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE POLICIES
-- =====================================================

-- Images bucket policies
-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'profiles'
);

-- Allow users to update their own images
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'profiles'
  AND (storage.filename(name) LIKE auth.uid()::text || '-%')
);

-- Allow users to delete their own images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'profiles'
  AND (storage.filename(name) LIKE auth.uid()::text || '-%')
);

-- Allow public read access to images
CREATE POLICY "Public read access for images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Documents bucket policies (if needed)
-- Allow authenticated users to upload documents
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
);

-- Allow users to read their own documents
CREATE POLICY "Users can read own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
  AND (storage.filename(name) LIKE auth.uid()::text || '-%')
);

-- Allow users to update their own documents
CREATE POLICY "Users can update own documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
  AND (storage.filename(name) LIKE auth.uid()::text || '-%')
);

-- Allow users to delete their own documents
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
  AND (storage.filename(name) LIKE auth.uid()::text || '-%')
);

-- =====================================================
-- ADDITIONAL CONFIGURATIONS
-- =====================================================

-- Enable RLS on storage.objects (should already be enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create function to get file size in human readable format
CREATE OR REPLACE FUNCTION storage.get_file_size_human(file_size bigint)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  IF file_size < 1024 THEN
    RETURN file_size || ' B';
  ELSIF file_size < 1024 * 1024 THEN
    RETURN ROUND(file_size / 1024.0, 2) || ' KB';
  ELSIF file_size < 1024 * 1024 * 1024 THEN
    RETURN ROUND(file_size / (1024.0 * 1024.0), 2) || ' MB';
  ELSE
    RETURN ROUND(file_size / (1024.0 * 1024.0 * 1024.0), 2) || ' GB';
  END IF;
END;
$$;

-- Create view for easy file management
CREATE OR REPLACE VIEW storage.file_info AS
SELECT 
  id,
  name,
  bucket_id,
  owner,
  created_at,
  updated_at,
  last_accessed_at,
  metadata,
  storage.get_file_size_human(metadata->>'size'::text::bigint) as size_human,
  (metadata->>'size')::bigint as size_bytes,
  metadata->>'mimetype' as mime_type
FROM storage.objects;

-- Grant access to the view
GRANT SELECT ON storage.file_info TO authenticated;

COMMENT ON TABLE storage.buckets IS 'Storage buckets for Palabreo application files';
COMMENT ON POLICY "Authenticated users can upload images" ON storage.objects IS 'Allow authenticated users to upload profile images';
COMMENT ON POLICY "Public read access for images" ON storage.objects IS 'Allow public access to view uploaded images';

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================

-- Example queries for monitoring storage usage:

-- Get total storage usage per bucket
-- SELECT 
--   bucket_id,
--   COUNT(*) as file_count,
--   SUM((metadata->>'size')::bigint) as total_bytes,
--   storage.get_file_size_human(SUM((metadata->>'size')::bigint)) as total_size
-- FROM storage.objects
-- GROUP BY bucket_id;

-- Get recent uploads
-- SELECT 
--   name,
--   bucket_id,
--   created_at,
--   storage.get_file_size_human((metadata->>'size')::bigint) as size
-- FROM storage.file_info
-- WHERE created_at > NOW() - INTERVAL '7 days'
-- ORDER BY created_at DESC;

-- Get largest files
-- SELECT 
--   name,
--   bucket_id,
--   size_human,
--   created_at
-- FROM storage.file_info
-- ORDER BY size_bytes DESC
-- LIMIT 10;
