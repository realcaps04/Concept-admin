-- Check if the issue is with authentication/RLS
-- Run this to understand why updates might be blocked

-- Check RLS status
SELECT 
    relname AS table_name,
    relrowsecurity AS rls_enabled,
    relforcerowsecurity AS rls_forced
FROM pg_class
WHERE relname = 'newadminrequests';

-- Check all policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd AS command,
    qual AS using_clause,
    with_check AS with_check_clause
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'newadminrequests'
ORDER BY cmd, policyname;

-- Check if service role would bypass RLS (for testing only)
-- This is just to verify the constraint works, NOT for production use
SELECT 'To test if constraint works, temporarily disable RLS:' AS note,
       'ALTER TABLE "newadminrequests" DISABLE ROW LEVEL SECURITY;' AS test_command;

-- Check constraint definition one more time
SELECT 
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid, true) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
    AND rel.relname = 'newadminrequests'
    AND pg_get_constraintdef(con.oid) LIKE '%status%';

