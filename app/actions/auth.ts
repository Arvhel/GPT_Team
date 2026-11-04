"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

function getCredentials(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    return null;
  }

  return { email: email.trim(), password };
}

export async function signup(formData: FormData) {
  const credentials = getCredentials(formData);
  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");
  const company = formData.get("company");

  if (
    !credentials ||
    credentials.password.length < 8 ||
    typeof firstName !== "string" ||
    !firstName.trim() ||
    typeof lastName !== "string" ||
    !lastName.trim() ||
    typeof company !== "string" ||
    !company.trim()
  ) {
    redirect("/?auth=signup&error=invalid-input");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    ...credentials,
    options: {
      data: {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        company_name: company.trim(),
      },
    },
  });

  if (error) {
    redirect("/?auth=signup&error=signup-failed");
  }

  if (data.session) {
    redirect("/dashboard");
  }

  redirect("/?auth=login&message=check-email");
}

export async function login(formData: FormData) {
  const credentials = getCredentials(formData);
  if (!credentials) {
    redirect("/?auth=login&error=invalid-input");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    redirect("/?auth=login&error=login-failed");
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    redirect("/?auth=login&error=logout-failed");
  }

  redirect("/?auth=login&message=signed-out");
}

export async function resetPassword(formData: FormData) {
  const email = formData.get("email");

  if (typeof email !== "string" || !email.trim()) {
    redirect("/?auth=forgot&error=invalid-input");
  }

  const origin = (await headers()).get("origin");
  if (!origin) {
    redirect("/?auth=forgot&error=request-failed");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: new URL("/reset-password", origin).toString(),
  });

  if (error) {
    redirect("/?auth=forgot&error=reset-failed");
  }

  redirect("/?auth=forgot&message=reset-email");
}

export async function updatePassword(formData: FormData) {
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (
    typeof password !== "string" ||
    typeof confirmPassword !== "string" ||
    password.length < 8 ||
    password !== confirmPassword
  ) {
    redirect("/?auth=reset&error=invalid-password");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect("/?auth=reset&error=update-failed");
  }

  redirect("/dashboard?message=password-updated");
}
