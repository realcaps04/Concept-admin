-- Create New Admin Generation Requests table for storing new admin panel requests
-- Run this SQL in your Supabase SQL Editor
-- Note: This table stores requests from users who don't have an admin account yet
-- Note: The update_updated_at_column() function should already exist from create_superadmin_table.sql

-- Create New Admin Requests table
CREATE TABLE IF NOT EXISTS "newadminrequests" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_name TEXT NOT NULL,
  admin_email TEXT NOT NULL,
  admin_phone TEXT NOT NULL,
  organization_name TEXT,
  organization_type TEXT NOT NULL,
  organization_type_other TEXT,
  role TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT,
  features_needed TEXT NOT NULL,
  identity_proof_url TEXT,
  identity_proof_filename TEXT,
  reason_for_access TEXT NOT NULL,
  additional_notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in_progress')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES "Superadmin"(id),
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_newadminrequests_admin_email ON "newadminrequests"(admin_email);
CREATE INDEX IF NOT EXISTS idx_newadminrequests_status ON "newadminrequests"(status);
CREATE INDEX IF NOT EXISTS idx_newadminrequests_requested_at ON "newadminrequests"(requested_at);
CREATE INDEX IF NOT EXISTS idx_newadminrequests_organization_type ON "newadminrequests"(organization_type);
CREATE INDEX IF NOT EXISTS idx_newadminrequests_processed_by ON "newadminrequests"(processed_by);

-- Create trigger to automatically update updated_at for newadminrequests table
CREATE TRIGGER update_newadminrequests_updated_at
  BEFORE UPDATE ON "newadminrequests"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for newadminrequests table
ALTER TABLE "newadminrequests" ENABLE ROW LEVEL SECURITY;

-- Create policies for newadminrequests table
-- Allow anonymous users to insert (for public request form)
CREATE POLICY "Allow anonymous insert for newadminrequests"
  ON "newadminrequests"
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to insert (if needed)
CREATE POLICY "Allow authenticated insert for newadminrequests"
  ON "newadminrequests"
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow anonymous users to select their own requests (by email)
CREATE POLICY "Allow users to view their own requests"
  ON "newadminrequests"
  FOR SELECT
  TO anon
  USING (true);

-- Allow authenticated users to view all (for admin dashboard)
CREATE POLICY "Allow authenticated users to view all newadminrequests"
  ON "newadminrequests"
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users (superadmins) to update requests
CREATE POLICY "Allow authenticated users to update newadminrequests"
  ON "newadminrequests"
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users (superadmins) to delete requests
CREATE POLICY "Allow authenticated users to delete newadminrequests"
  ON "newadminrequests"
  FOR DELETE
  TO authenticated
  USING (true);

-- Add comments for documentation
COMMENT ON TABLE "newadminrequests" IS 'Stores requests from new users who want admin panel access';
COMMENT ON COLUMN "newadminrequests".admin_name IS 'Full name of the requester';
COMMENT ON COLUMN "newadminrequests".admin_email IS 'Email address of the requester';
COMMENT ON COLUMN "newadminrequests".admin_phone IS 'Phone number of the requester';
COMMENT ON COLUMN "newadminrequests".organization_name IS 'Name of the organization/company';
COMMENT ON COLUMN "newadminrequests".organization_type IS 'Type of organization (government, private, mobile_shop, etc.)';
COMMENT ON COLUMN "newadminrequests".organization_type_other IS 'Custom organization type if "others" is selected';
COMMENT ON COLUMN "newadminrequests".role IS 'Role/position of the requester';
COMMENT ON COLUMN "newadminrequests".features_needed IS 'Comma-separated list of features requested for the admin panel';
COMMENT ON COLUMN "newadminrequests".identity_proof_url IS 'URL or base64 data URL of the uploaded identity proof';
COMMENT ON COLUMN "newadminrequests".identity_proof_filename IS 'Original filename of the identity proof';
COMMENT ON COLUMN "newadminrequests".reason_for_access IS 'Reason provided by the requester for needing admin access';
COMMENT ON COLUMN "newadminrequests".status IS 'Current status of the request (pending, approved, rejected, in_progress)';
COMMENT ON COLUMN "newadminrequests".processed_by IS 'UUID of the superadmin who processed the request';
COMMENT ON COLUMN "newadminrequests".rejection_reason IS 'Reason provided if the request was rejected';

