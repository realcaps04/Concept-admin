# Project Users Table Schema Update

## Overview
This document describes the new fields added to the `project_users` table to support the comprehensive profile settings page.

## New Fields Added

### Profile Information
1. **bio** (TEXT)
   - User's biography/description
   - Supports @mentions
   - Max 500 characters (enforced in UI)

2. **profile_picture_url** (TEXT)
   - URL to user's profile picture
   - Stored in Supabase Storage
   - Supports: SVG, PNG, JPG, GIF

3. **public_url** (TEXT)
   - User's public URL (GitHub, personal website, etc.)
   - Example: https://github.com/username

### Social Media Links
4. **facebook_username** (TEXT)
   - Facebook profile username
   - Displayed as: facebook.com/{username}

5. **twitter_username** (TEXT)
   - Twitter/X profile username
   - Displayed as: twitter.com/{username}

6. **discord_username** (TEXT)
   - Discord username
   - Displayed as: discord.com/{username}

### Notification Preferences
7. **notif_reports** (BOOLEAN, DEFAULT: true)
   - Receive reports via PUSH/SMS
   - User can toggle on/off

8. **notif_shared** (BOOLEAN, DEFAULT: false)
   - Receive social/public shares
   - User can toggle on/off

### System Fields
9. **theme_preference** (TEXT, DEFAULT: 'light')
   - User's theme preference: 'light' or 'dark'
   - Syncs with dark mode toggle

10. **last_login** (TIMESTAMP WITH TIME ZONE)
    - Tracks user's last login time
    - Auto-updated on login

11. **account_status** (TEXT, DEFAULT: 'active')
    - Account status: 'active', 'suspended', 'deleted'
    - Used for account management

## Existing Fields (Already Present)
- id (UUID, PRIMARY KEY)
- email (TEXT, UNIQUE, NOT NULL)
- password (TEXT, NOT NULL)
- first_name (TEXT)
- middle_name (TEXT)
- last_name (TEXT)
- phone (TEXT)
- created_at (TIMESTAMP WITH TIME ZONE)
- updated_at (TIMESTAMP WITH TIME ZONE)

## Indexes Created
- `idx_project_users_email` - Fast email lookups
- `idx_project_users_status` - Filter by account status

## Triggers
- `update_project_users_updated_at` - Auto-updates `updated_at` on row changes

## How to Apply
Run the SQL file in your Supabase SQL Editor:
```sql
-- Execute this file
\i sql-query/add_profile_fields_to_project_users.sql
```

Or copy and paste the contents into Supabase Dashboard > SQL Editor > New Query

## Usage in Dashboard
The profile settings page (`accounts-section`) now collects and displays:
- User's email (read-only, from database)
- Public URL
- Bio/Description
- Profile picture upload
- Notification preferences
- Social media links

All data is saved to the `project_users` table when user clicks "Save changes".

## Security Notes
- Row Level Security (RLS) is enabled
- Users can only update their own profile
- Profile pictures are stored in Supabase Storage with proper access controls
- Passwords are hashed (never stored in plain text)

## Next Steps
1. Run the migration SQL file
2. Update JavaScript to save profile data to Supabase
3. Implement profile picture upload to Supabase Storage
4. Add validation for social media usernames
5. Sync theme preference with localStorage and database
