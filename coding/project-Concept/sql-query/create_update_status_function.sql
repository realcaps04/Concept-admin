-- Create a secure function to update newadminrequests status
-- This function runs with SECURITY DEFINER to bypass RLS for authorized updates
-- Run this in Supabase SQL Editor

-- Step 1: Drop all existing versions of the function (with any signature)
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT oid::regprocedure AS func_signature
        FROM pg_proc
        WHERE proname = 'update_newadminrequest_status'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func_record.func_signature || ' CASCADE';
        RAISE NOTICE 'Dropped function: %', func_record.func_signature;
    END LOOP;
END $$;

-- Step 2: Create the new function
CREATE OR REPLACE FUNCTION update_newadminrequest_status(
    p_request_id UUID,
    p_new_status TEXT,
    p_admin_notes TEXT DEFAULT NULL,
    p_rejection_reason TEXT DEFAULT NULL,
    p_processed_by UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER  -- Runs with creator's privileges (bypasses RLS)
AS $$
DECLARE
    v_result JSON;
BEGIN
    -- Validate status value
    IF p_new_status NOT IN (
        'approval_pending',
        'approved', 
        'under_customization',
        'customization_complete',
        'in_progress',
        'rejected',
        'pending'
    ) THEN
        RAISE EXCEPTION 'Invalid status value: %', p_new_status;
    END IF;

    -- Prepare update data
    UPDATE "newadminrequests"
    SET 
        status = p_new_status,
        notes = p_admin_notes,
        updated_at = NOW(),
        rejection_reason = CASE 
            WHEN p_new_status = 'rejected' THEN p_rejection_reason
            ELSE NULL
        END,
        rejection_details = CASE 
            WHEN p_new_status = 'rejected' THEN p_rejection_reason
            ELSE NULL
        END,
        processed_at = CASE 
            WHEN p_new_status IN ('approved', 'rejected', 'customization_complete') THEN NOW()
            ELSE NULL
        END,
        processed_by = p_processed_by
    WHERE id = p_request_id;

    -- Check if update affected any rows
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Request not found with ID: %', p_request_id;
    END IF;

    -- Return success
    SELECT json_build_object(
        'success', true,
        'request_id', p_request_id,
        'new_status', p_new_status
    ) INTO v_result;

    RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_newadminrequest_status(UUID, TEXT, TEXT, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_newadminrequest_status(UUID, TEXT, TEXT, TEXT, UUID) TO anon;

-- Add comment
COMMENT ON FUNCTION update_newadminrequest_status IS 'Updates the status of a newadminrequest. Runs with SECURITY DEFINER to bypass RLS for authorized updates.';

-- Test the function (replace with actual IDs)
SELECT 'Function created successfully!' AS result;
SELECT 'To test: SELECT update_newadminrequest_status(''YOUR_REQUEST_ID'', ''approval_pending'', ''Test notes'', NULL, ''YOUR_ADMIN_ID'');' AS test_instruction;

