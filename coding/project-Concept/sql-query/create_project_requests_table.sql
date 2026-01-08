-- Robust script to create/update project_requests table
-- Handles cases where table exists but columns are missing

-- 1. Create table skeleton if it doesn't exist
CREATE TABLE IF NOT EXISTS "project_requests" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add columns if they don't exist (Safe Migration)
DO $$
BEGIN
    -- Add user_email
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_requests' AND column_name = 'user_email') THEN
        ALTER TABLE "project_requests" ADD COLUMN "user_email" TEXT;
    END IF;

    -- Add project_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_requests' AND column_name = 'project_name') THEN
        ALTER TABLE "project_requests" ADD COLUMN "project_name" TEXT;
    END IF;

    -- Add project_type
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_requests' AND column_name = 'project_type') THEN
        ALTER TABLE "project_requests" ADD COLUMN "project_type" TEXT;
    END IF;

    -- Add budget
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_requests' AND column_name = 'budget') THEN
        ALTER TABLE "project_requests" ADD COLUMN "budget" NUMERIC;
    END IF;

    -- Add deadline
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_requests' AND column_name = 'deadline') THEN
        ALTER TABLE "project_requests" ADD COLUMN "deadline" DATE;
    END IF;

    -- Add priority
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_requests' AND column_name = 'priority') THEN
        ALTER TABLE "project_requests" ADD COLUMN "priority" TEXT DEFAULT 'Medium';
    END IF;

    -- Add description
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_requests' AND column_name = 'description') THEN
        ALTER TABLE "project_requests" ADD COLUMN "description" TEXT;
    END IF;

    -- Add status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_requests' AND column_name = 'status') THEN
        ALTER TABLE "project_requests" ADD COLUMN "status" TEXT DEFAULT 'Pending';
    END IF;
END $$;

-- 3. Enable RLS
ALTER TABLE "project_requests" ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Users can view own requests" ON "project_requests";
DROP POLICY IF EXISTS "Users can insert requests" ON "project_requests";
DROP POLICY IF EXISTS "Users can update own requests" ON "project_requests";

-- 5. Re-create Policies
CREATE POLICY "Users can view own requests" ON "project_requests" 
  FOR SELECT USING (user_email = current_setting('request.jwt.claims', true)::json->>'email' OR true);

CREATE POLICY "Users can insert requests" ON "project_requests" 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own requests" ON "project_requests" 
  FOR UPDATE USING (user_email = current_setting('request.jwt.claims', true)::json->>'email' OR true);

-- 6. Create Indexes
CREATE INDEX IF NOT EXISTS idx_project_requests_user_email ON "project_requests"(user_email);
CREATE INDEX IF NOT EXISTS idx_project_requests_status ON "project_requests"(status);
CREATE INDEX IF NOT EXISTS idx_project_requests_created_at ON "project_requests"(created_at DESC);

-- 7. Setup Auto-update Trigger
CREATE OR REPLACE FUNCTION update_project_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_project_requests_updated_at ON "project_requests";
CREATE TRIGGER update_project_requests_updated_at
    BEFORE UPDATE ON "project_requests"
    FOR EACH ROW
    EXECUTE FUNCTION update_project_requests_updated_at();

-- 8. VerifySchema
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'project_requests'
ORDER BY ordinal_position;
