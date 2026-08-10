# Arete Analytics Dashboard

A lightweight, single-page Next.js analytics dashboard for Arete.

It reads from a Supabase `analytics_events` table and is designed to be easy to extend.

## 1. Install

```bash
npm install
```

## 2. Configure Supabase

Copy:

```text
.env.local.example
```

to:

```text
.env.local
```

Then add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

Do not put a Supabase service-role/secret key in this application.

## 3. Create the analytics table

Run:

```text
supabase/analytics_events.sql
```

in the Supabase SQL editor.

Before using the dashboard, replace the placeholder admin UUID in the SELECT policy with the UUID of your authenticated account.

## 4. Run locally

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## 5. Events expected by the dashboard

Core:

- app_opened
- sign_up_completed
- onboarding_completed
- plan_generated
- daily_plan_viewed
- task_completed
- daily_plan_completed
- daily_checkin_completed
- weekly_checkin_completed
- notification_opened

Monetization:

- trial_started
- subscription_started
- subscription_cancelled

### Adherence properties

For `daily_plan_completed`, the dashboard can calculate adherence when the event contains:

```json
{
  "task_count": 5,
  "completed_count": 4
}
```

It also accepts:

```json
{
  "tasks_planned": 5,
  "tasks_completed": 4
}
```

## 6. Adding/removing metrics

Start with:

```text
lib/metricConfig.ts
```

Set:

```ts
enabled: false
```

to hide a metric.

For a new metric, add its calculation to:

```text
lib/analytics.ts
```

and render it in:

```text
components/AnalyticsDashboard.tsx
```

This keeps the analytics logic centralized rather than spreading queries throughout the UI.

## 7. GitHub Pages

This project is configured for static export.

The default GitHub Pages base path is:

```text
/arete-analytics
```

If your repository has a different name, change `basePath` and `assetPrefix` in:

```text
next.config.mjs
```

Build:

```bash
npm run build
```

The generated static site is in:

```text
out/
```

You can deploy `out/` to GitHub Pages.

## Important security note

This is an internal analytics dashboard. Do not expose the Supabase service-role/secret key.

The dashboard is intentionally built around the Supabase publishable/anon key and RLS. Keep the SELECT policy restricted to your admin account.

The mobile app should only be allowed to insert its own events.
