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

A responsive, dark-themed landing page for Hope, Inc., with product, people, sales, and customer management highlights. The sign-in dialog includes login, registration, password-reset request, and new-password screens.

## Run locally

Install Node.js, then from this folder run:

```powershell
npm install
npm run dev
```
Open the local URL printed by Next.js. The authentication forms are UI previews only; they include browser form validation, a password-match check, loading indicators, and unavailable-service error states, but are not connected to an authentication service.
