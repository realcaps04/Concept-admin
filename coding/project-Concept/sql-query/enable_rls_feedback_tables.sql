-- Enable RLS and add policies for the new feedback tables

-- 1. Bugs Table
ALTER TABLE project_bugs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for anon (bugs)" ON project_bugs
    FOR INSERT WITH CHECK (auth.role() = 'anon');

CREATE POLICY "Enable select for users (bugs)" ON project_bugs
    FOR SELECT USING (user_email = current_setting('request.jwt.claim.email', true));


-- 2. Issues Table
ALTER TABLE project_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for anon (issues)" ON project_issues
    FOR INSERT WITH CHECK (auth.role() = 'anon');

CREATE POLICY "Enable select for users (issues)" ON project_issues
    FOR SELECT USING (user_email = current_setting('request.jwt.claim.email', true));


-- 3. Reports Table
ALTER TABLE project_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for anon (reports)" ON project_reports
    FOR INSERT WITH CHECK (auth.role() = 'anon');

CREATE POLICY "Enable select for users (reports)" ON project_reports
    FOR SELECT USING (user_email = current_setting('request.jwt.claim.email', true));


-- 4. Others Table
ALTER TABLE project_others ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for anon (others)" ON project_others
    FOR INSERT WITH CHECK (auth.role() = 'anon');

CREATE POLICY "Enable select for users (others)" ON project_others
    FOR SELECT USING (user_email = current_setting('request.jwt.claim.email', true));
