-- ==============================================================================
-- MINDVEST DIAGNOSTIC OS - COMPLETE ONE-CLICK DATABASE SETUP
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'consultant' CHECK (role IN ('admin', 'consultant', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. BUSINESSES TABLE
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  industry TEXT,
  location TEXT,
  website TEXT,
  founder_contact TEXT,
  business_stage TEXT DEFAULT 'startup',
  team_size INTEGER DEFAULT 1,
  revenue_range TEXT DEFAULT '0-100k',
  assigned_consultant_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'intake',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. DIAGNOSTIC SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.diagnostic_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  consultant_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  framework_version TEXT DEFAULT '1.0',
  status TEXT DEFAULT 'in_progress',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  overall_score DECIMAL(4, 1),
  notes TEXT
);

-- 5. DIAGNOSTIC DOMAINS TABLE
CREATE TABLE IF NOT EXISTS public.diagnostic_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  weight DECIMAL(3, 2) DEFAULT 1.0
);

-- 6. DIAGNOSTIC QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.diagnostic_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID REFERENCES public.diagnostic_domains(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_type TEXT DEFAULT 'text',
  required BOOLEAN DEFAULT false,
  evidence_required BOOLEAN DEFAULT false,
  metric TEXT,
  weight DECIMAL(3, 2) DEFAULT 1.0,
  follow_up_logic JSONB,
  order_index INTEGER
);

-- 7. DIAGNOSTIC ANSWERS TABLE
CREATE TABLE IF NOT EXISTS public.diagnostic_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.diagnostic_sessions(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  answer TEXT,
  evidence TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. DOMAIN SCORES TABLE
CREATE TABLE IF NOT EXISTS public.domain_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.diagnostic_sessions(id) ON DELETE CASCADE,
  domain_id UUID NOT NULL REFERENCES public.diagnostic_domains(id) ON DELETE CASCADE,
  score DECIMAL(4, 1),
  reason TEXT,
  evidence TEXT,
  confidence TEXT DEFAULT 'medium',
  missing_evidence TEXT,
  ai_generated BOOLEAN DEFAULT true,
  consultant_override BOOLEAN DEFAULT false,
  override_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, domain_id)
);

-- 9. FINANCIAL METRICS TABLE
CREATE TABLE IF NOT EXISTS public.financial_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.diagnostic_sessions(id) ON DELETE CASCADE,
  monthly_revenue DECIMAL(15, 2),
  gross_profit DECIMAL(15, 2),
  gross_margin DECIMAL(5, 2),
  operating_costs DECIMAL(15, 2),
  net_profit DECIMAL(15, 2),
  net_margin DECIMAL(5, 2),
  cash_balance DECIMAL(15, 2),
  receivables DECIMAL(15, 2),
  payables DECIMAL(15, 2),
  debt DECIMAL(15, 2),
  average_transaction_value DECIMAL(15, 2),
  customer_acquisition_cost DECIMAL(15, 2),
  break_even_revenue DECIMAL(15, 2),
  cash_flow DECIMAL(15, 2),
  customer_lifetime_value DECIMAL(15, 2),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. CONSTRAINTS TABLE
CREATE TABLE IF NOT EXISTS public.constraints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.diagnostic_sessions(id) ON DELETE CASCADE,
  constraint_type TEXT DEFAULT 'primary',
  description TEXT NOT NULL,
  severity DECIMAL(4, 1),
  financial_impact DECIMAL(4, 1),
  evidence_strength DECIMAL(4, 1),
  dependency DECIMAL(4, 1),
  controllability DECIMAL(4, 1),
  priority_score DECIMAL(6, 2),
  symptoms TEXT[],
  opportunity TEXT,
  ai_generated BOOLEAN DEFAULT true,
  consultant_override BOOLEAN DEFAULT false,
  override_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. ROOT CAUSES TABLE
CREATE TABLE IF NOT EXISTS public.root_causes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  constraint_id UUID NOT NULL REFERENCES public.constraints(id) ON DELETE CASCADE,
  level INTEGER,
  description TEXT,
  cause_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. INTERVENTIONS TABLE
CREATE TABLE IF NOT EXISTS public.interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.diagnostic_sessions(id) ON DELETE CASCADE,
  constraint_id UUID REFERENCES public.constraints(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  ai_generated BOOLEAN DEFAULT true,
  consultant_override BOOLEAN DEFAULT false,
  override_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. ACTION ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intervention_id UUID NOT NULL REFERENCES public.interventions(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  assigned_to TEXT,
  due_date DATE,
  status TEXT DEFAULT 'pending',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. BASELINE METRICS TABLE
CREATE TABLE IF NOT EXISTS public.baseline_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.diagnostic_sessions(id) ON DELETE CASCADE,
  revenue DECIMAL(15, 2) DEFAULT 0,
  customers INTEGER DEFAULT 0,
  leads INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5, 2) DEFAULT 0,
  profit DECIMAL(15, 2) DEFAULT 0,
  cash_flow DECIMAL(15, 2) DEFAULT 0,
  average_transaction_value DECIMAL(15, 2) DEFAULT 0,
  operating_costs DECIMAL(15, 2) DEFAULT 0,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id)
);

