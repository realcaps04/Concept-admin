-- Helper Script to check for the existing user columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'project_users' 
  AND column_name IN ('first_name', 'middle_name', 'last_name');
