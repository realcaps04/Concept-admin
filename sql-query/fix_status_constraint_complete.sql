-- Complete fix for newadminrequests status constraint issue
-- This will ensure the status column works correctly
-- Run this in Supabase SQL Editor

-- ============================================
-- Step 1: Check current constraint (for reference)
-- ============================================
SELECT 
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
    AND rel.relname = 'newadminrequests'
    AND pg_get_constraintdef(con.oid) LIKE '%status%';

-- ============================================
-- Step 2: Drop the existing status constraint
-- ============================================
ALTER TABLE "newadminrequests" 
DROP CONSTRAINT IF EXISTS newadminrequests_status_check;

-- Also try dropping with different possible names
ALTER TABLE "newadminrequests" 
DROP CONSTRAINT IF EXISTS newadminrequests_status_check1;

ALTER TABLE "newadminrequests" 
DROP CONSTRAINT IF EXISTS check_status;

-- ============================================
-- Step 3: Remove the default value from status column
-- This is important - defaults can interfere with updates
-- ============================================
ALTER TABLE "newadminrequests" 
ALTER COLUMN status DROP DEFAULT;

-- ============================================
-- Step 4: Add the new constraint with ALL required status values
-- ============================================
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

-- ============================================
-- Step 5: Set a default value ONLY for new inserts (not updates)
-- This default only applies when inserting new rows, not when updating
-- ============================================
ALTER TABLE "newadminrequests" 
ALTER COLUMN status SET DEFAULT 'approval_pending';

-- ============================================
-- Step 6: Update the column comment
-- ============================================
COMMENT ON COLUMN "newadminrequests".status IS 'Current status of the request. Valid values: approval_pending, approved, under_customization, customization_complete, in_progress, rejected, pending';

-- ============================================
-- Step 7: Verify the constraint was created correctly
-- ============================================
SELECT 
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
    AND rel.relname = 'newadminrequests'
    AND pg_get_constraintdef(con.oid) LIKE '%status%';

-- ============================================
-- Step 8: Test the constraint (should return no rows if constraint is correct)
-- ============================================
-- This query will fail if any existing data violates the new constraint
SELECT 
    id,
    status,
    'Invalid status - violates constraint' AS error
FROM "newadminrequests"
WHERE status NOT IN (
  'approval_pending',
  'approved', 
  'under_customization',
  'customization_complete',
  'in_progress',
  'rejected',
  'pending'
);

-- If the above returns any rows, update them to a valid status first:
-- UPDATE "newadminrequests" SET status = 'approval_pending' WHERE status NOT IN ('approval_pending', 'approved', 'under_customization', 'customization_complete', 'in_progress', 'rejected', 'pending');

-- ============================================
-- Step 9: Check the default value
-- ============================================
SELECT 
    column_name,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'newadminrequests'
    AND column_name = 'status';

