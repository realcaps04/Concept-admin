-- Test updating status directly in SQL to verify constraint and RLS work
-- Run this in Supabase SQL Editor

-- Step 1: Get a test record ID
SELECT 
    id,
    status AS current_status,
    admin_email,
    updated_at
FROM "newadminrequests"
ORDER BY requested_at DESC
LIMIT 1;

-- Step 2: Test update with that ID (replace 'YOUR_ID_HERE' with actual ID from Step 1)
-- Uncomment and run:
/*
UPDATE "newadminrequests" 
SET 
    status = 'approval_pending',
    updated_at = NOW(),
    notes = 'Test update from SQL',
    processed_at = NULL,
    rejection_reason = NULL
WHERE id = 'YOUR_ID_HERE'
RETURNING 
    id, 
    status, 
    updated_at, 
    notes;
*/

-- Step 3: Check what roles are available for the current user
SELECT 
    current_user AS current_db_user,
    session_user AS session_user,
    current_setting('role') AS current_role;

-- Step 4: Verify the constraint allows approval_pending
SELECT 
    'approval_pending' AS test_status,
    CASE 
        WHEN EXISTS (
            SELECT 1
            FROM pg_constraint con
            JOIN pg_class rel ON rel.oid = con.conrelid
            JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
            WHERE nsp.nspname = 'public'
                AND rel.relname = 'newadminrequests'
                AND pg_get_constraintdef(con.oid) LIKE '%approval_pending%'
        ) THEN 'Constraint allows approval_pending ✓'
        ELSE 'Constraint does NOT allow approval_pending ✗'
    END AS constraint_check;

