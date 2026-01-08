-- Add phone column to Superadmin table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Superadmin' AND column_name = 'phone') THEN
        ALTER TABLE "Superadmin" ADD COLUMN "phone" TEXT;
    END IF;
END $$;
