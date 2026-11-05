CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL
        REFERENCES public.customers(id) ON DELETE RESTRICT,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0
        CHECK (total_amount >= 0),
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'completed', 'cancelled')),
    user_id UUID NOT NULL
        REFERENCES auth.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL
        REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL
        REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal NUMERIC(12, 2) NOT NULL
        CHECK (subtotal >= 0 AND subtotal = unit_price * quantity)
);

CREATE INDEX IF NOT EXISTS sales_customer_id_idx
    ON public.sales(customer_id);
CREATE INDEX IF NOT EXISTS sales_user_id_idx
    ON public.sales(user_id);
CREATE INDEX IF NOT EXISTS sales_created_at_idx
    ON public.sales(created_at DESC);
CREATE INDEX IF NOT EXISTS sale_items_sale_id_idx
    ON public.sale_items(sale_id);
CREATE INDEX IF NOT EXISTS sale_items_product_id_idx
    ON public.sale_items(product_id);

CREATE OR REPLACE FUNCTION public.is_sales_manager()
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

CREATE OR REPLACE FUNCTION public.is_product_manager()
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
          AND profile.role::TEXT IN ('superadmin', 'admin', 'product_manager')
    );
$$;

REVOKE ALL ON FUNCTION public.is_sales_manager() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_sales_manager() TO authenticated;
REVOKE ALL ON FUNCTION public.is_product_manager() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_product_manager() TO authenticated;

CREATE OR REPLACE FUNCTION public.set_sale_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sales_set_updated_at ON public.sales;
CREATE TRIGGER sales_set_updated_at
    BEFORE UPDATE ON public.sales
    FOR EACH ROW
    EXECUTE FUNCTION public.set_sale_updated_at();

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.products FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.products TO authenticated;

DROP POLICY IF EXISTS "Sales and product teams can view products" ON public.products;
CREATE POLICY "Sales and product teams can view products"
    ON public.products FOR SELECT
    TO authenticated
    USING (
        public.is_sales_manager()
        OR public.is_product_manager()
    );

DROP POLICY IF EXISTS "Product managers can create products" ON public.products;
CREATE POLICY "Product managers can create products"
    ON public.products FOR INSERT
    TO authenticated
    WITH CHECK (public.is_product_manager());

DROP POLICY IF EXISTS "Product managers can update products" ON public.products;
CREATE POLICY "Product managers can update products"
    ON public.products FOR UPDATE
    TO authenticated
    USING (public.is_product_manager())
    WITH CHECK (public.is_product_manager());

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.sales FROM anon, authenticated;
REVOKE ALL ON public.sale_items FROM anon, authenticated;
GRANT SELECT, UPDATE (status) ON public.sales TO authenticated;
GRANT SELECT ON public.sale_items TO authenticated;

DROP POLICY IF EXISTS "Sales managers can view sales" ON public.sales;
CREATE POLICY "Sales managers can view sales"
    ON public.sales FOR SELECT
    TO authenticated
    USING (public.is_sales_manager());

DROP POLICY IF EXISTS "Sales managers can update sale statuses" ON public.sales;
CREATE POLICY "Sales managers can update sale statuses"
    ON public.sales FOR UPDATE
    TO authenticated
    USING (public.is_sales_manager())
    WITH CHECK (public.is_sales_manager());

DROP POLICY IF EXISTS "Sales managers can view sale items" ON public.sale_items;
CREATE POLICY "Sales managers can view sale items"
    ON public.sale_items FOR SELECT
    TO authenticated
    USING (public.is_sales_manager());

CREATE OR REPLACE FUNCTION public.create_sale_transaction(
    p_customer_id UUID,
    p_items JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_item JSONB;
    v_product_id UUID;
    v_quantity INTEGER;
    v_requested_price NUMERIC(12, 2);
    v_unit_price NUMERIC(12, 2);
    v_subtotal NUMERIC;
    v_total NUMERIC(12, 2) := 0;
    v_sale_id UUID;
    v_validated_items JSONB := '[]'::JSONB;
BEGIN
    IF (SELECT auth.uid()) IS NULL OR NOT public.is_sales_manager() THEN
        RAISE EXCEPTION 'You are not authorized to create sales.';
    END IF;

    IF p_customer_id IS NULL THEN
        RAISE EXCEPTION 'Select an active customer.';
    END IF;

    PERFORM customer.id
    FROM public.customers AS customer
    WHERE customer.id = p_customer_id
      AND customer.status = 'active'
    FOR SHARE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Select an active customer.';
    END IF;

    IF jsonb_typeof(p_items) IS DISTINCT FROM 'array' THEN
        RAISE EXCEPTION 'A sale must contain between 1 and 100 line items.';
    END IF;

    IF jsonb_array_length(p_items) NOT BETWEEN 1 AND 100 THEN
        RAISE EXCEPTION 'A sale must contain between 1 and 100 line items.';
    END IF;

    FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
    LOOP
        IF jsonb_typeof(v_item) <> 'object'
           OR v_item ->> 'productId' IS NULL
           OR COALESCE(v_item ->> 'quantity', '') !~ '^[1-9][0-9]*$'
           OR COALESCE(v_item ->> 'unitPrice', '') !~ '^(0|[1-9][0-9]*)(\.[0-9]{1,2})?$' THEN
            RAISE EXCEPTION 'One or more sale items are invalid.';
        END IF;

        BEGIN
            v_product_id := (v_item ->> 'productId')::UUID;
            v_quantity := (v_item ->> 'quantity')::INTEGER;
            v_requested_price := (v_item ->> 'unitPrice')::NUMERIC(12, 2);
        EXCEPTION
            WHEN invalid_text_representation OR numeric_value_out_of_range THEN
                RAISE EXCEPTION 'One or more sale items are invalid.';
        END;

        SELECT product.unit_price
        INTO v_unit_price
        FROM public.products AS product
        WHERE product.id = v_product_id
          AND product.status::TEXT = 'active'
        FOR SHARE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'A selected product is no longer available.';
        END IF;

        IF v_requested_price <> v_unit_price THEN
            RAISE EXCEPTION 'A product price changed. Refresh the page and try again.';
        END IF;

        v_subtotal := round(v_unit_price * v_quantity, 2);
        IF v_subtotal > 9999999999.99
           OR v_total + v_subtotal > 9999999999.99 THEN
            RAISE EXCEPTION 'The sale total exceeds the supported amount.';
        END IF;
        v_total := v_total + v_subtotal;
        v_validated_items := v_validated_items || jsonb_build_array(
            jsonb_build_object(
                'product_id', v_product_id,
                'quantity', v_quantity,
                'unit_price', v_unit_price,
                'subtotal', v_subtotal
            )
        );
    END LOOP;

    INSERT INTO public.sales (customer_id, total_amount, user_id)
    VALUES (p_customer_id, v_total, (SELECT auth.uid()))
    RETURNING id INTO v_sale_id;

    INSERT INTO public.sale_items (
        sale_id,
        product_id,
        quantity,
        unit_price,
        subtotal
    )
    SELECT
        v_sale_id,
        item.product_id,
        item.quantity,
        item.unit_price,
        item.subtotal
    FROM jsonb_to_recordset(v_validated_items) AS item(
        product_id UUID,
        quantity INTEGER,
        unit_price NUMERIC(12, 2),
        subtotal NUMERIC(12, 2)
    );

    RETURN v_sale_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_sale_transaction(UUID, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_sale_transaction(UUID, JSONB) TO authenticated;
