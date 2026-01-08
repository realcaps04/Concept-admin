-- Add rejection_details column to newadminrequests table
-- This column stores detailed rejection information
-- Run this SQL in Supabase SQL Editor

-- Add rejection_details column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'newadminrequests' 
        AND column_name = 'rejection_details'
    ) THEN
        ALTER TABLE "newadminrequests" 
        ADD COLUMN rejection_details TEXT;
        
        -- Add comment for documentation
        COMMENT ON COLUMN "newadminrequests".rejection_details IS 'Detailed rejection information and notes for rejected requests';
        
        RAISE NOTICE 'Column rejection_details added successfully';
    ELSE
        RAISE NOTICE 'Column rejection_details already exists';
    END IF;
END $$;

-- Create index for faster lookups on rejection_details (optional, useful if you search by this)
CREATE INDEX IF NOT EXISTS idx_newadminrequests_rejection_details 
ON "newadminrequests"(rejection_details) 
WHERE rejection_details IS NOT NULL;

