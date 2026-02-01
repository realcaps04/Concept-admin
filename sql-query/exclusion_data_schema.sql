-- Table for managing excluded sanction records
CREATE TABLE sanction_exclusions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    record_id UUID NOT NULL,
    table_name TEXT NOT NULL, -- 'reports' or 'recovery_reports'
    reason TEXT NOT NULL,
    pdf_url TEXT, -- Path to the uploaded PDF in Supabase Storage
    member_employee_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE sanction_exclusions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public select on sanction_exclusions" ON sanction_exclusions FOR SELECT USING (true);
CREATE POLICY "Allow public insert on sanction_exclusions" ON sanction_exclusions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on sanction_exclusions" ON sanction_exclusions FOR UPDATE USING (true);
