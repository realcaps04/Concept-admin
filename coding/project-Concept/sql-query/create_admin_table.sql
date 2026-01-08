-- Create Admin table for managing admin accounts
-- Run this SQL in your Supabase SQL Editor
-- Note: The update_updated_at_column() function should already exist from create_superadmin_table.sql

-- Create Admin table
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

