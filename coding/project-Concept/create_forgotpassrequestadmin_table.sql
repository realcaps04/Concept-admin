-- Create Forgot Password Request Admin table for storing password reset requests
-- Run this SQL in your Supabase SQL Editor
-- Note: This table references both "admin" and "Superadmin" tables, so run those first
-- Note: The update_updated_at_column() function should already exist from create_superadmin_table.sql

-- Create Forgot Password Request Admin table
CREATE TABLE IF NOT EXISTS "forgotpassrequestadmin" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES "admin"(id) ON DELETE CASCADE,
  admin_email TEXT NOT NULL,
  admin_username TEXT,
  admin_name TEXT,
  reason TEXT,
  delivery_method TEXT NOT NULL CHECK (delivery_method IN ('email', 'sms', 'email_sms', 'secure_message')),
  id_proof_url TEXT,
  id_proof_filename TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES "Superadmin"(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_forgotpassrequestadmin_admin_id ON "forgotpassrequestadmin"(admin_id);
CREATE INDEX IF NOT EXISTS idx_forgotpassrequestadmin_admin_email ON "forgotpassrequestadmin"(admin_email);
CREATE INDEX IF NOT EXISTS idx_forgotpassrequestadmin_status ON "forgotpassrequestadmin"(status);
CREATE INDEX IF NOT EXISTS idx_forgotpassrequestadmin_requested_at ON "forgotpassrequestadmin"(requested_at);

-- Create trigger to automatically update updated_at for forgotpassrequestadmin table
CREATE TRIGGER update_forgotpassrequestadmin_updated_at
  BEFORE UPDATE ON "forgotpassrequestadmin"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for forgotpassrequestadmin table
ALTER TABLE "forgotpassrequestadmin" ENABLE ROW LEVEL SECURITY;

-- Create policies for forgotpassrequestadmin table
CREATE POLICY "Forgotpassrequestadmin table is accessible via anon key for select"
  ON "forgotpassrequestadmin"
  FOR SELECT
  USING (true);

CREATE POLICY "Forgotpassrequestadmin table is accessible via anon key for insert"
  ON "forgotpassrequestadmin"
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Forgotpassrequestadmin table is accessible via anon key for update"
  ON "forgotpassrequestadmin"
  FOR UPDATE
  USING (true);

CREATE POLICY "Forgotpassrequestadmin table is accessible via anon key for delete"
  ON "forgotpassrequestadmin"
  FOR DELETE
  USING (true);

