# HOPE, Inc. - ERP System

## Overview
Initial development setup and environment configuration for HOPE, Inc.
# GPT Team
Gpt team

## App Router authentication

Install dependencies with `npm install`, then run the app with `npm run dev`.
Supabase URL and publishable key are configured in the ignored `.env.local`
file. The App Router auth actions are in `app/actions/auth.ts`; the sign-in and
account pages are `/login` and `/`.

The project uses strict TypeScript checking with the `@/*` alias mapped to the
repository root. Run `npm run typecheck` to validate TypeScript.
