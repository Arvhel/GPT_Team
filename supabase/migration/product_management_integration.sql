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

REVOKE ALL ON FUNCTION public.is_product_manager() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_product_manager() TO authenticated;

ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_inventory ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.product_categories FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.product_inventory FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.product_categories TO authenticated;
GRANT SELECT ON public.product_inventory TO authenticated;

DROP POLICY IF EXISTS "Product and sales teams can view categories"
    ON public.product_categories;
CREATE POLICY "Product and sales teams can view categories"
    ON public.product_categories FOR SELECT
    TO authenticated
    USING (
        (SELECT public.is_product_manager())
        OR (SELECT public.is_sales_manager())
    );

DROP POLICY IF EXISTS "Product and sales teams can view inventory"
    ON public.product_inventory;
CREATE POLICY "Product and sales teams can view inventory"
    ON public.product_inventory FOR SELECT
    TO authenticated
    USING (
        (SELECT public.is_product_manager())
        OR (SELECT public.is_sales_manager())
    );

CREATE OR REPLACE FUNCTION public.save_product(
    p_product_id UUID,
    p_category_id UUID,
    p_sku TEXT,
    p_name TEXT,
    p_description TEXT,
    p_unit_price NUMERIC(12, 2),
    p_cost_price NUMERIC(12, 2),
    p_stock_quantity INTEGER,
    p_status TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_product_id UUID;
BEGIN
    IF (SELECT auth.uid()) IS NULL OR NOT public.is_product_manager() THEN
        RAISE EXCEPTION 'You are not authorized to manage products.';
    END IF;

    IF p_sku IS NULL OR length(btrim(p_sku)) NOT BETWEEN 1 AND 64
       OR p_name IS NULL OR length(btrim(p_name)) NOT BETWEEN 1 AND 200
       OR (p_description IS NOT NULL AND length(p_description) > 2000)
       OR p_unit_price IS NULL OR p_unit_price < 0
       OR (p_cost_price IS NOT NULL AND p_cost_price < 0)
       OR p_stock_quantity IS NULL OR p_stock_quantity < 0
       OR p_status IS NULL
       OR p_status NOT IN ('draft', 'active', 'archived', 'out_of_stock') THEN
        RAISE EXCEPTION 'The product details are invalid.';
    END IF;

    IF p_product_id IS NULL THEN
        INSERT INTO public.products (
            category_id,
            sku,
            name,
            description,
            unit_price,
            cost_price,
            status
        )
        VALUES (
            p_category_id,
            upper(btrim(p_sku)),
            btrim(p_name),
            NULLIF(btrim(p_description), ''),
            p_unit_price,
            p_cost_price,
            p_status::public.product_status
        )
        RETURNING id INTO v_product_id;
    ELSE
        UPDATE public.products
        SET
            category_id = p_category_id,
            sku = upper(btrim(p_sku)),
            name = btrim(p_name),
            description = NULLIF(btrim(p_description), ''),
            unit_price = p_unit_price,
            cost_price = p_cost_price,
            status = p_status::public.product_status,
            updated_at = now()
        WHERE id = p_product_id
        RETURNING id INTO v_product_id;

        IF NOT FOUND THEN
            RETURN NULL;
        END IF;
    END IF;

    INSERT INTO public.product_inventory (product_id, stock_quantity)
    VALUES (v_product_id, p_stock_quantity)
    ON CONFLICT (product_id)
    DO UPDATE SET
        stock_quantity = EXCLUDED.stock_quantity,
        updated_at = now();

    RETURN v_product_id;
END;
$$;

REVOKE ALL ON FUNCTION public.save_product(
    UUID, UUID, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, INTEGER, TEXT
) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_product(
    UUID, UUID, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, INTEGER, TEXT
) TO authenticated;

CREATE OR REPLACE FUNCTION public.archive_product(p_product_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_product_id UUID;
BEGIN
    IF (SELECT auth.uid()) IS NULL OR NOT public.is_product_manager() THEN
        RAISE EXCEPTION 'You are not authorized to manage products.';
    END IF;

    UPDATE public.products
    SET status = 'archived', updated_at = now()
    WHERE id = p_product_id
    RETURNING id INTO v_product_id;

    RETURN v_product_id;
END;
$$;

REVOKE ALL ON FUNCTION public.archive_product(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.archive_product(UUID) TO authenticated;
