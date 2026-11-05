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
import { throwSupabaseError } from "@/utils/supabase/action-errors";
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
    console.error("[sales.create] Supabase request failed.", error);
    const userMessage = error.message.includes("Insufficient stock")
      ? "Some selected products do not have enough stock. Update the quantities and try again."
      : error.message.includes("price changed")
        ? "A product price changed. Refresh the page and try again."
        : error.message.includes("no longer available")
          ? "A selected product is no longer active. Refresh the page and try again."
          : error.message.includes("active customer")
            ? "Select an active customer and try again."
            : "The sale could not be created. Please try again.";
    throw new Error(userMessage);
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

  const { data, error } = await supabase.rpc(
    "update_sale_status_transaction",
    {
      p_sale_id: saleId,
      p_status: status,
    },
  );

  if (error) {
    console.error("[sales.update-status] Supabase request failed.", error);
    if (error.message.includes("not enough stock")) {
      throw new Error(
        "This cancelled sale cannot be reopened because there is not enough stock.",
      );
    }
    throw new Error("The sale status could not be updated. Please try again.");
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
  const selectedStatus: SaleStatus | undefined =
    statusFilter && statusFilter !== "all" && isSaleStatus(statusFilter)
      ? statusFilter
      : undefined;

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
      throwSupabaseError(
        "sales.search-customers",
        error,
        "Sales could not be searched. Please try again.",
      );
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

  if (selectedStatus) {
    query = query.eq("status", selectedStatus);
  }

  if (matchingCustomerIds) {
    query = query.in("customer_id", matchingCustomerIds);
  }

  const { data: sales, error } = await query;
  if (error) {
    throwSupabaseError(
      "sales.list",
      error,
      "Sales could not be loaded. Please try again.",
    );
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
    throwSupabaseError(
      "sales.customer-details",
      customersError,
      "Customer information for sales could not be loaded. Please try again.",
    );
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
    throwSupabaseError(
      "sales.details",
      error,
      "Sale details could not be loaded. Please try again.",
    );
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
    throwSupabaseError(
      "sales.details-customer",
      customerResult.error,
      "Customer information for the sale could not be loaded. Please try again.",
    );
  }
  if (itemsResult.error) {
    throwSupabaseError(
      "sales.details-items",
      itemsResult.error,
      "Sale items could not be loaded. Please try again.",
    );
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
    throwSupabaseError(
      "sales.details-products",
      productsError,
      "Product information for the sale could not be loaded. Please try again.",
    );
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
  products: (Pick<ProductRow, "id" | "name" | "sku" | "unit_price"> & {
    stock_quantity: number;
  })[];
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
    throwSupabaseError(
      "sales.customer-options",
      customersResult.error,
      "Available customers could not be loaded. Please try again.",
    );
  }
  if (productsResult.error) {
    throwSupabaseError(
      "sales.product-options",
      productsResult.error,
      "Available products could not be loaded. Please try again.",
    );
  }

  const { data: inventory, error: inventoryError } =
    productsResult.data.length > 0
      ? await supabase
          .from("product_inventory")
          .select("product_id, stock_quantity")
          .in(
            "product_id",
            productsResult.data.map((product) => product.id),
          )
      : { data: [], error: null };

  if (inventoryError) {
    throwSupabaseError(
      "sales.inventory-options",
      inventoryError,
      "Available stock could not be loaded. Please try again.",
    );
  }

  const stockByProductId = new Map(
    inventory.map((item) => [item.product_id, item.stock_quantity]),
  );

  return {
    customers: customersResult.data,
    products: productsResult.data.flatMap((product) => {
      const stockQuantity = stockByProductId.get(product.id) ?? 0;
      return stockQuantity > 0
        ? [{ ...product, stock_quantity: stockQuantity }]
        : [];
    }),
  };
}
