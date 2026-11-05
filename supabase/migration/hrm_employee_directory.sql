ALTER TABLE public.departments
    ALTER COLUMN code DROP NOT NULL;

ALTER TABLE public.employees
    ALTER COLUMN employee_code DROP NOT NULL,
    ADD COLUMN IF NOT EXISTS first_name TEXT,
    ADD COLUMN IF NOT EXISTS last_name TEXT,
    ADD COLUMN IF NOT EXISTS email TEXT,
    ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS position TEXT,
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'archived'));

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

UPDATE public.employees AS employee
SET
    first_name = COALESCE(
        employee.first_name,
        NULLIF(split_part(trim(profile.full_name), ' ', 1), '')
    ),
    last_name = COALESCE(
        employee.last_name,
        NULLIF(
            trim(substr(trim(profile.full_name), length(split_part(trim(profile.full_name), ' ', 1)) + 1)),
            ''
        )
    ),
    email = COALESCE(employee.email, profile.email)
FROM public.profiles AS profile
WHERE employee.profile_id = profile.id
  AND (employee.first_name IS NULL OR employee.last_name IS NULL OR employee.email IS NULL);

UPDATE public.employees
SET position = job_title
WHERE position IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS employees_email_unique_lower_idx
    ON public.employees (lower(email))
    WHERE email IS NOT NULL AND btrim(email) <> '';

CREATE INDEX IF NOT EXISTS employees_status_idx
    ON public.employees (status);

CREATE OR REPLACE FUNCTION public.is_hr_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = (SELECT auth.uid())
          AND role IN ('superadmin', 'admin', 'hr_manager')
    );
$$;

REVOKE ALL ON FUNCTION public.is_hr_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_hr_admin() TO authenticated;

REVOKE ALL ON public.departments FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.departments TO authenticated;
REVOKE ALL ON public.employees FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.employees TO authenticated;

DROP POLICY IF EXISTS "Departments are viewable by everyone" ON public.departments;
DROP POLICY IF EXISTS "Departments are manageable by HR admins" ON public.departments;
CREATE POLICY "Authenticated users can view departments"
    ON public.departments FOR SELECT TO authenticated
    USING (true);
CREATE POLICY "HR admins can create departments"
    ON public.departments FOR INSERT TO authenticated
    WITH CHECK ((SELECT public.is_hr_admin()));
CREATE POLICY "HR admins can update departments"
    ON public.departments FOR UPDATE TO authenticated
    USING ((SELECT public.is_hr_admin()))
    WITH CHECK ((SELECT public.is_hr_admin()));

DROP POLICY IF EXISTS "Employees can view own record, HR admins view all" ON public.employees;
DROP POLICY IF EXISTS "Employees are manageable by HR admins" ON public.employees;
CREATE POLICY "Employees and HR admins can view employee records"
    ON public.employees FOR SELECT TO authenticated
    USING (
        (SELECT public.is_hr_admin())
        OR profile_id = (SELECT auth.uid())
    );
CREATE POLICY "HR admins can create employee records"
    ON public.employees FOR INSERT TO authenticated
    WITH CHECK ((SELECT public.is_hr_admin()));
CREATE POLICY "HR admins can update employee records"
    ON public.employees FOR UPDATE TO authenticated
    USING ((SELECT public.is_hr_admin()))
    WITH CHECK ((SELECT public.is_hr_admin()));
