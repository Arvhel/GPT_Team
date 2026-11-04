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

## Human resources

The employee directory and department manager are available at `/employees`
and `/departments`. Creating, editing, and archiving records is restricted to
authenticated `superadmin`, `admin`, and `hr_manager` profiles; employee and
department reads are scoped by the HR migration's row-level security policies.

For databases that have already applied `supabase/migration/hr_module`, apply
`supabase/migration/hrm_employee_directory.sql` after it. This additive
migration aligns the existing HR tables with the employee directory, preserves
legacy HR columns, and adds authenticated HR-manager policies.
