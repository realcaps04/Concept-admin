-- Table for Current Activities Today
CREATE TABLE activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    activities TEXT[] NOT NULL,
    member_name TEXT,
    member_employee_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public insert on activity_logs" ON activity_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on activity_logs" ON activity_logs FOR SELECT USING (true);
