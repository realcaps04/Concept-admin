-- Rename/Split columns query
-- 1. Drop the old 'name' column if it exists
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_users' AND column_name = 'name') THEN
        ALTER TABLE "project_users" DROP COLUMN "name";
    END IF;
END $$;

-- 2. Add the new columns if they do not exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_users' AND column_name = 'first_name') THEN
        ALTER TABLE "project_users" ADD COLUMN "first_name" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_users' AND column_name = 'middle_name') THEN
        ALTER TABLE "project_users" ADD COLUMN "middle_name" TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_users' AND column_name = 'last_name') THEN
        ALTER TABLE "project_users" ADD COLUMN "last_name" TEXT;
    END IF;
END $$;
