-- Add document columns to sbi_applicants table
ALTER TABLE sbi_applicants
ADD COLUMN IF NOT EXISTS doc_class_10 TEXT,
ADD COLUMN IF NOT EXISTS doc_class_12 TEXT,
ADD COLUMN IF NOT EXISTS doc_admission TEXT,
ADD COLUMN IF NOT EXISTS doc_fee TEXT,
ADD COLUMN IF NOT EXISTS doc_aadhaar_student TEXT,
ADD COLUMN IF NOT EXISTS doc_aadhaar_coapplicant TEXT,
ADD COLUMN IF NOT EXISTS doc_pan_student TEXT,
ADD COLUMN IF NOT EXISTS doc_pan_coapplicant TEXT,
ADD COLUMN IF NOT EXISTS doc_income_coapplicant TEXT,
ADD COLUMN IF NOT EXISTS doc_photo_student TEXT,
ADD COLUMN IF NOT EXISTS doc_photo_coapplicant TEXT,
ADD COLUMN IF NOT EXISTS doc_photo_guarantor TEXT;
