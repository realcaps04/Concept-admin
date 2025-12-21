-- Migration script to add 'category' column to 'project_suggestions' table

ALTER TABLE project_suggestions ADD COLUMN IF NOT EXISTS category TEXT;

-- Verify the column was added
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'project_suggestions' AND column_name = 'category') THEN
        RAISE EXCEPTION 'Column category was not added successfully';
    END IF;
END $$;
