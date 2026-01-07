-- Add profile fields to project_users table for comprehensive user profile management
-- This script adds fields for bio, social media, profile picture, and notification preferences

-- Add bio/description field
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_users' AND column_name = 'bio') THEN
        ALTER TABLE "project_users" ADD COLUMN "bio" TEXT;
    END IF;
END $$;

-- Add profile picture URL field
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_users' AND column_name = 'profile_picture_url') THEN
        ALTER TABLE "project_users" ADD COLUMN "profile_picture_url" TEXT;
    END IF;
END $$;

-- Add public URL field (e.g., GitHub, personal website)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_users' AND column_name = 'public_url') THEN
        ALTER TABLE "project_users" ADD COLUMN "public_url" TEXT;
    END IF;
END $$;

-- Add social media fields
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_users' AND column_name = 'facebook_username') THEN
        ALTER TABLE "project_users" ADD COLUMN "facebook_username" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_users' AND column_name = 'twitter_username') THEN
        ALTER TABLE "project_users" ADD COLUMN "twitter_username" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_users' AND column_name = 'discord_username') THEN
        ALTER TABLE "project_users" ADD COLUMN "discord_username" TEXT;
    END IF;
END $$;

-- Add notification preferences
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_users' AND column_name = 'notif_reports') THEN
        ALTER TABLE "project_users" ADD COLUMN "notif_reports" BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_users' AND column_name = 'notif_shared') THEN
        ALTER TABLE "project_users" ADD COLUMN "notif_shared" BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Add theme preference for dark mode
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_users' AND column_name = 'theme_preference') THEN
        ALTER TABLE "project_users" ADD COLUMN "theme_preference" TEXT DEFAULT 'light';
    END IF;
END $$;

-- Add last login timestamp
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_users' AND column_name = 'last_login') THEN
        ALTER TABLE "project_users" ADD COLUMN "last_login" TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Add account status field
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_users' AND column_name = 'account_status') THEN
        ALTER TABLE "project_users" ADD COLUMN "account_status" TEXT DEFAULT 'active';
    END IF;
END $$;

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_project_users_email ON "project_users"(email);

-- Create index on account_status for filtering
CREATE INDEX IF NOT EXISTS idx_project_users_status ON "project_users"(account_status);

-- Update the updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_project_users_updated_at ON "project_users";
CREATE TRIGGER update_project_users_updated_at
    BEFORE UPDATE ON "project_users"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the new columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'project_users'
ORDER BY ordinal_position;
