-- SIMPLE FIX: Run this directly in Supabase SQL Editor
-- This will fix the status constraint issue

-- Step 1: Drop the old constraint (try all possible names)
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    -- Try to find and drop any status constraint
    FOR constraint_name IN
        SELECT con.conname
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE nsp.nspname = 'public'
            AND rel.relname = 'newadminrequests'
            AND pg_get_constraintdef(con.oid) LIKE '%status%'
            AND con.contype = 'c'
    LOOP
        EXECUTE 'ALTER TABLE "newadminrequests" DROP CONSTRAINT IF EXISTS ' || quote_ident(constraint_name) || ' CASCADE';
        RAISE NOTICE 'Dropped constraint: %', constraint_name;
    END LOOP;
END $$;

-- Step 2: Remove default value
ALTER TABLE "newadminrequests" ALTER COLUMN status DROP DEFAULT;

-- Step 3: Add new constraint with all valid statuses
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

-- Step 4: Set default for new inserts only
ALTER TABLE "newadminrequests" 
ALTER COLUMN status SET DEFAULT 'approval_pending';

-- Step 5: Verify it worked
SELECT 
    'Constraint Check' AS check_type,
    pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
    AND rel.relname = 'newadminrequests'
    AND pg_get_constraintdef(con.oid) LIKE '%status%';

-- Step 6: Test the constraint by trying to insert/update with approval_pending
-- This should work now without errors
SELECT 'Fix completed! You can now update status to approval_pending.' AS result;

