-- GTMXpert Database Schema
-- Run this in the Supabase SQL Editor

-- 1. Create Clients table
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    url TEXT,
    last_updated TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Scout Results table
CREATE TABLE IF NOT EXISTS public.scout_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    content JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create Tracking Plans table
CREATE TABLE IF NOT EXISTS public.tracking_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    content JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Set up Row Level Security (RLS) - Optional: Disable for now to ensure connectivity works
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scout_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_plans ENABLE ROW LEVEL SECURITY;

-- Allow all access for now (since we use service_role)
CREATE POLICY "Full access" ON public.clients FOR ALL USING (true);
CREATE POLICY "Full access" ON public.scout_results FOR ALL USING (true);
CREATE POLICY "Full access" ON public.tracking_plans FOR ALL USING (true);
