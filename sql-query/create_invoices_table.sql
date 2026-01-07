-- Create Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_title TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    customer_address TEXT,
    
    currency TEXT DEFAULT '$',
    date_issued DATE,
    
    items JSONB DEFAULT '[]'::jsonb,
    
    subtotal NUMERIC(15, 2) DEFAULT 0.00,
    pending_amount NUMERIC(15, 2) DEFAULT 0.00,
    pending_note TEXT,
    total NUMERIC(15, 2) DEFAULT 0.00,
    
    business_footer TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add index on invoice_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);

-- Enable RLS and allow public access (adjust as needed for security)
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for now" ON invoices FOR ALL USING (true) WITH CHECK (true);

-- IF YOU HAVE ALREADY CREATED THE TABLE, RUN THESE COMMANDS TO ADD THE NEW COLUMNS:
-- ALTER TABLE invoices ADD COLUMN IF NOT EXISTS pending_amount NUMERIC(15, 2) DEFAULT 0.00;
-- ALTER TABLE invoices ADD COLUMN IF NOT EXISTS pending_note TEXT;
