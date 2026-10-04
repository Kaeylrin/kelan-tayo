# Kelan Tayo

Find the day everyone's actually free. Create a plan, share the link, have the barkada mark when they're busy, and Kelan Tayo shows the dates where nobody is.

Live at https://kelan-tayo.vercel.app

## Stack

- React + Vite (frontend), deployed on Vercel
- Supabase (Postgres, realtime, magic-link auth for Regular Gala)
- Vercel serverless functions in `api/` for every room write
- Cloudflare Turnstile for bot checks

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm test
npm run build
```

`.env.local` needs `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` and optionally `VITE_TURNSTILE_SITE_KEY`.
The `api/` routes only run on Vercel (or `vercel dev`) and also need `SUPABASE_SERVICE_ROLE_KEY` and `TURNSTILE_SECRET_KEY`.

## Security model

The anon key is public (it ships in the bundle), so it is **read-only** for `rooms`, `members` and `availability`.
All writes go through `api/createRoom`, `api/joinRoom`, `api/saveAvailability` and `api/roomAction`, which check the request origin, verify Turnstile (create and join), rate-limit by hashed IP, validate input and use the service role key.

Database setup lives in `supabase/migrations/`. Run new migrations in the Supabase SQL Editor after deploying the matching code.
