import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function getSalesAccess() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error("[sales] Unable to verify the current user.", error);
    throw new Error("Unable to verify your account. Please try again.");
  }

  if (!data.user) {
    redirect("/login");
  }

  const { data: canManageSales, error: permissionError } =
    await supabase.rpc("is_sales_manager");

  if (permissionError) {
    console.error("[sales] Unable to check sales permissions.", permissionError);
    throw new Error("Sales permissions could not be checked. Please try again.");
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
