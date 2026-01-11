-- Create storage bucket for SBI applicant documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('sbi-documents', 'sbi-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies to allow uploads and downloads
-- Policy to allow anyone to upload files
CREATE POLICY "Allow public uploads to sbi-documents"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'sbi-documents');

-- Policy to allow anyone to read/download files
CREATE POLICY "Allow public downloads from sbi-documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'sbi-documents');

-- Policy to allow updates (optional, for replacing documents)
CREATE POLICY "Allow public updates to sbi-documents"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'sbi-documents')
WITH CHECK (bucket_id = 'sbi-documents');

-- Policy to allow deletes (optional, for removing documents)
CREATE POLICY "Allow public deletes from sbi-documents"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'sbi-documents');
