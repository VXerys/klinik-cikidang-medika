# Local Development Runbook

## Prerequisites

- Runtime: Node.js 20+
- Package manager: npm 10+
- Required services: Git, Supabase Cloud Project

## First-Time Setup

```bash
git clone <repository-url> klinik-cikidang-medika
cd klinik-cikidang-medika
npm install
cp .env.example .env.local
```

Fill in the Supabase credentials from the Supabase dashboard into `.env.local`.

## Environment Variables

Use `.env.example` as the key inventory. Never place real secrets in documentation.

| Variable | Required | Purpose | Safe local source |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Project URL | Supabase Dashboard (Project Settings > API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Anonymous API Key for Client Auth | Supabase Dashboard (Project Settings > API) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service Role Key for Admin Access | Supabase Dashboard (Project Settings > API) |

## Run

```bash
npm run dev
```

## Verify Setup

```bash
npx tsc --noEmit
npm run lint
```

Expected result:

Both type checking and linting pass with no errors. The local server should be accessible at `http://localhost:3000`.

## Common Problems

| Symptom | Likely cause | Resolution |
|---|---|---|
| Missing Supabase variables on load | Missing env vars | Ensure `.env.local` is present and correctly populated. |
| Supabase connection refused | Invalid Supabase URL or offline project | Verify URL in `.env.local` and check Supabase dashboard status. |
| Address already in use (EADDRINUSE) | Port 3000 is in use | Kill the process using port 3000 or specify a different port (e.g., `npm run dev -- -p 3001`). |
| Type check errors | TypeScript errors | Run `npx tsc --noEmit` and resolve the issues reported in the code. |