-- 15. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.diagnostic_sessions(id) ON DELETE CASCADE,
  review_type TEXT,
  review_date DATE NOT NULL,
  kpi JSONB,
  baseline JSONB,
  current_value JSONB,
  percentage_change JSONB,
  intervention_applied TEXT,
  result TEXT,
  explanation TEXT,
  evidence TEXT,
  consultant_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. AI ANALYSES TABLE
CREATE TABLE IF NOT EXISTS public.ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.diagnostic_sessions(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL,
  input_data JSONB,
  output_data JSONB,
  model_used TEXT,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. CONSULTANT OVERRIDES TABLE
CREATE TABLE IF NOT EXISTS public.consultant_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  fieldName TEXT,
  field_name TEXT,
  original_value JSONB,
  new_value JSONB,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. CASE STUDIES TABLE
CREATE TABLE IF NOT EXISTS public.case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  session_id UUID REFERENCES public.diagnostic_sessions(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  business_situation TEXT,
  initial_symptoms TEXT,
  diagnosis TEXT,
  intervention TEXT,
  implementation TEXT,
  baseline JSONB,
  outcome JSONB,
  lessons TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- 19. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  changes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 20. EVIDENCE TABLE
CREATE TABLE IF NOT EXISTS public.evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.diagnostic_sessions(id) ON DELETE CASCADE,
  domain_id UUID REFERENCES public.diagnostic_domains(id) ON DELETE SET NULL,
  evidence_type TEXT,
  description TEXT,
  file_url TEXT,
  metadata JSONB,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 21. KNOWLEDGE BASE TABLE
CREATE TABLE IF NOT EXISTS public.knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  tags TEXT[],
  version TEXT DEFAULT '1.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_businesses_consultant ON public.businesses(assigned_consultant_id);
CREATE INDEX IF NOT EXISTS idx_businesses_status ON public.businesses(status);
CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_business ON public.diagnostic_sessions(business_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_consultant ON public.diagnostic_sessions(consultant_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_answers_session ON public.diagnostic_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_domain_scores_session ON public.domain_scores(session_id);
CREATE INDEX IF NOT EXISTS idx_constraints_session ON public.constraints(session_id);
CREATE INDEX IF NOT EXISTS idx_interventions_session ON public.interventions(session_id);
CREATE INDEX IF NOT EXISTS idx_baseline_metrics_business ON public.baseline_metrics(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_business ON public.reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_evidence_session ON public.evidence(session_id);

-- ==============================================================================
-- SEED DIAGNOSTIC DOMAINS
-- ==============================================================================
INSERT INTO public.diagnostic_domains (name, description, weight) VALUES
('Business Foundation', 'Assess business model, stage, core problem, target customer, revenue model, objectives, and strategic clarity', 1.0),
('Market & Customer', 'Assess customer definition, pain, demand, understanding, market opportunity, competitors, and feedback', 1.0),
('Offer & Value', 'Assess offer clarity, customer outcome, pricing, packaging, differentiation, perceived value, and revenue opportunities', 1.0),
('Positioning & Brand', 'Assess positioning, differentiation, messaging, credibility, perceived value, brand consistency, and market recognition', 1.0),
('Marketing & Demand', 'Measure reach, leads, qualified leads, acquisition channels, lead quality, consistency, cost, and ROI', 1.0),
('Sales & Conversion', 'Measure lead to conversation to proposal to sale, including response time, qualification, process, follow-up, closing, and conversion', 1.0),
('Operations & Delivery', 'Assess processes, systems, capacity, quality control, delivery time, technology, customer experience, and operational waste', 1.0),
('Financial Engine', 'Capture and calculate financial metrics including revenue, profit, margins, cash flow, and customer metrics', 1.0),
('People & Leadership', 'Assess founder dependency, team capacity, skills, delegation, accountability, decision making, leadership, and culture', 1.0),
('Strategy & Execution', 'Assess goals, priorities, strategic clarity, resource allocation, competitive advantage, execution discipline, measurement, and adaptability', 1.0)
ON CONFLICT (name) DO NOTHING;

-- ==============================================================================
-- PERMISSIONS & ROW LEVEL SECURITY (RLS) FIX
-- Disables RLS so authenticated consultants can access OS records freely
-- ==============================================================================
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
ALTER TABLE IF EXISTS public.root_causes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.interventions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.action_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.case_studies DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.evidence DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.knowledge_base DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_analyses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.consultant_overrides DISABLE ROW LEVEL SECURITY;

GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, anon, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated, anon, service_role;

-- Reload Supabase PostgREST Schema Cache immediately
NOTIFY pgrst, 'reload schema';
