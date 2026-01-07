-- Create project_users table for user validation
CREATE TABLE IF NOT EXISTS "project_users" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  first_name TEXT,
  middle_name TEXT,
  last_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE "project_users" ENABLE ROW LEVEL SECURITY;

-- Allow public access for demonstration (adjust as needed for security)
CREATE POLICY "Public select" ON "project_users" FOR SELECT USING (true);
CREATE POLICY "Public insert" ON "project_users" FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON "project_users" FOR UPDATE USING (true);

-- Insert a test user
INSERT INTO "project_users" (email, password, first_name, middle_name, last_name) 
VALUES ('test@example.com', 'password123', 'Test', '', 'User')
ON CONFLICT (email) DO NOTHING;
