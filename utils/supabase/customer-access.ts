import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function getCustomerAccess() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error("[customers] Unable to verify the current user.", error);
    throw new Error("Unable to verify your account. Please try again.");
  }

  if (!data.user) {
    redirect("/login");
  }

  const { data: canManageCustomers, error: permissionError } =
    await supabase.rpc("is_customer_manager");

  if (permissionError) {
    console.error("[customers] Unable to check customer permissions.", permissionError);
    throw new Error("Customer permissions could not be checked. Please try again.");
  }

  return {
    supabase,
    user: data.user,
    canManageCustomers,
  };
}

export async function requireCustomerManager() {
  const access = await getCustomerAccess();

  if (!access.canManageCustomers) {
    redirect("/customers?error=forbidden");
  }

  return access;
}
