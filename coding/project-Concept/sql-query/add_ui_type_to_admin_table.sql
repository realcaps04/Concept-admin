-- Add ui_type column to admin table
-- This column stores the UI type selected for the admin (e.g., 'private', 'government', 'hospital', etc.)

ALTER TABLE admin
ADD COLUMN IF NOT EXISTS ui_type TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN admin.ui_type IS 'UI type assigned to the admin (e.g., private, government, hospital, etc.)';

-- Optional: Add a CHECK constraint to ensure only valid UI types are stored
-- Uncomment the following if you want to enforce valid UI types:
/*
ALTER TABLE admin
ADD CONSTRAINT check_ui_type CHECK (ui_type IN (
  'government',
  'private',
  'mobile_shop',
  'court',
  'college_school',
  'hospital',
  'bank',
  'restaurant',
  'retail',
  'ngo',
  'hotel',
  'pharmacy'
) OR ui_type IS NULL);
*/

