import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function getProductAccess() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error("[products] Unable to verify the current user.", error);
    throw new Error("Unable to verify your account. Please try again.");
  }

  if (!data.user) {
    redirect("/login");
  }

  const { data: canManageProducts, error: permissionError } =
    await supabase.rpc("is_product_manager");

  if (permissionError) {
    console.error("[products] Unable to check product permissions.", permissionError);
    throw new Error("Product permissions could not be checked. Please try again.");
  }

  return { supabase, user: data.user, canManageProducts };
}

export async function requireProductManager() {
  const access = await getProductAccess();

  if (!access.canManageProducts) {
    redirect("/products?error=forbidden");
  }

  return access;
}
