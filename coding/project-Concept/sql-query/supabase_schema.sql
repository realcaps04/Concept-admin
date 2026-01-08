-- Create Superadmin table for managing super admin access
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS "Superadmin" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_superadmin_email ON "Superadmin"(email);

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_superadmin_updated_at
  BEFORE UPDATE ON "Superadmin"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE "Superadmin" ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow authenticated users to read their own data
-- Note: Adjust this policy based on your security requirements
CREATE POLICY "Superadmin table is accessible via anon key"
  ON "Superadmin"
  FOR SELECT
  USING (true);

CREATE POLICY "Superadmin table is accessible via anon key for insert"
  ON "Superadmin"
  FOR INSERT
  WITH CHECK (true);

-- Insert a default super admin (change password immediately!)
-- Password: admin123 (change this in production!)
INSERT INTO "Superadmin" (email, name, password, is_active)
VALUES ('superadmin@example.com', 'Super Admin', 'admin123', true)
ON CONFLICT (email) DO NOTHING;

-- Note: In production, you should hash passwords using bcrypt or similar
-- For now, this is a plain text password for testing purposes only

-- Create Admin table for managing admin accounts
CREATE TABLE IF NOT EXISTS "admin" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  pin TEXT,
  name TEXT,
  role TEXT DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_email ON "admin"(email);
CREATE INDEX IF NOT EXISTS idx_admin_username ON "admin"(username);

-- Create trigger to automatically update updated_at for admin table
CREATE TRIGGER update_admin_updated_at
  BEFORE UPDATE ON "admin"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for admin table
ALTER TABLE "admin" ENABLE ROW LEVEL SECURITY;

-- Create policies for admin table
CREATE POLICY "Admin table is accessible via anon key"
  ON "admin"
  FOR SELECT
  USING (true);

CREATE POLICY "Admin table is accessible via anon key for insert"
  ON "admin"
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin table is accessible via anon key for update"
  ON "admin"
  FOR UPDATE
  USING (true);

CREATE POLICY "Admin table is accessible via anon key for delete"
  ON "admin"
  FOR DELETE
  USING (true);

-- Create Forgot Password Request Admin table for storing password reset requests
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
