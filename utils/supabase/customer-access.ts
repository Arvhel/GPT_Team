import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function getCustomerAccess() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    redirect("/login");
  }

  const { data: canManageCustomers, error: permissionError } =
    await supabase.rpc("is_customer_manager");

  if (permissionError) {
    throw new Error(permissionError.message);
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
