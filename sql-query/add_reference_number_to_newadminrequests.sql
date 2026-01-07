-- Add reference_number column to newadminrequests table
-- This allows tracking requests by their unique reference number

ALTER TABLE "newadminrequests"
ADD COLUMN IF NOT EXISTS reference_number TEXT;

-- Create index for faster lookups by reference number
CREATE INDEX IF NOT EXISTS idx_newadminrequests_reference_number 
ON "newadminrequests"(reference_number);

-- Add comment
COMMENT ON COLUMN "newadminrequests".reference_number IS 'Unique reference number for tracking requests (format: REF-YYYYMMDD-XXXXXX)';

