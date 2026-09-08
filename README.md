# Mindvest Diagnostic OS

**Diagnose → Design → Connect → Execute**

An internal business-diagnostic operating system for Mindvest Global Resources. This application helps consultants diagnose real businesses, identify primary constraints, design interventions, execute them, and track measurable outcomes over time.

## Features

### Core Diagnostic System
- **10 Diagnostic Domains**: Business Foundation, Market & Customer, Offer & Value, Positioning & Brand, Marketing & Demand, Sales & Conversion, Operations & Delivery, Financial Engine, People & Leadership, Strategy & Execution
- **Evidence-Based Scoring**: Every score includes evidence, confidence level, and missing information
- **Adaptive Questionnaire**: Questions adapt based on previous answers to gather relevant follow-up information
- **Constraint Engine**: Identifies primary and secondary constraints using Severity × Impact × Evidence × Dependency × Controllability scoring

### AI-Powered Analysis
- **OpenAI Integration**: Pattern recognition, evidence synthesis, hypothesis generation, and root-cause analysis
- **Contradiction Detection**: Flags inconsistencies between stated beliefs and actual metrics
- **Structured Output**: AI returns structured JSON with confidence levels and assumptions

### Consultant Control
- **Override System**: Consultants can edit scores, diagnoses, and AI recommendations
- **Audit Logging**: All overrides are logged with reasons and timestamps
- **Human Oversight**: AI assists but never replaces human judgment

### Financial Dashboard
- **Key Metrics**: Revenue, Gross Profit, Gross Margin, Net Profit, Net Margin, Cash Flow, Break-even, AOV, CAC, CLV
- **Health Indicators**: Visual indicators for profitability, margin health, cash position, and break-even status

### Outcome Tracking
- **Baseline Recording**: Capture initial metrics before intervention
- **30/60/90 Day Reviews**: Track progress and measure improvement
- **Measurable Outcomes**: Compare current values against baseline with percentage changes

### Reporting
- **Professional Reports**: Generate comprehensive diagnostic reports
- **Print & Download**: Export reports as PDF
- **Evidence-Based**: Clearly distinguish between evidence, analysis, and recommendations

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI**: OpenAI GPT-4
- **UI Components**: Lucide Icons, Recharts
- **Utilities**: clsx, tailwind-merge, date-fns

## Getting Started

### Prerequisites

1. Node.js 18+ installed
2. Supabase account and project
3. OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mvda
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env.local file with:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

See [ENV_SETUP.md](./ENV_SETUP.md) for detailed instructions.

4. Set up the database:
```bash
# Run the SQL schema in Supabase SQL Editor
# Copy contents of supabase/schema.sql and execute
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Database Schema

The application uses PostgreSQL with the following main tables:

- `users` - Consultant accounts
- `businesses` - Client business profiles
- `diagnostic_sessions` - Diagnostic sessions
- `diagnostic_domains` - The 10 diagnostic domains
- `diagnostic_questions` - Question bank
- `diagnostic_answers` - Client responses
- `domain_scores` - Calculated domain scores
- `financial_metrics` - Financial data
- `constraints` - Identified constraints
- `interventions` - Recommended actions
- `baseline_metrics` - Initial metrics
- `reviews` - 30/60/90 day reviews
- `ai_analyses` - AI analysis results
- `consultant_overrides` - Override logs
- `audit_logs` - System audit trail

See [supabase/schema.sql](./supabase/schema.sql) for the complete schema.

## Project Structure

```
mvda/
├── app/                          # Next.js app directory
│   ├── api/                     # API routes
│   │   ├── analyze/            # AI analysis endpoint
│   │   └── override/           # Consultant override endpoint
│   ├── dashboard/              # Protected dashboard pages
│   │   ├── businesses/        # Business management
│   │   ├── diagnoses/         # Diagnostic sessions
│   │   └── page.tsx          # Main dashboard
│   ├── login/                  # Authentication page
│   └── layout.tsx             # Root layout
├── components/                  # Reusable components
│   ├── DashboardNav.tsx       # Navigation component
│   └── FinancialDashboard.tsx # Financial metrics display
├── lib/                        # Utility libraries
│   ├── auth.ts                # Authentication helpers
│   ├── diagnostic/            # Diagnostic logic
│   │   ├── domains.ts        # Domain definitions
│   │   ├── scoring.ts        # Scoring algorithms
│   │   └── constraints.ts    # Constraint identification
│   ├── openai/                # OpenAI integration
│   │   └── client.ts         # AI analysis functions
│   ├── supabase/              # Supabase client
│   │   ├── client.ts         # Browser client
│   │   └── server.ts         # Server client
│   └── utils.ts               # Utility functions
└── supabase/                   # Database schema
    └── schema.sql            # SQL schema definition
```

## Usage

### 1. Authentication
- Sign in using Supabase Auth
- Consultants can manage businesses and conduct diagnostics

### 2. Add Business
- Navigate to Businesses
- Click "Add Business"
- Fill in business profile information

### 3. Run Diagnostic
- Select a business
- Click "Start Diagnosis"
- Complete the questionnaire across 10 domains
- System adapts questions based on answers
- Save progress at any time

### 4. Review Results
- View domain scores with evidence
- Review AI-identified constraints
- Override scores if needed (with reason)
- Generate professional report

### 5. Track Outcomes
- Record baseline metrics
- Create interventions
- Schedule 30/60/90 day reviews
- Measure improvement over time

## Scoring System

Each domain is scored 0-10:
- **9-10**: Exceptional
- **7-8**: Strong
- **5-6**: Functional but constrained
- **3-4**: Weak
- **0-2**: Critical

Overall score is the weighted average of all domains. However, a high overall score does not guarantee business health - a single catastrophic constraint can still exist.

## Constraint Priority Formula

```
Priority Score = (Severity × Financial Impact × Evidence Strength × Dependency × Controllability) / 10000
```

This transparent formula ensures constraint prioritization is explainable and auditable.

## Security

- Authentication via Supabase Auth
- Role-based access control
- Server-side AI calls (API keys never exposed to frontend)
- Input validation on all endpoints
- Audit logging for all sensitive actions
- Database access controls via RLS policies

## Framework Version

This is **Mindvest Diagnostic Framework v1.0**. All diagnoses record the framework version used, enabling future comparison and methodology evolution.

## Development

### Build for production
```bash
npm run build
npm start
```

### Lint
```bash
npm run lint
```

## Future Roadmap

### V1.1
- Adaptive questioning enhancements
- Contradiction detection UI
- Case study generation
- Advanced constraint heatmap

### V2
- Industry intelligence and benchmarking
- Advanced analytics dashboard
- Client portal
- Automated follow-up scheduling

### V3
- Public SaaS offering
- Multi-consultant organizations
- API access
- Mobile app

## License

Internal use only for Mindvest Global Resources.

## Support

For issues or questions, contact the development team.
