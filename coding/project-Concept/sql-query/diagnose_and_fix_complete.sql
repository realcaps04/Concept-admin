-- Complete diagnostic and fix for status update issue
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: Verify the constraint was fixed
-- ============================================
SELECT '=== Current Constraint ===' AS step;
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
-- STEP 2: Check RLS policies on UPDATE
-- ============================================
SELECT '=== RLS Policies for UPDATE ===' AS step;
SELECT 
    policyname,
    cmd AS command,
    qual AS using_expression,
    with_check AS with_check_expression,
    roles
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'newadminrequests'
    AND cmd = 'UPDATE';

-- ============================================
-- STEP 3: Test if the constraint actually allows approval_pending
-- ============================================
SELECT '=== Testing Constraint ===' AS step;
-- This should return 'allowed' if constraint works
SELECT 
    CASE 
        WHEN 'approval_pending' IN (
            SELECT unnest(string_to_array(
                substring(
                    pg_get_constraintdef(con.oid) 
                    FROM 'IN \(([^)]+)\)'
                ),
                ', '
            ))
            FROM pg_constraint con
            JOIN pg_class rel ON rel.oid = con.conrelid
            JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
            WHERE nsp.nspname = 'public'
                AND rel.relname = 'newadminrequests'
                AND pg_get_constraintdef(con.oid) LIKE '%status%'
                LIMIT 1
        ) THEN 'Status approval_pending is ALLOWED'
        ELSE 'Status approval_pending is NOT ALLOWED'
    END AS constraint_test;

-- ============================================
-- STEP 4: Temporarily disable RLS to test (ADMIN ONLY - be careful!)
-- ============================================
-- Uncomment only if you're an admin and want to test without RLS
-- ALTER TABLE "newadminrequests" DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 5: Ensure RLS policy allows the update properly
-- ============================================
SELECT '=== Fixing RLS Policy ===' AS step;

-- Drop the existing UPDATE policy
DROP POLICY IF EXISTS "Allow authenticated users to update newadminrequests" ON "newadminrequests";

-- Recreate it with explicit permissions
CREATE POLICY "Allow authenticated users to update newadminrequests"
ON "newadminrequests"
FOR UPDATE
TO authenticated
USING (true)  -- Allow update if user is authenticated
WITH CHECK (true);  -- Allow any value in the update

-- ============================================
-- STEP 6: Verify RLS is enabled and policy exists
-- ============================================
SELECT '=== Verifying RLS ===' AS step;
SELECT 
    relname AS table_name,
    relrowsecurity AS rls_enabled
FROM pg_class
WHERE relname = 'newadminrequests';

SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'newadminrequests'
    AND cmd = 'UPDATE';

-- ============================================
-- STEP 7: Final verification - try a test update (replace with real ID)
-- ============================================
SELECT '=== Ready for Testing ===' AS step;
SELECT 
    'To test, run this with a real ID:' AS instruction,
    'UPDATE "newadminrequests" SET status = ''approval_pending'', updated_at = NOW() WHERE id = ''YOUR_ID_HERE'' RETURNING id, status;' AS test_query;

