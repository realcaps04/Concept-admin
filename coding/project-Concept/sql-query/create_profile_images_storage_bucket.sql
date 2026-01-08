-- Create Supabase Storage Bucket for Profile Images
-- Run this in Supabase SQL Editor or Dashboard > Storage

-- Note: Storage buckets are typically created via the Supabase Dashboard UI
-- Go to: Storage > Create a new bucket

-- Bucket Configuration:
-- Name: profile-images
-- Public: Yes (so profile pictures are publicly accessible)
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/jpg, image/png, image/gif, image/svg+xml

-- If you need to create it via SQL (advanced):
-- This creates the bucket metadata in the storage.buckets table

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'profile-images',
    'profile-images',
    true,
    5242880, -- 5MB in bytes
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the bucket
-- Allow anyone to read (public bucket)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

-- Allow authenticated users to upload their own profile pictures
CREATE POLICY "Users can upload profile pictures"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile-images');

-- Allow users to update their own profile pictures
CREATE POLICY "Users can update profile pictures"
ON storage.objects FOR UPDATE
USING (bucket_id = 'profile-images');

-- Allow users to delete their own profile pictures
CREATE POLICY "Users can delete profile pictures"
ON storage.objects FOR DELETE
USING (bucket_id = 'profile-images');
