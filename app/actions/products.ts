"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ProductStatus } from "@/utils/supabase/database.types";
import {
  getProductAccess,
  requireProductManager,
} from "@/utils/supabase/product-access";

export type Product = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  unit_price: number;
  cost_price: number | null;
  stock_quantity: number;
  status: ProductStatus;
  user_id: string | null;
  created_at: string;
  updated_at: string;
};

const productStatuses: ProductStatus[] = [
  "draft",
  "active",
  "archived",
  "out_of_stock",
];

const productIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const maxPrice = 9_999_999_999.99;
const maxStock = 2_147_483_647;

function isProductStatus(value: string): value is ProductStatus {
  return productStatuses.includes(value as ProductStatus);
}

function readText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : null;
}

function parseProductForm(formData: FormData) {
  const name = readText(formData, "name");
  const sku = readText(formData, "sku");
  const description = readText(formData, "description");
  const priceValue = readText(formData, "unit_price");
  const stockValue = readText(formData, "stock_quantity");
  const statusValue = readText(formData, "status") ?? "active";
  const costPriceValue = readText(formData, "cost_price");

  if (
    !name ||
    name.length > 200 ||
    !sku ||
    sku.length > 100 ||
    description === null ||
    description.length > 5000 ||
    !priceValue ||
    !/^\d+(?:\.\d{1,2})?$/.test(priceValue) ||
    !stockValue ||
    !/^\d+$/.test(stockValue) ||
    !isProductStatus(statusValue)
  ) {
    return null;
  }

  const unitPrice = Number(priceValue);
  const stockQuantity = Number(stockValue);
  const costPrice =
    costPriceValue === "" || costPriceValue === null
      ? null
      : /^\d+(?:\.\d{1,2})?$/.test(costPriceValue)
        ? Number(costPriceValue)
        : Number.NaN;

  if (
    !Number.isFinite(unitPrice) ||
    unitPrice > maxPrice ||
    !Number.isSafeInteger(stockQuantity) ||
    stockQuantity < 0 ||
    stockQuantity > maxStock ||
    (costPrice !== null &&
      (!Number.isFinite(costPrice) || costPrice < 0 || costPrice > maxPrice))
  ) {
    return null;
  }

  return {
    name,
    sku,
    description: description || null,
    unit_price: unitPrice,
    cost_price: costPrice,
    stock_quantity: stockQuantity,
    status: statusValue,
  };
}

function invalidProductForm(path: string): never {
  redirect(`${path}?error=invalid-input`);
}

async function saveProductStock(
  supabase: Awaited<ReturnType<typeof getProductAccess>>["supabase"],
  productId: string,
  stockQuantity: number,
) {
  const { error } = await supabase.from("product_inventory").upsert(
    {
      product_id: productId,
      stock_quantity: stockQuantity,
    },
    { onConflict: "product_id" },
  );

  if (error) {
    throw error;
  }
}

export async function createProduct(formData: FormData) {
  const { supabase, user } = await requireProductManager();
  const product = parseProductForm(formData);

  if (!product) {
    invalidProductForm("/products/new");
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      category_id: null,
      sku: product.sku,
      name: product.name,
      description: product.description,
      unit_price: product.unit_price,
      cost_price: product.cost_price,
      status: product.status,
      user_id: user.id,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      redirect("/products/new?error=sku-exists");
    }

    throw error;
  }

  await saveProductStock(supabase, data.id, product.stock_quantity);
  revalidatePath("/products");
  redirect(`/products/${data.id}`);
}

export async function updateProduct(id: string, formData: FormData) {
  const { supabase } = await requireProductManager();
  const editPath = `/products/${encodeURIComponent(id)}/edit`;

  if (!productIdPattern.test(id)) {
    redirect("/products?error=not-found");
  }

  const product = parseProductForm(formData);
  if (!product) {
    invalidProductForm(editPath);
  }

  const { data, error } = await supabase
    .from("products")
    .update({
      sku: product.sku,
      name: product.name,
      description: product.description,
      unit_price: product.unit_price,
      cost_price: product.cost_price,
      status: product.status,
    })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      redirect(`${editPath}?error=sku-exists`);
    }

    throw error;
  }

  if (!data) {
    redirect("/products?error=not-found");
  }

  await saveProductStock(supabase, data.id, product.stock_quantity);
  revalidatePath("/products");
  revalidatePath(`/products/${id}`);
  redirect(`/products/${id}`);
}

export async function deleteOrArchiveProduct(id: string) {
  const { supabase } = await requireProductManager();

  if (!productIdPattern.test(id)) {
    redirect("/products?error=not-found");
  }

  const { data, error } = await supabase
    .from("products")
    .update({ status: "archived" })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    redirect("/products?error=not-found");
  }

  revalidatePath("/products");
  revalidatePath(`/products/${id}`);
  redirect("/products?message=archived");
}

export async function getProducts(
  searchQuery?: string,
  filterStatus?: string,
): Promise<Product[]> {
  const { supabase } = await getProductAccess();
  const query = supabase
    .from("products")
    .select(
      "id, sku, name, description, unit_price, cost_price, status, user_id, created_at, updated_at",
    )
    .order("created_at", { ascending: false });

  const search = searchQuery?.trim().slice(0, 100);
  if (search) {
    query.ilike("name", `%${search}%`);
  }

  if (filterStatus && filterStatus !== "all") {
    if (!isProductStatus(filterStatus)) {
      throw new Error("Invalid product status filter.");
    }

    query.eq("status", filterStatus);
  }

  const { data: products, error } = await query;
  if (error) {
    throw error;
  }

  if (products.length === 0) {
    return [];
  }

  const { data: inventory, error: inventoryError } = await supabase
    .from("product_inventory")
    .select("product_id, stock_quantity")
    .in(
      "product_id",
      products.map((product) => product.id),
    );

  if (inventoryError) {
    throw inventoryError;
  }

  const stockByProductId = new Map(
    inventory.map((row) => [row.product_id, row.stock_quantity]),
  );

  return products.map((product) => ({
    ...product,
    stock_quantity: stockByProductId.get(product.id) ?? 0,
  }));
}

export async function getProductById(id: string): Promise<Product | null> {
  const { supabase } = await getProductAccess();

  if (!productIdPattern.test(id)) {
    return null;
  }

  const { data: product, error } = await supabase
    .from("products")
    .select(
      "id, sku, name, description, unit_price, cost_price, status, user_id, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!product) {
    return null;
  }

  const { data: inventory, error: inventoryError } = await supabase
    .from("product_inventory")
    .select("stock_quantity")
    .eq("product_id", id)
    .maybeSingle();

  if (inventoryError) {
    throw inventoryError;
  }

  return { ...product, stock_quantity: inventory?.stock_quantity ?? 0 };
}
