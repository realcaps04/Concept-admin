-- Add LinkedIn, Instagram, and WhatsApp fields to project_users table

-- Add LinkedIn username
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_users' AND column_name = 'linkedin_username') THEN
        ALTER TABLE "project_users" ADD COLUMN "linkedin_username" TEXT;
    END IF;
END $$;

-- Add Instagram username
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_users' AND column_name = 'instagram_username') THEN
        ALTER TABLE "project_users" ADD COLUMN "instagram_username" TEXT;
    END IF;
END $$;

-- Add WhatsApp number
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_users' AND column_name = 'whatsapp_number') THEN
        ALTER TABLE "project_users" ADD COLUMN "whatsapp_number" TEXT;
    END IF;
END $$;

-- Verify the new columns
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'project_users' 
  AND column_name IN ('linkedin_username', 'instagram_username', 'whatsapp_number')
ORDER BY column_name;
