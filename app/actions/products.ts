"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type {
  ProductRow,
  ProductStatus,
} from "@/utils/supabase/database.types";
import { throwSupabaseError } from "@/utils/supabase/action-errors";
import { requireProductManager } from "@/utils/supabase/product-access";

export type ManagedProduct = Pick<
  ProductRow,
  | "id"
  | "category_id"
  | "sku"
  | "name"
  | "description"
  | "unit_price"
  | "status"
  | "created_at"
  | "updated_at"
> & {
  category_name: string | null;
  stock_quantity: number;
};

export type ProductCategory = { id: string; name: string };

const productStatuses = ["draft", "active", "archived", "out_of_stock"] as const;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isProductStatus(value: string): value is ProductStatus {
  return productStatuses.some((status) => status === value);
}

export async function getProducts(): Promise<{
  products: ManagedProduct[];
  categories: ProductCategory[];
}> {
  const { supabase } = await requireProductManager();
  const [productsResult, categoriesResult] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, category_id, sku, name, description, unit_price, status, created_at, updated_at",
      )
      .order("name"),
    supabase.from("product_categories").select("id, name").order("name"),
  ]);

  if (productsResult.error) {
    throwSupabaseError(
      "products.list",
      productsResult.error,
      "Products could not be loaded. Please try again.",
    );
  }
  if (categoriesResult.error) {
    throwSupabaseError(
      "products.categories",
      categoriesResult.error,
      "Product categories could not be loaded. Please try again.",
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
      "products.inventory",
      inventoryError,
      "Product stock levels could not be loaded. Please try again.",
    );
  }

  const categoriesById = new Map(
    categoriesResult.data.map((category) => [category.id, category.name]),
  );
  const inventoryByProductId = new Map(
    inventory.map((item) => [item.product_id, item.stock_quantity]),
  );

  return {
    categories: categoriesResult.data,
    products: productsResult.data.map((product) => ({
      ...product,
      category_name: product.category_id
        ? (categoriesById.get(product.category_id) ?? null)
        : null,
      stock_quantity: inventoryByProductId.get(product.id) ?? 0,
    })),
  };
}

export async function saveProduct(formData: FormData) {
  const { supabase } = await requireProductManager();
  const rawId = formData.get("id");
  const id = typeof rawId === "string" ? rawId.trim() : "";
  const rawCategoryId = formData.get("category_id");
  const categoryId =
    typeof rawCategoryId === "string" && rawCategoryId.trim()
      ? rawCategoryId.trim()
      : null;
  const name = formData.get("name");
  const sku = formData.get("sku");
  const description = formData.get("description");
  const rawPrice = formData.get("unit_price");
  const rawStock = formData.get("stock_quantity");
  const rawStatus = formData.get("status");
  const status = typeof rawStatus === "string" ? rawStatus : "";
  const price = typeof rawPrice === "string" ? Number(rawPrice) : Number.NaN;
  const stock = typeof rawStock === "string" ? Number(rawStock) : Number.NaN;
  const invalidPath = "/products?error=invalid-input";

  if (
    (id && !uuidPattern.test(id)) ||
    (categoryId && !uuidPattern.test(categoryId)) ||
    typeof name !== "string" ||
    !name.trim() ||
    name.trim().length > 200 ||
    typeof sku !== "string" ||
    !sku.trim() ||
    sku.trim().length > 64 ||
    typeof description !== "string" ||
    description.trim().length > 2000 ||
    !Number.isFinite(price) ||
    price < 0 ||
    price > 9_999_999_999.99 ||
    !/^(0|[1-9]\d*)(\.\d{1,2})?$/.test(String(rawPrice)) ||
    !Number.isSafeInteger(stock) ||
    stock < 0 ||
    stock > 2_147_483_647 ||
    !isProductStatus(status)
  ) {
    redirect(invalidPath);
  }

  const { data: productId, error } = await supabase.rpc("save_product", {
    p_product_id: id || null,
    p_category_id: categoryId,
    p_sku: sku.trim().toUpperCase(),
    p_name: name.trim(),
    p_description: description.trim() || null,
    p_unit_price: price,
    p_stock_quantity: stock,
    p_status: status,
  });

  if (error) {
    if (error.code === "23505") {
      redirect("/products?error=sku-exists");
    }
    console.error("[products.save] Supabase request failed.", error);
    redirect("/products?error=save-failed");
  }

  if (!productId) {
    redirect("/products?error=not-found");
  }

  revalidatePath("/products");
  revalidatePath("/sales/new");
  redirect("/products?message=saved");
}
