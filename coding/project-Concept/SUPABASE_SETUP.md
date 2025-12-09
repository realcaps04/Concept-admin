# Supabase Setup Guide for Super Admin

## Step 1: Create the Superadmin Table

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `rdubzgyjyyumapvifwuq`
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the entire contents of `supabase_schema.sql` file
6. Click **Run** to execute the SQL

This will create:
- The `Superadmin` table with required columns
- Indexes for faster queries
- A default super admin account (email: `superadmin@example.com`, password: `admin123`)

## Step 2: Verify Table Creation

1. Go to **Table Editor** in Supabase Dashboard
2. You should see the `Superadmin` table listed
3. Click on it to view the structure and data

## Step 3: Update Default Credentials

**IMPORTANT:** Change the default password immediately!

1. In the `Superadmin` table, find the default admin record
2. Update the `password` field with a secure password
3. Update the `email` field if needed

## Step 4: Test the Login

1. Open `Superadminindex.html` in your browser
2. Use the credentials you set up in the table
3. You should be able to log in and access the admin console

## Table Structure

The `Superadmin` table has the following columns:

- `id` (UUID): Primary key, auto-generated
- `email` (TEXT): Unique email address for login
- `name` (TEXT): Display name of the super admin
- `password` (TEXT): Password for authentication (plain text for now)
- `is_active` (BOOLEAN): Whether the account is active
- `created_at` (TIMESTAMP): When the record was created
- `updated_at` (TIMESTAMP): When the record was last updated

## Security Notes

⚠️ **Important Security Considerations:**

1. **Password Hashing**: Currently passwords are stored in plain text. For production, you should:
   - Hash passwords using bcrypt or similar before storing
   - Update the login verification logic to compare hashed passwords

2. **Row Level Security**: The table has RLS enabled. Make sure your policies are appropriate for your use case.

3. **API Keys**: Never expose your service role key in client-side code. Only use the anon key.

## Adding New Super Admins

You can add new super admins directly in Supabase:

```sql
INSERT INTO "Superadmin" (email, name, password, is_active)
VALUES ('newadmin@example.com', 'New Admin Name', 'securepassword123', true);
```

Or use the admin console in the application after logging in.

## Troubleshooting

- **Can't log in?** Check that:
  - The email exists in the `Superadmin` table
  - The `is_active` field is set to `true`
  - The password matches exactly (case-sensitive)
  
- **Table not found?** Make sure you ran the SQL schema file in the Supabase SQL Editor

- **Connection errors?** Verify your Supabase URL and anon key are correct in `js/superadmin.js`

