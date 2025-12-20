-- Create a table for project suggestions
CREATE TABLE IF NOT EXISTS project_suggestions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_email TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE project_suggestions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to insert their own suggestions
CREATE POLICY "Users can insert their own suggestions"
ON project_suggestions FOR INSERT
WITH CHECK (auth.role() = 'anon'); 

-- Create policy to allow users to view their own suggestions
CREATE POLICY "Users can view their own suggestions"
ON project_suggestions FOR SELECT
USING (user_email = current_setting('request.jwt.claim.email', true));

-- (Optional) If you want real authentication, you'd link user_email to auth.users or project_users.
-- Since we are using a custom auth flow with 'project_users' table and localStorage,
-- we'll rely on the client sending the email.
-- For stricter security in a real app, we would use Supabase Auth properly.
-- ideally we should trust the client less, but for this demo this suffices.
