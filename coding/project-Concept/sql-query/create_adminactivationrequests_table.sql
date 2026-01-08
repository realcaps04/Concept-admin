-- Create Admin Activation Requests table for storing activation requests from inactive admins
-- Run this SQL in your Supabase SQL Editor
-- Note: This table references the "admin" table, so run create_admin_table.sql first

-- Create Admin Activation Requests table
CREATE TABLE IF NOT EXISTS "adminactivationrequests" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email TEXT NOT NULL,
  admin_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES "Superadmin"(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_adminactivationrequests_admin_email ON "adminactivationrequests"(admin_email);
CREATE INDEX IF NOT EXISTS idx_adminactivationrequests_status ON "adminactivationrequests"(status);
CREATE INDEX IF NOT EXISTS idx_adminactivationrequests_requested_at ON "adminactivationrequests"(requested_at);

-- Create trigger to automatically update updated_at for adminactivationrequests table
CREATE TRIGGER update_adminactivationrequests_updated_at
  BEFORE UPDATE ON "adminactivationrequests"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for adminactivationrequests table
ALTER TABLE "adminactivationrequests" ENABLE ROW LEVEL SECURITY;

-- Create policies for adminactivationrequests table
CREATE POLICY "Adminactivationrequests table is accessible via anon key for select"
  ON "adminactivationrequests"
  FOR SELECT
  USING (true);

CREATE POLICY "Adminactivationrequests table is accessible via anon key for insert"
  ON "adminactivationrequests"
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Adminactivationrequests table is accessible via anon key for update"
  ON "adminactivationrequests"
  FOR UPDATE
  USING (true);

CREATE POLICY "Adminactivationrequests table is accessible via anon key for delete"
  ON "adminactivationrequests"
  FOR DELETE
  USING (true);

