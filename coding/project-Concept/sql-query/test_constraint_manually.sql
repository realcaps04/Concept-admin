-- Test if the constraint allows approval_pending
-- Run this BEFORE the fix to see the problem, or AFTER to verify it's fixed
-- Replace 'YOUR_REQUEST_ID' with an actual ID from your table

-- First, get a test ID
SELECT 
    id,
    status AS current_status,
    admin_email
FROM "newadminrequests"
ORDER BY requested_at DESC
LIMIT 1;

-- Then use that ID in the test below (replace 'YOUR_REQUEST_ID_HERE')
-- Uncomment and run:

/*
-- Test 1: Try to update status to approval_pending
UPDATE "newadminrequests" 
SET status = 'approval_pending',
    updated_at = NOW()
WHERE id = 'YOUR_REQUEST_ID_HERE'
RETURNING id, status, updated_at;

-- Test 2: Check what the constraint currently allows
SELECT 
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
    AND rel.relname = 'newadminrequests'
    AND pg_get_constraintdef(con.oid) LIKE '%status%';
*/

