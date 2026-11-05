import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function getHrAccess() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error("[hr] Unable to verify the current user.", error);
    throw new Error("Unable to verify your account. Please try again.");
  }

  if (!data.user) {
    redirect("/login");
  }

  const { data: canManageEmployees, error: permissionError } =
    await supabase.rpc("is_hr_admin");

  if (permissionError) {
    console.error("[hr] Unable to check HR permissions.", permissionError);
    throw new Error("HR permissions could not be checked. Please try again.");
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
