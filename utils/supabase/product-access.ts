import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function getProductAccess() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!data.user) {
    redirect("/login");
  }

  const { data: canManageProducts, error: permissionError } =
    await supabase.rpc("is_product_manager");

  if (permissionError) {
    throw permissionError;
  }

  return {
    supabase,
    user: data.user,
    canManageProducts,
  };
}

export async function requireProductManager() {
  const access = await getProductAccess();

  if (!access.canManageProducts) {
    redirect("/products?error=forbidden");
  }

  return access;
}
