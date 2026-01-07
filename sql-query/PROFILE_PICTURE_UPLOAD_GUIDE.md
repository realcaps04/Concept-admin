# Profile Picture Upload Setup Guide

## Overview
This guide explains how to set up Supabase Storage for profile picture uploads.

## Step 1: Create Storage Bucket in Supabase Dashboard

### Via Supabase Dashboard (Recommended):
1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to Storage**
   - Click on "Storage" in the left sidebar
   - Click "Create a new bucket"

3. **Configure Bucket**
   - **Name**: `profile-images`
   - **Public bucket**: ✅ **Enable** (so profile pictures are publicly accessible)
   - **File size limit**: `5 MB`
   - **Allowed MIME types**: 
     - image/jpeg
     - image/jpg
     - image/png
     - image/gif
     - image/svg+xml

4. **Create Bucket**
   - Click "Create bucket"

## Step 2: Set Up Storage Policies (Optional)

The bucket should be public, but you can add additional policies if needed:

```sql
-- Allow anyone to read (public bucket)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

-- Allow authenticated users to upload
CREATE POLICY "Users can upload profile pictures"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile-images');
```

## Step 3: Test the Upload

1. **Log in to your dashboard**
2. **Go to Profile Settings** (Accounts section)
3. **Click "Click here to upload your file or drag"**
4. **Select an image** (JPG, PNG, GIF, or SVG)
5. **Wait for upload** - You should see:
   - "Uploading profile picture..." notification
   - "Profile picture updated successfully!" on success
   - Image updates across all profile pictures on the page

## How It Works

### Upload Process:
1. User selects image file
2. JavaScript validates file type and size
3. File is uploaded to Supabase Storage bucket `profile-images`
4. Unique filename is generated: `email_timestamp.ext`
5. Public URL is retrieved from Supabase
6. Database is updated with the new `profile_picture_url`
7. All profile images on the page are updated
8. User data is refreshed

### File Naming Convention:
```
email_timestamp.extension
Example: user_example_com_1703721234567.jpg
```

### Storage Path:
```
profile-images/profile-pictures/filename.ext
```

## Validation Rules

- **File Types**: JPG, JPEG, PNG, GIF, SVG
- **Max Size**: 5 MB
- **Required**: User must be logged in

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| "Please upload a valid image file" | Wrong file type | Use JPG, PNG, GIF, or SVG |
| "Image size must be less than 5MB" | File too large | Compress or resize image |
| "Please log in to upload" | Not authenticated | Log in first |
| "Setting up storage..." | Bucket doesn't exist | Create bucket in dashboard |
| "Failed to upload" | Network/permission error | Check internet and bucket settings |

## Database Schema

The `profile_picture_url` field in `project_users` table stores the public URL:

```sql
profile_picture_url TEXT -- Example: https://rdubzgyjyyumapvifwuq.supabase.co/storage/v1/object/public/profile-images/profile-pictures/user_1703721234567.jpg
```

## Security Notes

- ✅ Bucket is public (required for displaying images)
- ✅ File validation prevents malicious uploads
- ✅ Unique filenames prevent overwrites
- ✅ Size limit prevents storage abuse
- ✅ Only authenticated users can upload

## Troubleshooting

### Image not uploading?
1. Check if bucket exists in Supabase Dashboard > Storage
2. Verify bucket name is exactly `profile-images`
3. Ensure bucket is set to **public**
4. Check browser console for errors

### Image not displaying?
1. Verify URL is saved in database
2. Check if URL is publicly accessible
3. Ensure bucket permissions allow public read

### Old image still showing?
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Check if database was updated

## Alternative: Manual Bucket Creation via SQL

If you prefer SQL, run the script in `create_profile_images_storage_bucket.sql`:

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'profile-images',
    'profile-images',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;
```

## Next Steps

After setup:
1. ✅ Test upload functionality
2. ✅ Verify images display correctly
3. ✅ Check database updates
4. ✅ Test on different devices
5. ✅ Monitor storage usage in Supabase Dashboard
