-- Test query to verify status updates work correctly
-- Run this AFTER applying the fix to test if the constraint is working

-- ============================================
-- Test 1: Check if we can select a test record
-- ============================================
SELECT 
    id,
    status AS current_status,
    admin_email
FROM "newadminrequests"
ORDER BY requested_at DESC
LIMIT 1;

-- ============================================
-- Test 2: Try to update status (replace 'YOUR_RECORD_ID' with actual ID from Test 1)
-- ============================================
-- Uncomment and run this with a real ID to test:
/*
UPDATE "newadminrequests" 
SET status = 'approval_pending',
    updated_at = NOW()
WHERE id = 'YOUR_RECORD_ID_HERE'
RETURNING id, status, updated_at;
*/

-- ============================================
-- Test 3: Check if constraint allows approval_pending
-- ============================================
-- This should return no error if constraint is correct
SELECT 
    'approval_pending'::text AS test_status,
    CASE 
        WHEN 'approval_pending' IN (
            'approval_pending',
            'approved', 
            'under_customization',
            'customization_complete',
            'in_progress',
            'rejected',
            'pending'
        ) THEN 'Status is allowed by constraint'
        ELSE 'Status would be REJECTED'
    END AS constraint_check;

-- ============================================
-- Test 4: Verify what status values are currently in the table
-- ============================================
SELECT 
    status,
    COUNT(*) AS count,
    CASE 
        WHEN status IN (
            'approval_pending',
            'approved', 
            'under_customization',
            'customization_complete',
            'in_progress',
            'rejected',
            'pending'
        ) THEN 'Valid'
        ELSE 'INVALID - needs migration'
    END AS validation_status
FROM "newadminrequests"
GROUP BY status
ORDER BY status;

