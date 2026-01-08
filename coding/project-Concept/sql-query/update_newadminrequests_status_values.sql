-- Update status values for newadminrequests table
-- Add new status options for better workflow management

-- Drop the existing check constraint
ALTER TABLE "newadminrequests" 
DROP CONSTRAINT IF EXISTS newadminrequests_status_check;

-- Add new check constraint with expanded status values
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

-- Update existing 'pending' status to 'approval_pending' if needed
-- Uncomment the line below if you want to migrate existing 'pending' statuses to 'approval_pending'
-- UPDATE "newadminrequests" SET status = 'approval_pending' WHERE status = 'pending';

-- Add comment
COMMENT ON COLUMN "newadminrequests".status IS 'Current status of the request (approval_pending, approved, under_customization, customization_complete, in_progress, rejected, pending)';

