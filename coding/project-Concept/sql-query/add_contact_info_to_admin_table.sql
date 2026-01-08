-- Add contact info columns to admin table
-- Run this SQL in your Supabase SQL Editor

-- Add contact information columns to admin table
ALTER TABLE "admin" 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS country TEXT;

-- Create index on phone for faster lookups (optional)
CREATE INDEX IF NOT EXISTS idx_admin_phone ON "admin"(phone) WHERE phone IS NOT NULL;

