-- Mindvest Diagnostic OS - Fix Row Level Security (RLS) Policies
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Option 1: Disable RLS for all operational tables (Recommended for internal Consultant OS)
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.businesses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.diagnostic_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.diagnostic_domains DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.diagnostic_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.diagnostic_answers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.domain_scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.financial_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.baseline_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.constraints DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.interventions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.case_studies DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.evidence DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.knowledge_base DISABLE ROW LEVEL SECURITY;

-- Grant permissions to authenticated and anon roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated, anon;
