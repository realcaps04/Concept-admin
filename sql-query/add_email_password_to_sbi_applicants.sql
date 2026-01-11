-- Migration: Add email and password columns to existing sbi_applicants table
-- Run this if you already created the table without email and password

-- Add email column (if not exists)
ALTER TABLE sbi_applicants 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Add password column (if not exists)
ALTER TABLE sbi_applicants 
ADD COLUMN IF NOT EXISTS password TEXT;

-- Make email unique (after adding the column)
ALTER TABLE sbi_applicants 
ADD CONSTRAINT sbi_applicants_email_unique UNIQUE (email);

-- Update existing records with dummy data (optional - only if you have existing records)
-- UPDATE sbi_applicants 
-- SET email = CONCAT('applicant', id, '@example.com'),
--     password = 'password123'
-- WHERE email IS NULL;

-- Make columns NOT NULL after populating data
ALTER TABLE sbi_applicants 
ALTER COLUMN email SET NOT NULL;

ALTER TABLE sbi_applicants 
ALTER COLUMN password SET NOT NULL;
