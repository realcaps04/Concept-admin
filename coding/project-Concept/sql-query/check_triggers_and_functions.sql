-- Check for triggers and functions that might be modifying the status column
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. Check all triggers on newadminrequests table
-- ============================================
SELECT 
    t.tgname AS trigger_name,
    pg_get_triggerdef(t.oid) AS trigger_definition,
    t.tgenabled AS is_enabled,
    CASE t.tgenabled
        WHEN 'O' THEN 'Enabled'
        WHEN 'D' THEN 'Disabled'
        WHEN 'R' THEN 'Replica'
        WHEN 'A' THEN 'Always'
        ELSE 'Unknown'
    END AS trigger_status
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
    AND c.relname = 'newadminrequests'
    AND NOT t.tgisinternal;

-- ============================================
-- 2. Check for functions that might be used by triggers
-- ============================================
SELECT 
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS function_definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
    AND (
        p.proname LIKE '%newadmin%' 
        OR p.proname LIKE '%status%'
        OR p.proname LIKE '%update_updated_at%'
    );

-- ============================================
-- 3. Specifically check the update_updated_at trigger function
-- ============================================
SELECT 
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS function_definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
    AND p.proname = 'update_updated_at_column';

-- ============================================
-- 4. Check if there's a BEFORE UPDATE trigger that modifies status
-- ============================================
SELECT 
    t.tgname AS trigger_name,
    t.tgtype::text AS trigger_type,
    CASE 
        WHEN t.tgtype & 2 = 2 THEN 'BEFORE'
        WHEN t.tgtype & 64 = 64 THEN 'INSTEAD OF'
        ELSE 'AFTER'
    END AS trigger_timing,
    CASE 
        WHEN t.tgtype & 4 = 4 THEN 'INSERT'
        WHEN t.tgtype & 8 = 8 THEN 'DELETE'
        WHEN t.tgtype & 16 = 16 THEN 'UPDATE'
        ELSE 'OTHER'
    END AS trigger_event,
    pg_get_triggerdef(t.oid) AS trigger_definition
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
    AND c.relname = 'newadminrequests'
    AND (t.tgtype & 16 = 16)  -- UPDATE trigger
    AND (t.tgtype & 2 = 2)    -- BEFORE trigger
    AND NOT t.tgisinternal;

-- ============================================
-- 5. Check the actual constraint definition more thoroughly
-- ============================================
SELECT 
    con.conname AS constraint_name,
    con.contype AS constraint_type,
    pg_get_constraintdef(con.oid, true) AS constraint_definition,
    pg_get_constraintdef(con.oid) AS full_constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
    AND rel.relname = 'newadminrequests'
    AND (pg_get_constraintdef(con.oid) LIKE '%status%' 
         OR con.conname LIKE '%status%')
ORDER BY con.contype;

-- ============================================
-- 6. Check column default one more time with more detail
-- ============================================
SELECT 
    a.attname AS column_name,
    pg_get_expr(d.adbin, d.adrelid) AS column_default,
    t.typname AS data_type,
    a.attnotnull AS not_null
FROM pg_attribute a
JOIN pg_class c ON c.oid = a.attrelid
JOIN pg_type t ON t.oid = a.atttypid
LEFT JOIN pg_attrdef d ON d.adrelid = c.oid AND d.adnum = a.attnum
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
    AND c.relname = 'newadminrequests'
    AND a.attname = 'status'
    AND a.attnum > 0
    AND NOT a.attisdropped;

