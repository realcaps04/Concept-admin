-- Fix RLS UPDATE policy for newadminrequests table
-- This ensures authenticated users can update status to approval_pending
-- Run this in Supabase SQL Editor

-- Step 1: Drop the existing UPDATE policy
DROP POLICY IF EXISTS "Allow authenticated users to update newadminrequests" ON "newadminrequests";

-- Step 2: Recreate the UPDATE policy with explicit permissions
-- This allows any authenticated user to update any row
CREATE POLICY "Allow authenticated users to update newadminrequests"
ON "newadminrequests"
FOR UPDATE
TO authenticated
USING (true)  -- Allow update if user is authenticated
WITH CHECK (true);  -- Allow any value in the update (including approval_pending)

-- Step 3: Verify the policy was created
SELECT 
    policyname,
    cmd AS command,
    roles,
    qual AS using_expression,
    with_check AS with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'newadminrequests'
    AND cmd = 'UPDATE';

-- Done! The UPDATE policy should now allow status updates including approval_pending

