-- Consolidate profile picture fields
-- We have both profile_image_url and profile_picture_url
-- Let's merge them into profile_picture_url and drop the old one

-- Step 1: Copy data from profile_image_url to profile_picture_url if it exists
UPDATE "project_users"
SET profile_picture_url = profile_image_url
WHERE profile_image_url IS NOT NULL 
  AND (profile_picture_url IS NULL OR profile_picture_url = '');

-- Step 2: Drop the old profile_image_url column
ALTER TABLE "project_users" DROP COLUMN IF EXISTS profile_image_url;

-- Verify the cleanup
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'project_users' 
  AND column_name LIKE '%picture%'
ORDER BY column_name;
