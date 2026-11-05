import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function getHrAccess() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!data.user) {
    redirect("/login");
  }

  const { data: canManageEmployees, error: permissionError } =
    await supabase.rpc("is_hr_admin");

  if (permissionError) {
    throw permissionError;
  }

  return {
    supabase,
    user: data.user,
    canManageEmployees,
  };
}

export async function requireHrManager() {
  const access = await getHrAccess();

  if (!access.canManageEmployees) {
    redirect("/employees?error=forbidden");
  }

  return access;
}
