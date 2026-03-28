-- SUPABASE MIGRATION SCRIPT --
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create Portfolio Data Table (Single Row Storage)
-- This table stores general settings, hero, about, and contact as a single JSONB blob for simplicity
CREATE TABLE IF NOT EXISTS portfolio_data (
    id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    hero JSONB NOT NULL DEFAULT '{}'::jsonb,
    about JSONB NOT NULL DEFAULT '{}'::jsonb,
    contact JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Experience Table
CREATE TABLE IF NOT EXISTS experience (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    date TEXT NOT NULL,
    description TEXT,
    achievements TEXT[] DEFAULT '{}',
    icon TEXT DEFAULT 'fa-briefcase',
    color TEXT DEFAULT '#FF6A3D',
    order_index INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Certifications Table
CREATE TABLE IF NOT EXISTS certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    organization TEXT NOT NULL,
    image_url TEXT,
    issue_date TEXT,
    credential_id TEXT,
    credential_url TEXT,
    color TEXT DEFAULT '#FF6A3D',
    order_index INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Skills Table
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    skill_name TEXT NOT NULL,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE portfolio_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- 6. Create Public Read Policies
CREATE POLICY "Public Read Access" ON portfolio_data FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON experience FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON certifications FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON skills FOR SELECT USING (true);

-- 7. Create Admin Permission Policies (Allow all for ANON during setup, but SHOULD be secured later)
-- Note: Replace 'true' with a check for auth.uid() if you implement Supabase Auth
CREATE POLICY "Enable All for now" ON portfolio_data FOR ALL USING (true);
CREATE POLICY "Enable All for now" ON experience FOR ALL USING (true);
CREATE POLICY "Enable All for now" ON certifications FOR ALL USING (true);
CREATE POLICY "Enable All for now" ON skills FOR ALL USING (true);

-- 8. Seed the single row for portfolio_data
INSERT INTO portfolio_data (id) VALUES ('00000000-0000-0000-0000-000000000000'::uuid)
ON CONFLICT (id) DO NOTHING;
