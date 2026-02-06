-- Drop the old table to replace with a more granular one
DROP TABLE IF EXISTS daily_commitments;

-- Table for Granular Daily Commitments
CREATE TABLE daily_commitments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID REFERENCES fos_members(id),
    member_name TEXT NOT NULL,
    member_employee_id TEXT NOT NULL,
    branch_name TEXT NOT NULL,
    scheme_name TEXT NOT NULL, -- KCC New, KCC Renewal, PMMY, SME, Others
    num_files INTEGER DEFAULT 0,
    total_value DECIMAL(15, 2) DEFAULT 0.00,
    commitment_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE daily_commitments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow members to insert their own entries" 
ON daily_commitments FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow members to view their own entries" 
ON daily_commitments FOR SELECT 
USING (true);

CREATE POLICY "Allow members to update their own entries" 
ON daily_commitments FOR UPDATE 
USING (true);

CREATE POLICY "Allow members to delete their own entries" 
ON daily_commitments FOR DELETE 
USING (true);
