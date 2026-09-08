# Hourbase

Responsive freelancer time-tracking web app: timer, clients, projects, timesheets, reports, and invoices.

**Track your time. Know your value. Get paid accurately.**

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without Supabase keys the app runs in **local demo mode** (data in `localStorage`).

## Supabase (optional production backend)

1. Create a project at [supabase.com](https://supabase.com).
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor.
3. Enable Email auth. Optionally enable Google and set the redirect URL to `http://localhost:3000/auth/callback`.
4. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Stack

Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Supabase Auth + Postgres, Recharts, jsPDF.
