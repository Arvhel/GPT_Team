CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
    email TEXT NOT NULL CHECK (char_length(email) <= 254),
    phone TEXT CHECK (phone IS NULL OR char_length(phone) <= 30),
    address TEXT CHECK (address IS NULL OR char_length(address) <= 1000),
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.is_customer_manager()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles AS profile
        WHERE profile.id = (SELECT auth.uid())
          AND profile.role::TEXT IN ('superadmin', 'admin', 'sales_rep', 'crm_agent')
    );
$$;

REVOKE ALL ON FUNCTION public.is_customer_manager() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_customer_manager() TO authenticated;

CREATE OR REPLACE FUNCTION public.set_customer_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS customers_set_updated_at ON public.customers;
CREATE TRIGGER customers_set_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION public.set_customer_updated_at();

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.customers FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.customers TO authenticated;

DROP POLICY IF EXISTS "Customer managers can view customers" ON public.customers;
CREATE POLICY "Customer managers can view customers"
    ON public.customers FOR SELECT
    TO authenticated
    USING (public.is_customer_manager());

DROP POLICY IF EXISTS "Customer managers can create customers" ON public.customers;
CREATE POLICY "Customer managers can create customers"
    ON public.customers FOR INSERT
    TO authenticated
    WITH CHECK (public.is_customer_manager());

DROP POLICY IF EXISTS "Customer managers can update customers" ON public.customers;
CREATE POLICY "Customer managers can update customers"
    ON public.customers FOR UPDATE
    TO authenticated
    USING (public.is_customer_manager())
    WITH CHECK (public.is_customer_manager());
