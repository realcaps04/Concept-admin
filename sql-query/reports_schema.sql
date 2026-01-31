-- Table for general reports (KCC, PMMY, SME, SHG, PMEGP, PMFME, SWAYAMSIDHA, AEL, RACC)
CREATE TABLE reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_type TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    loan_amount DECIMAL(15, 2) NOT NULL,
    loan_type TEXT,
    member_name TEXT,
    member_employee_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for Recovery reports (NPA-AUCA)
CREATE TABLE recovery_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    applicant_name TEXT NOT NULL,
    account_name TEXT NOT NULL,
    account_no TEXT NOT NULL,
    amount_received DECIMAL(15, 2) NOT NULL,
    member_name TEXT,
    member_employee_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_reports ENABLE ROW LEVEL SECURITY;

-- Create policies (Allowing anon insert for demo purposes, adjust as needed)
CREATE POLICY "Allow public insert on reports" ON reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on recovery_reports" ON recovery_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on reports" ON reports FOR SELECT USING (true);
CREATE POLICY "Allow public select on recovery_reports" ON recovery_reports FOR SELECT USING (true);
