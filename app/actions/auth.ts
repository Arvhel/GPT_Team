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
  if (!credentials || credentials.password.length < 6) {
    redirect("/login?error=invalid-input");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp(credentials);

  if (error) {
    console.error("[auth.signup] Supabase Auth request failed.", error);
    redirect("/login?error=signup-failed");
  }

  if (data.session) {
    redirect("/dashboard");
  }

  redirect("/login?message=check-email");
}

export async function login(formData: FormData) {
  const credentials = getCredentials(formData);
  if (!credentials) {
    redirect("/login?error=invalid-input");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    console.error("[auth.login] Supabase Auth request failed.", error);
    redirect("/login?error=login-failed");
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("[auth.logout] Supabase Auth request failed.", error);
    redirect("/login?error=logout-failed");
  }

  redirect("/login?message=signed-out");
}

export async function resetPassword(formData: FormData) {
  const email = formData.get("email");

  if (typeof email !== "string" || !email.trim()) {
    redirect("/forgot-password?error=invalid-input");
  }

  const origin = (await headers()).get("origin");
  if (!origin) {
    redirect("/forgot-password?error=request-failed");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: new URL("/reset-password", origin).toString(),
  });

  if (error) {
    console.error("[auth.reset-password] Supabase Auth request failed.", error);
    redirect("/forgot-password?error=reset-failed");
  }

  redirect("/forgot-password?message=check-email");
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
    redirect("/reset-password?error=invalid-password");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    console.error("[auth.update-password] Supabase Auth request failed.", error);
    redirect("/reset-password?error=update-failed");
  }

  redirect("/dashboard?message=password-updated");
}
