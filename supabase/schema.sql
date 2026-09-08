-- Mindvest Diagnostic OS Database Schema
-- Version: 1.0

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'consultant' CHECK (role IN ('admin', 'consultant', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BUSINESSES TABLE
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name TEXT NOT NULL,
  industry TEXT,
  location TEXT,
  website TEXT,
  founder_contact TEXT,
  business_stage TEXT CHECK (business_stage IN ('idea', 'startup', 'growth', 'mature', 'declining')),
  team_size INTEGER,
  revenue_range TEXT CHECK (revenue_range IN ('0-100k', '100k-500k', '500k-1m', '1m-5m', '5m-10m', '10m+')),
  assigned_consultant_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'lead' CHECK (status IN ('lead', 'intake', 'diagnosing', 'validation', 'diagnosis_complete', 'strategy', 'execution', 'monitoring', 'completed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DIAGNOSTIC SESSIONS TABLE
CREATE TABLE diagnostic_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  consultant_id UUID NOT NULL REFERENCES users(id),
  framework_version TEXT DEFAULT '1.0',
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  overall_score DECIMAL(3, 1),
  notes TEXT
);

-- DIAGNOSTIC DOMAINS TABLE
CREATE TABLE diagnostic_domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  weight DECIMAL(3, 2) DEFAULT 1.0
);

-- DIAGNOSTIC QUESTIONS TABLE
CREATE TABLE diagnostic_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domain_id UUID NOT NULL REFERENCES diagnostic_domains(id),
  question TEXT NOT NULL,
  question_type TEXT CHECK (question_type IN ('text', 'number', 'currency', 'percentage', 'yes_no', 'multiple_choice', 'scale', 'date')),
  required BOOLEAN DEFAULT false,
  evidence_required BOOLEAN DEFAULT false,
  metric TEXT,
  weight DECIMAL(3, 2) DEFAULT 1.0,
  follow_up_logic JSONB,
  order_index INTEGER
);

-- DIAGNOSTIC ANSWERS TABLE
CREATE TABLE diagnostic_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES diagnostic_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES diagnostic_questions(id),
  answer TEXT,
  evidence TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DOMAIN SCORES TABLE
CREATE TABLE domain_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES diagnostic_sessions(id) ON DELETE CASCADE,
  domain_id UUID NOT NULL REFERENCES diagnostic_domains(id),
  score DECIMAL(3, 1) CHECK (score >= 0 AND score <= 10),
  reason TEXT,
  evidence TEXT,
  confidence TEXT CHECK (confidence IN ('low', 'medium', 'high')),
  missing_evidence TEXT,
  ai_generated BOOLEAN DEFAULT true,
  consultant_override BOOLEAN DEFAULT false,
  override_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, domain_id)
);

-- FINANCIAL METRICS TABLE
CREATE TABLE financial_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  session_id UUID REFERENCES diagnostic_sessions(id) ON DELETE CASCADE,
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

-- CONSTRAINTS TABLE
CREATE TABLE constraints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES diagnostic_sessions(id) ON DELETE CASCADE,
  constraint_type TEXT CHECK (constraint_type IN ('primary', 'secondary')),
  description TEXT NOT NULL,
  severity DECIMAL(3, 1) CHECK (severity >= 0 AND severity <= 10),
  financial_impact DECIMAL(3, 1) CHECK (financial_impact >= 0 AND financial_impact <= 10),
  evidence_strength DECIMAL(3, 1) CHECK (evidence_strength >= 0 AND evidence_strength <= 10),
  dependency DECIMAL(3, 1) CHECK (dependency >= 0 AND dependency <= 10),
  controllability DECIMAL(3, 1) CHECK (controllability >= 0 AND controllability <= 10),
  priority_score DECIMAL(5, 2),
  symptoms TEXT[],
  opportunity TEXT,
  ai_generated BOOLEAN DEFAULT true,
  consultant_override BOOLEAN DEFAULT false,
  override_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ROOT CAUSES TABLE
