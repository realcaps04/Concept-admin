-- FINAL FIX: Complete solution for status constraint issue
-- This handles all possible causes: constraints, defaults, and triggers
-- Run this in Supabase SQL Editor

BEGIN;

-- ============================================
-- Step 1: Show current state (for reference)
-- ============================================
SELECT '=== Current Constraint ===' AS info;
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
-- Step 2: Drop ALL possible status constraints
-- ============================================
SELECT '=== Dropping Constraints ===' AS info;
ALTER TABLE "newadminrequests" DROP CONSTRAINT IF EXISTS newadminrequests_status_check;
ALTER TABLE "newadminrequests" DROP CONSTRAINT IF EXISTS newadminrequests_status_check1;
ALTER TABLE "newadminrequests" DROP CONSTRAINT IF EXISTS check_status;
ALTER TABLE "newadminrequests" DROP CONSTRAINT IF EXISTS status_check;

-- Drop constraint by checking its definition (more reliable)
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
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
        EXECUTE 'ALTER TABLE "newadminrequests" DROP CONSTRAINT IF EXISTS ' || quote_ident(constraint_name);
        RAISE NOTICE 'Dropped constraint: %', constraint_name;
    END LOOP;
END $$;

-- ============================================
-- Step 3: Remove default value completely
-- ============================================
SELECT '=== Removing Default Value ===' AS info;
ALTER TABLE "newadminrequests" ALTER COLUMN status DROP DEFAULT;

-- ============================================
-- Step 4: Check if any existing data needs migration
-- ============================================
SELECT '=== Checking Existing Data ===' AS info;
SELECT 
    status,
    COUNT(*) AS count
FROM "newadminrequests"
GROUP BY status
ORDER BY status;

-- ============================================
-- Step 5: Add the new constraint with ALL valid status values
-- ============================================
SELECT '=== Adding New Constraint ===' AS info;
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
-- Step 6: Set default ONLY for new inserts (this won't affect updates)
-- ============================================
SELECT '=== Setting Default for New Inserts ===' AS info;
ALTER TABLE "newadminrequests" 
ALTER COLUMN status SET DEFAULT 'approval_pending';

-- ============================================
-- Step 7: Verify the constraint was created
-- ============================================
SELECT '=== Verifying New Constraint ===' AS info;
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
-- Step 8: Test that the constraint works by checking existing data
-- ============================================
SELECT '=== Testing Constraint with Existing Data ===' AS info;
DO $$
DECLARE
    invalid_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO invalid_count
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
    
    IF invalid_count > 0 THEN
        RAISE NOTICE 'WARNING: Found % rows with invalid status values. These need to be fixed.', invalid_count;
        RAISE NOTICE 'Run: UPDATE "newadminrequests" SET status = ''approval_pending'' WHERE status NOT IN (''approval_pending'', ''approved'', ''under_customization'', ''customization_complete'', ''in_progress'', ''rejected'', ''pending'');';
    ELSE
        RAISE NOTICE 'SUCCESS: All existing data is valid!';
    END IF;
END $$;

-- ============================================
-- Step 9: Update comment
-- ============================================
COMMENT ON COLUMN "newadminrequests".status IS 'Current status of the request. Valid values: approval_pending (default), approved, under_customization, customization_complete, in_progress, rejected, pending. Default only applies to new inserts, not updates.';

COMMIT;

-- ============================================
-- Final verification query (run this after)
-- ============================================
SELECT '=== FINAL VERIFICATION ===' AS info;
SELECT 
    'Constraint Check' AS check_type,
    con.conname AS name,
    pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
    AND rel.relname = 'newadminrequests'
    AND pg_get_constraintdef(con.oid) LIKE '%status%'

UNION ALL

SELECT 
    'Default Value' AS check_type,
    'status' AS name,
    COALESCE(pg_get_expr(d.adbin, d.adrelid), 'NULL') AS definition
FROM pg_attribute a
JOIN pg_class c ON c.oid = a.attrelid
LEFT JOIN pg_attrdef d ON d.adrelid = c.oid AND d.adnum = a.attnum
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
    AND c.relname = 'newadminrequests'
    AND a.attname = 'status'
    AND a.attnum > 0
    AND NOT a.attisdropped;

