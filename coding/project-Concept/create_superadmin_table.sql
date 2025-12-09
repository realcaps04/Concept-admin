-- Create Superadmin table for managing super admin access
-- Run this SQL in your Supabase SQL Editor
-- This should be run FIRST as other tables may reference it

-- Create a function to update updated_at timestamp (shared utility function)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create Superadmin table
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

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_superadmin_updated_at
  BEFORE UPDATE ON "Superadmin"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE "Superadmin" ENABLE ROW LEVEL SECURITY;

-- Create policies for Superadmin table
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

