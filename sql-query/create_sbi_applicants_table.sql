-- Create SBI Applicants Table
CREATE TABLE IF NOT EXISTS sbi_applicants (
    id BIGSERIAL PRIMARY KEY,
    applicant_name TEXT NOT NULL,
    loan_type TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_sbi_applicants_status ON sbi_applicants(status);

-- Create index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_sbi_applicants_created_at ON sbi_applicants(created_at DESC);

-- Enable Row Level Security
ALTER TABLE sbi_applicants ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your security needs)
CREATE POLICY "Allow all operations on sbi_applicants" ON sbi_applicants
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sbi_applicants_updated_at
    BEFORE UPDATE ON sbi_applicants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
