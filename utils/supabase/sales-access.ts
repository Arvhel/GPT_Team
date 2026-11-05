import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function getSalesAccess() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    redirect("/login");
  }

  const { data: canManageSales, error: permissionError } =
    await supabase.rpc("is_sales_manager");

  if (permissionError) {
    throw new Error(permissionError.message);
  }

  return {
    supabase,
    user: data.user,
    canManageSales,
  };
}

export async function requireSalesManager() {
  const access = await getSalesAccess();

  if (!access.canManageSales) {
    redirect("/sales?error=forbidden");
  }

  return access;
}
