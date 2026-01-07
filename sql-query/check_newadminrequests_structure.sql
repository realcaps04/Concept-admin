-- Diagnostic queries to check the current structure of newadminrequests table
-- Run these queries in Supabase SQL Editor to see the current state

-- ============================================
-- 1. Check the table structure and columns
-- ============================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'newadminrequests'
ORDER BY ordinal_position;

-- ============================================
-- 2. Check all constraints on the table
-- ============================================
SELECT 
    con.conname AS constraint_name,
    con.contype AS constraint_type,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
    AND rel.relname = 'newadminrequests'
ORDER BY con.contype, con.conname;

-- ============================================
-- 3. Specifically check the status column constraint
-- ============================================
SELECT 
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition,
    CASE con.contype
        WHEN 'c' THEN 'Check constraint'
        WHEN 'p' THEN 'Primary key'
        WHEN 'f' THEN 'Foreign key'
        WHEN 'u' THEN 'Unique'
        WHEN 't' THEN 'Trigger'
        ELSE 'Other'
    END AS constraint_type
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
    AND rel.relname = 'newadminrequests'
    AND (pg_get_constraintdef(con.oid) LIKE '%status%' 
         OR con.conname LIKE '%status%');

-- ============================================
-- 4. Check for triggers on the table
-- ============================================
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_schema = 'public'
    AND event_object_table = 'newadminrequests';

-- ============================================
-- 5. Check current status values in the table
-- ============================================
SELECT 
    status,
    COUNT(*) AS count
FROM "newadminrequests"
GROUP BY status
ORDER BY status;

-- ============================================
-- 6. Get a sample of recent records with their status
-- ============================================
SELECT 
    id,
    admin_email,
    status,
    requested_at,
    updated_at,
    processed_at
FROM "newadminrequests"
ORDER BY requested_at DESC
LIMIT 10;

-- ============================================
-- 7. Check if there's a default value on status column
-- ============================================
SELECT 
    column_name,
    column_default,
    is_nullable,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'newadminrequests'
    AND column_name = 'status';

-- ============================================
-- 8. Check Row Level Security (RLS) policies
-- ============================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'newadminrequests';

-- ============================================
-- 9. Try to see what happens when we try to update (dry run - won't actually update)
-- This will show if there's a trigger or function that modifies the status
-- ============================================
-- Note: Replace 'YOUR_REQUEST_ID_HERE' with an actual ID from the table
/*
SELECT 
    id,
    status AS current_status,
    'approval_pending' AS attempted_status,
    CASE 
        WHEN 'approval_pending' IN ('approval_pending', 'approved', 'under_customization', 'customization_complete', 'in_progress', 'rejected', 'pending') 
        THEN 'Status would be allowed by constraint'
        ELSE 'Status would be REJECTED by constraint'
    END AS constraint_check
FROM "newadminrequests"
WHERE id = 'YOUR_REQUEST_ID_HERE';
*/