CREATE TABLE root_causes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  constraint_id UUID NOT NULL REFERENCES constraints(id) ON DELETE CASCADE,
  level INTEGER,
  description TEXT,
  cause_type TEXT CHECK (cause_type IN ('observed_fact', 'inference', 'hypothesis', 'validated_cause')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INTERVENTIONS TABLE
CREATE TABLE interventions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES diagnostic_sessions(id) ON DELETE CASCADE,
  constraint_id UUID REFERENCES constraints(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  ai_generated BOOLEAN DEFAULT true,
  consultant_override BOOLEAN DEFAULT false,
  override_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ACTION ITEMS TABLE
CREATE TABLE action_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  intervention_id UUID NOT NULL REFERENCES interventions(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  assigned_to TEXT,
  due_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BASELINE METRICS TABLE
CREATE TABLE baseline_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES diagnostic_sessions(id) ON DELETE CASCADE,
  revenue DECIMAL(15, 2),
  customers INTEGER,
  leads INTEGER,
  conversion_rate DECIMAL(5, 2),
  profit DECIMAL(15, 2),
  cash_flow DECIMAL(15, 2),
  average_transaction_value DECIMAL(15, 2),
  operating_costs DECIMAL(15, 2),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(business_id, session_id)
);

-- REVIEWS TABLE
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  session_id UUID REFERENCES diagnostic_sessions(id) ON DELETE SET NULL,
  review_type TEXT CHECK (review_type IN ('30_day', '60_day', '90_day')),
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

-- AI ANALYSES TABLE
CREATE TABLE ai_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES diagnostic_sessions(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL,
  input_data JSONB,
  output_data JSONB,
  model_used TEXT,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CONSULTANT OVERRIDES TABLE
CREATE TABLE consultant_overrides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultant_id UUID NOT NULL REFERENCES users(id),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  field_name TEXT NOT NULL,
  original_value JSONB,
  new_value JSONB,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CASE STUDIES TABLE
CREATE TABLE case_studies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id),
  session_id UUID NOT NULL REFERENCES diagnostic_sessions(id),
  title TEXT NOT NULL,
  business_situation TEXT,
  initial_symptoms TEXT,
  diagnosis TEXT,
  intervention TEXT,
  implementation TEXT,
  baseline JSONB,
  outcome JSONB,
  lessons TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- AUDIT LOGS TABLE
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  changes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EVIDENCE TABLE
CREATE TABLE evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES diagnostic_sessions(id) ON DELETE CASCADE,
  domain_id UUID REFERENCES diagnostic_domains(id),
  evidence_type TEXT CHECK (evidence_type IN ('document', 'metric', 'observation', 'feedback', 'other')),
  description TEXT,
  file_url TEXT,
  metadata JSONB,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KNOWLEDGE BASE TABLE
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  tags TEXT[],
  version TEXT DEFAULT '1.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_businesses_consultant ON businesses(assigned_consultant_id);
CREATE INDEX idx_businesses_status ON businesses(status);
CREATE INDEX idx_diagnostic_sessions_business ON diagnostic_sessions(business_id);
CREATE INDEX idx_diagnostic_sessions_consultant ON diagnostic_sessions(consultant_id);
CREATE INDEX idx_diagnostic_answers_session ON diagnostic_answers(session_id);
CREATE INDEX idx_domain_scores_session ON domain_scores(session_id);
CREATE INDEX idx_constraints_session ON constraints(session_id);
CREATE INDEX idx_interventions_session ON interventions(session_id);
CREATE INDEX idx_baseline_metrics_business ON baseline_metrics(business_id);
CREATE INDEX idx_reviews_business ON reviews(business_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_evidence_session ON evidence(session_id);

-- Insert default diagnostic domains
INSERT INTO diagnostic_domains (name, description, weight) VALUES
('Business Foundation', 'Assess business model, stage, core problem, target customer, revenue model, objectives, and strategic clarity', 1.0),
('Market & Customer', 'Assess customer definition, pain, demand, understanding, market opportunity, competitors, and feedback', 1.0),
('Offer & Value', 'Assess offer clarity, customer outcome, pricing, packaging, differentiation, perceived value, and revenue opportunities', 1.0),
('Positioning & Brand', 'Assess positioning, differentiation, messaging, credibility, perceived value, brand consistency, and market recognition', 1.0),
('Marketing & Demand', 'Measure reach, leads, qualified leads, acquisition channels, lead quality, consistency, cost, and ROI', 1.0),
('Sales & Conversion', 'Measure lead to conversation to proposal to sale, including response time, qualification, process, follow-up, closing, and conversion', 1.0),
('Operations & Delivery', 'Assess processes, systems, capacity, quality control, delivery time, technology, customer experience, and operational waste', 1.0),
('Financial Engine', 'Capture and calculate financial metrics including revenue, profit, margins, cash flow, and customer metrics', 1.0),
('People & Leadership', 'Assess founder dependency, team capacity, skills, delegation, accountability, decision making, leadership, and culture', 1.0),
('Strategy & Execution', 'Assess goals, priorities, strategic clarity, resource allocation, competitive advantage, execution discipline, measurement, and adaptability', 1.0);
