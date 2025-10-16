-- Family Command Center Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Families table
CREATE TABLE IF NOT EXISTS families (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
name TEXT NOT NULL,
invite_code TEXT UNIQUE,
created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table - maps to Supabase auth.users
CREATE TABLE IF NOT EXISTS users (
id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
full_name TEXT,
email TEXT,
avatar_url TEXT,
family_id UUID REFERENCES families(id) ON DELETE CASCADE,
role TEXT DEFAULT 'parent',
created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family members table (children + adults as personas)
CREATE TABLE IF NOT EXISTS family_members (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
name TEXT NOT NULL,
role TEXT,
birth_year INTEGER,
avatar_url TEXT,
color TEXT,
created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family invites table
CREATE TABLE IF NOT EXISTS family_invites (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
email TEXT NOT NULL,
token TEXT UNIQUE NOT NULL,
invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
accepted BOOLEAN DEFAULT FALSE,
expires_at TIMESTAMPTZ NOT NULL,
created_at TIMESTAMPTZ DEFAULT NOW(),
accepted_at TIMESTAMPTZ
);

-- Calendar connections table
CREATE TABLE IF NOT EXISTS calendar_connections (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
google_account_email TEXT,
access_token TEXT,
refresh_token TEXT,
expires_at TIMESTAMPTZ,
last_synced_at TIMESTAMPTZ,
sync_status TEXT DEFAULT 'active',
created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
calendar_connection_id UUID REFERENCES calendar_connections(id) ON DELETE CASCADE,
google_event_id TEXT,
title TEXT NOT NULL,
description TEXT,
location TEXT,
start_time TIMESTAMPTZ NOT NULL,
end_time TIMESTAMPTZ,
assigned_member_id UUID REFERENCES family_members(id),
all_day BOOLEAN DEFAULT FALSE,
created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lists table
CREATE TABLE IF NOT EXISTS lists (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
name TEXT NOT NULL,
type TEXT DEFAULT 'grocery',
created_at TIMESTAMPTZ DEFAULT NOW()
);

-- List items table
CREATE TABLE IF NOT EXISTS list_items (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
title TEXT NOT NULL,
purchased BOOLEAN DEFAULT FALSE,
assigned_member_id UUID REFERENCES family_members(id),
created_at TIMESTAMPTZ DEFAULT NOW(),
purchased_at TIMESTAMPTZ
);

-- Chores table
CREATE TABLE IF NOT EXISTS chores (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
title TEXT NOT NULL,
description TEXT,
assigned_member_id UUID REFERENCES family_members(id),
points INTEGER DEFAULT 0,
recurring TEXT,
due_date TIMESTAMPTZ,
created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chore completions table
CREATE TABLE IF NOT EXISTS chore_completions (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
chore_id UUID NOT NULL REFERENCES chores(id) ON DELETE CASCADE,
completed_by_id UUID REFERENCES family_members(id),
completed_at TIMESTAMPTZ DEFAULT NOW(),
notes TEXT
);

-- Messages table (School Hub)
CREATE TABLE IF NOT EXISTS messages (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
subject TEXT NOT NULL,
sender TEXT,
sender_email TEXT,
body TEXT,
preview TEXT,
is_urgent BOOLEAN DEFAULT FALSE,
is_read BOOLEAN DEFAULT FALSE,
received_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table (Stripe) - family-level
CREATE TABLE IF NOT EXISTS subscriptions (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
stripe_customer_id TEXT,
stripe_subscription_id TEXT,
stripe_price_id TEXT,
status TEXT DEFAULT 'inactive',
current_period_start TIMESTAMPTZ,
current_period_end TIMESTAMPTZ,
cancel_at_period_end BOOLEAN DEFAULT FALSE,
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE chores ENABLE ROW LEVEL SECURITY;
ALTER TABLE chore_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access data for their own family

-- Users policies
CREATE POLICY "Users can view their own data" ON users
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
FOR UPDATE USING (auth.uid() = id);

-- Families policies
CREATE POLICY "Users can view their own family" ON families
FOR SELECT USING (
id IN (SELECT family_id FROM users WHERE id = auth.uid())
);

-- Family members policies
CREATE POLICY "Users can view family members in their family" ON family_members
FOR ALL USING (
family_id IN (SELECT family_id FROM users WHERE id = auth.uid())
);

-- Family invites policies
CREATE POLICY "Users can manage invites for their family" ON family_invites
FOR ALL USING (
family_id IN (SELECT family_id FROM users WHERE id = auth.uid())
);

-- Calendar connections policies
CREATE POLICY "Users can manage their own calendar connections" ON calendar_connections
FOR ALL USING (user_id = auth.uid());

-- Events policies
CREATE POLICY "Users can view events in their family" ON events
FOR ALL USING (
family_id IN (SELECT family_id FROM users WHERE id = auth.uid())
);

-- Lists policies
CREATE POLICY "Users can manage lists in their family" ON lists
FOR ALL USING (
family_id IN (SELECT family_id FROM users WHERE id = auth.uid())
);

-- List items policies
CREATE POLICY "Users can manage list items in their family" ON list_items
FOR ALL USING (
list_id IN (
SELECT id FROM lists WHERE family_id IN (
SELECT family_id FROM users WHERE id = auth.uid()
)
)
);

-- Chores policies
CREATE POLICY "Users can manage chores in their family" ON chores
FOR ALL USING (
family_id IN (SELECT family_id FROM users WHERE id = auth.uid())
);

-- Chore completions policies
CREATE POLICY "Users can manage chore completions in their family" ON chore_completions
FOR ALL USING (
chore_id IN (
SELECT id FROM chores WHERE family_id IN (
SELECT family_id FROM users WHERE id = auth.uid()
)
)
);

-- Messages policies
CREATE POLICY "Users can manage messages in their family" ON messages
FOR ALL USING (
family_id IN (SELECT family_id FROM users WHERE id = auth.uid())
);

-- Subscriptions policies
CREATE POLICY "Users can view subscriptions in their family" ON subscriptions
FOR SELECT USING (
family_id IN (SELECT family_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Users can manage their own subscriptions" ON subscriptions
FOR ALL USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_family_id ON users(family_id);
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_invites_family_id ON family_invites(family_id);
CREATE INDEX IF NOT EXISTS idx_family_invites_token ON family_invites(token);
CREATE INDEX IF NOT EXISTS idx_calendar_connections_user_id ON calendar_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_events_family_id ON events(family_id);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_lists_family_id ON lists(family_id);
CREATE INDEX IF NOT EXISTS idx_list_items_list_id ON list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_chores_family_id ON chores(family_id);
CREATE INDEX IF NOT EXISTS idx_chore_completions_chore_id ON chore_completions(chore_id);
CREATE INDEX IF NOT EXISTS idx_messages_family_id ON messages(family_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_family_id ON subscriptions(family_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
