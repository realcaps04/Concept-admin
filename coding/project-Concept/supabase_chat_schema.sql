-- Supabase Schema for Chat Application

-- 1. Table for storing Chat Messages
create table if not exists chat_messages (
  id uuid default uuid_generate_v4() primary key,
  sender_email text not null, -- The email of the sender
  receiver_email text not null, -- The email of the receiver
  message_text text, -- Text content (optional if attachment/sticker)
  message_type text default 'text', -- 'text', 'image', 'file', 'voice', 'sticker'
  attachment_url text, -- URL for images/files/voice clips
  sticker_id text, -- ID or URL for stickers
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_read boolean default false
);

-- 2. Enable Row Level Security (RLS)
alter table chat_messages enable row level security;

-- 3. Policy: Users can see messages they sent or received
create policy "Users can view their own messages"
on chat_messages for select
using (
  auth.email() = sender_email or 
  auth.email() = receiver_email
);

-- 4. Policy: Users can insert messages where they are the sender
create policy "Users can insert their own messages"
on chat_messages for insert
with check (
  auth.email() = sender_email
);

-- 5. Storage Buckets for Media
-- You need to create these buckets in your Supabase Storage dashboard:
-- Bucket Name: 'chat-attachments' (public)
-- Bucket Name: 'voice-clips' (public)

-- 6. Helper View for Conversations (Optional)
-- Useful to get the list of "active contacts" based on message history
create or replace view user_conversations as
select distinct
  case when sender_email = auth.email() then receiver_email else sender_email end as contact_email
from chat_messages
where sender_email = auth.email() or receiver_email = auth.email();
