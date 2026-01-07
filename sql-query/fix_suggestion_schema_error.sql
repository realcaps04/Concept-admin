-- FIX: Add missing 'category' column to project_suggestions table
-- Run this script in your Supabase SQL Editor to resolve the 400 Bad Request error.

ALTER TABLE public.project_suggestions 
ADD COLUMN IF NOT EXISTS category TEXT;

-- Verify the column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'project_suggestions' AND column_name = 'category';
