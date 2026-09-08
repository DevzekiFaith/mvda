# Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

## Getting Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Navigate to Project Settings > API
4. Copy the Project URL and Anon Key
5. Replace the placeholder values in `.env.local`

**Note:** The OpenAI API key is already provided above.
