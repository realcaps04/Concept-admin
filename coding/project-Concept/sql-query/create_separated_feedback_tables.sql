-- Create individual tables for each feedback type if strict separation is required
-- Although we are using a single table 'project_suggestions' with a 'category' discriminator for the app logic,
-- we provide these definitions in case they are needed for future migration or strict data separation policies.

-- Table for Bug Reports
CREATE TABLE IF NOT EXISTS project_bugs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_email TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Table for Issues
CREATE TABLE IF NOT EXISTS project_issues (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_email TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Table for Reports
CREATE TABLE IF NOT EXISTS project_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_email TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Table for General Feedback/Others
CREATE TABLE IF NOT EXISTS project_others (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_email TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Note: The current application logic writes to 'project_suggestions' with a 'category' column.
-- To use these specific tables, one would need to update the Supabase insert logic in users-dashboard.html
-- to select the target table based on the category.
