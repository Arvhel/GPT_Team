# HOPE, Inc. ERP

HOPE, Inc. combines Product Management, Human Resources, Customer Management,
and Sales in a single Next.js App Router application. The modules share
responsive navigation and Supabase authentication, with server-side role checks
and database row-level security.

## Environment

Copy `.env.example` to `.env.local` and set your Supabase project URL and
anonymous key. The anonymous key is public by design; never put a service-role
key in a `NEXT_PUBLIC_` variable. All exposed tables must have appropriate RLS
policies enabled.

## Database setup

Apply the existing base module schemas in their dependency order, then apply
`supabase/migration/customer_management.sql`,
`supabase/migration/hrm_employee_directory.sql`, and
`supabase/migration/sales_management.sql`. Finally apply
`supabase/migration/product_management_integration.sql` to enable product
permissions, category and inventory read access, and atomic product saves.
Sales creation reserves stock in the same transaction; cancelling a sale
restores it, and reopening a cancelled sale checks available stock first.

## Run locally

```powershell
npm install
npm run dev
```

Open the local URL printed by Next.js. Sign-in, registration, password reset,
and session handling use Supabase Auth. Validate changes with:

```powershell
npm run typecheck
npm run build
```
