-- Add admin details and identity proof fields to adminactivationrequests table
-- Run this SQL in your Supabase SQL Editor

-- Add columns for admin details and identity proof
ALTER TABLE "adminactivationrequests" 
ADD COLUMN IF NOT EXISTS admin_phone TEXT,
ADD COLUMN IF NOT EXISTS admin_address TEXT,
ADD COLUMN IF NOT EXISTS admin_city TEXT,
ADD COLUMN IF NOT EXISTS admin_state TEXT,
ADD COLUMN IF NOT EXISTS admin_zip_code TEXT,
ADD COLUMN IF NOT EXISTS admin_country TEXT,
ADD COLUMN IF NOT EXISTS identity_proof_url TEXT,
ADD COLUMN IF NOT EXISTS identity_proof_filename TEXT,
ADD COLUMN IF NOT EXISTS additional_notes TEXT;

-- Create index on identity_proof_url for faster lookups (optional)
CREATE INDEX IF NOT EXISTS idx_adminactivationrequests_identity_proof ON "adminactivationrequests"(identity_proof_url) WHERE identity_proof_url IS NOT NULL;

