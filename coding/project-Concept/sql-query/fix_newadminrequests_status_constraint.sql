-- Fix status constraint and default value for newadminrequests table
-- This SQL ensures the status column accepts all required values and has no problematic default
-- Run this in Supabase SQL Editor

-- Step 1: Drop the existing check constraint if it exists
ALTER TABLE "newadminrequests" 
DROP CONSTRAINT IF EXISTS newadminrequests_status_check;

-- Step 2: Remove the default value constraint (if it's causing issues)
-- Note: We'll keep a default but only for NEW rows, not updates
ALTER TABLE "newadminrequests" 
ALTER COLUMN status DROP DEFAULT;

-- Step 3: Add new check constraint with ALL required status values
ALTER TABLE "newadminrequests"
ADD CONSTRAINT newadminrequests_status_check 
CHECK (status IN (
  'approval_pending',
  'approved', 
  'under_customization',
  'customization_complete',
  'in_progress',
  'rejected',
  'pending'
));

-- Step 4: Set a default value ONLY for new inserts (not updates)
ALTER TABLE "newadminrequests" 
ALTER COLUMN status SET DEFAULT 'approval_pending';

-- Step 5: Update the comment to reflect the new status values
COMMENT ON COLUMN "newadminrequests".status IS 'Current status of the request. Valid values: approval_pending, approved, under_customization, customization_complete, in_progress, rejected, pending';

-- Step 6: Verify the constraint was created correctly (this is just for verification, won't change anything)
-- You can run this query to verify:
-- SELECT 
--   conname AS constraint_name,
--   pg_get_constraintdef(oid) AS constraint_definition
-- FROM pg_constraint
-- WHERE conrelid = 'newadminrequests'::regclass
--   AND conname = 'newadminrequests_status_check';

-- Note: After running this migration, the status column will:
-- 1. Accept all the status values listed above
-- 2. Default to 'approval_pending' for new rows
-- 3. Allow updates to any valid status value without conversion

