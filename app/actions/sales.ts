"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type {
  CustomerRow,
  Json,
  ProductRow,
  SaleItemRow,
  SaleRow,
  SaleStatus,
} from "@/utils/supabase/database.types";
import { requireSalesManager } from "@/utils/supabase/sales-access";

export type SaleRecord = SaleRow & {
  customer: Pick<
    CustomerRow,
    "id" | "name" | "email" | "phone" | "address"
  >;
};

export type SaleLineItem = SaleItemRow & {
  product: Pick<ProductRow, "id" | "name" | "sku">;
};

export type SaleDetails = SaleRecord & {
  items: SaleLineItem[];
};

export type SaleCustomerOption = Pick<
  CustomerRow,
  "id" | "name" | "email"
>;

const saleStatuses = ["pending", "completed", "cancelled"] as const;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const maxAmount = 9_999_999_999.99;

function isSaleStatus(value: string): value is SaleStatus {
  return saleStatuses.some((status) => status === value);
}

function validateSaleItems(
  items: Array<{ productId: string; quantity: number; unitPrice: number }>,
) {
  if (!Array.isArray(items) || items.length === 0 || items.length > 100) {
    return false;
  }

  return items.every(
    (item) =>
      item !== null &&
      typeof item === "object" &&
      uuidPattern.test(item.productId) &&
      Number.isSafeInteger(item.quantity) &&
      item.quantity > 0 &&
      item.quantity <= 2_147_483_647 &&
      Number.isFinite(item.unitPrice) &&
      item.unitPrice >= 0 &&
      item.unitPrice <= maxAmount &&
      /^(0|[1-9]\d*)(\.\d{1,2})?$/.test(String(item.unitPrice)),
  );
}

export async function createSaleTransaction(
  customerId: string,
  items: Array<{ productId: string; quantity: number; unitPrice: number }>,
) {
  const { supabase } = await requireSalesManager();

  if (!uuidPattern.test(customerId) || !validateSaleItems(items)) {
    throw new Error("Choose a customer and valid products and quantities.");
  }

  const { data: saleId, error } = await supabase.rpc(
    "create_sale_transaction",
    {
      p_customer_id: customerId,
      p_items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })) as Json,
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  if (!saleId) {
    throw new Error("The sale could not be created.");
  }

  revalidatePath("/sales");
  redirect(`/sales/${saleId}`);
}

export async function updateSaleStatus(
  saleId: string,
  status: SaleStatus,
) {
  const { supabase } = await requireSalesManager();

  if (!uuidPattern.test(saleId) || !isSaleStatus(status)) {
    redirect("/sales?error=invalid-input");
  }

  const { data, error } = await supabase
    .from("sales")
    .update({ status })
    .eq("id", saleId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    redirect("/sales?error=not-found");
  }

  revalidatePath("/sales");
  revalidatePath(`/sales/${saleId}`);
  redirect(`/sales/${saleId}`);
}

export async function getSalesRecords(
  searchQuery?: string,
  statusFilter?: string,
): Promise<SaleRecord[]> {
  const { supabase } = await requireSalesManager();

  if (statusFilter && statusFilter !== "all" && !isSaleStatus(statusFilter)) {
    throw new Error("Invalid sale status filter.");
  }

  const search = searchQuery?.trim().slice(0, 100);
  let matchingCustomerIds: string[] | undefined;

  if (search) {
    const escapedSearch = search
      .replaceAll("\\", "\\\\")
      .replaceAll('"', '\\"')
      .replaceAll("%", "\\%")
      .replaceAll("_", "\\_");
    const pattern = `"%${escapedSearch}%"`;
    const { data: matchingCustomers, error } = await supabase
      .from("customers")
      .select("id")
      .or(`name.ilike.${pattern},email.ilike.${pattern}`);

    if (error) {
      throw new Error(error.message);
    }

    matchingCustomerIds = matchingCustomers.map((customer) => customer.id);
    if (matchingCustomerIds.length === 0) {
      return [];
    }
  }

  let query = supabase
    .from("sales")
    .select("id, customer_id, total_amount, status, user_id, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  if (matchingCustomerIds) {
    query = query.in("customer_id", matchingCustomerIds);
  }

  const { data: sales, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  if (sales.length === 0) {
    return [];
  }

  const { data: customers, error: customersError } = await supabase
    .from("customers")
    .select("id, name, email, phone, address")
    .in(
      "id",
      [...new Set(sales.map((sale) => sale.customer_id))],
    );

  if (customersError) {
    throw new Error(customersError.message);
  }

  const customersById = new Map(
    customers.map((customer) => [customer.id, customer]),
  );

  const records = sales.map((sale) => {
    const customer = customersById.get(sale.customer_id);
    if (!customer) {
      throw new Error("Customer information for a sale could not be loaded.");
    }

    return { ...sale, customer };
  });

  return records;
}

export async function getSaleDetails(saleId: string): Promise<SaleDetails | null> {
  const { supabase } = await requireSalesManager();

  if (!uuidPattern.test(saleId)) {
    return null;
  }

  const { data: sale, error } = await supabase
    .from("sales")
    .select("id, customer_id, total_amount, status, user_id, created_at, updated_at")
    .eq("id", saleId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!sale) {
    return null;
  }

  const [customerResult, itemsResult] = await Promise.all([
    supabase
      .from("customers")
      .select("id, name, email, phone, address")
      .eq("id", sale.customer_id)
      .maybeSingle(),
    supabase
      .from("sale_items")
      .select("id, sale_id, product_id, quantity, unit_price, subtotal")
      .eq("sale_id", sale.id)
      .order("id"),
  ]);

  if (customerResult.error) {
    throw new Error(customerResult.error.message);
  }
  if (itemsResult.error) {
    throw new Error(itemsResult.error.message);
  }
  if (!customerResult.data) {
    return null;
  }

  const productIds = [
    ...new Set(itemsResult.data.map((item) => item.product_id)),
  ];
  const { data: products, error: productsError } =
    productIds.length > 0
      ? await supabase
          .from("products")
          .select("id, name, sku")
          .in("id", productIds)
      : { data: [], error: null };

  if (productsError) {
    throw new Error(productsError.message);
  }

  const productsById = new Map(products.map((product) => [product.id, product]));

  const lineItems = itemsResult.data.map((item) => {
    const product = productsById.get(item.product_id);
    if (!product) {
      throw new Error("Product information for a sale item could not be loaded.");
    }

    return { ...item, product };
  });

  return {
    ...sale,
    customer: customerResult.data,
    items: lineItems,
  };
}

export async function getSaleCreationOptions(): Promise<{
  customers: SaleCustomerOption[];
  products: Pick<ProductRow, "id" | "name" | "sku" | "unit_price">[];
}> {
  const { supabase } = await requireSalesManager();
  const [customersResult, productsResult] = await Promise.all([
    supabase
      .from("customers")
      .select("id, name, email")
      .eq("status", "active")
      .order("name"),
    supabase
      .from("products")
      .select("id, name, sku, unit_price")
      .eq("status", "active")
      .order("name"),
  ]);

  if (customersResult.error) {
    throw new Error(customersResult.error.message);
  }
  if (productsResult.error) {
    throw new Error(productsResult.error.message);
  }

  return {
    customers: customersResult.data,
    products: productsResult.data,
  };
}
