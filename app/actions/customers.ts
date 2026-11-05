"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { CustomerStatus } from "@/utils/supabase/database.types";
import {
  getCustomerAccess,
  requireCustomerManager,
} from "@/utils/supabase/customer-access";

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  status: CustomerStatus;
  created_at: string;
  updated_at: string;
};

const customerStatuses = ["active", "archived"] as const;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const customerFields =
  "id, name, email, phone, address, status, created_at, updated_at";

function isCustomerStatus(value: string): value is CustomerStatus {
  return customerStatuses.some((status) => status === value);
}

function readText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : null;
}

function parseCustomerForm(formData: FormData) {
  const name = readText(formData, "name");
  const email = readText(formData, "email");
  const phone = readText(formData, "phone") ?? "";
  const address = readText(formData, "address") ?? "";
  const status = readText(formData, "status") ?? "active";

  if (
    !name ||
    name.length > 200 ||
    !email ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    phone.length > 30 ||
    address.length > 1000 ||
    !isCustomerStatus(status)
  ) {
    return null;
  }

  return {
    name,
    email: email.toLowerCase(),
    phone: phone || null,
    address: address || null,
    status,
  };
}

function invalidCustomerForm(path: string): never {
  redirect(`${path}?error=invalid-input`);
}

export async function createCustomer(formData: FormData) {
  const { supabase } = await requireCustomerManager();
  const customer = parseCustomerForm(formData);
  const path = "/customers/new";

  if (!customer) {
    invalidCustomerForm(path);
  }

  const { data, error } = await supabase
    .from("customers")
    .insert(customer)
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/customers");
  redirect(`/customers/${data.id}`);
}

export async function updateCustomer(id: string, formData: FormData) {
  const { supabase } = await requireCustomerManager();

  if (!uuidPattern.test(id)) {
    redirect("/customers?error=not-found");
  }

  const path = `/customers/${encodeURIComponent(id)}/edit`;
  const customer = parseCustomerForm(formData);

  if (!customer) {
    invalidCustomerForm(path);
  }

  const { data, error } = await supabase
    .from("customers")
    .update(customer)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    redirect("/customers?error=not-found");
  }

  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  redirect(`/customers/${id}`);
}

export async function archiveCustomer(id: string) {
  const { supabase } = await requireCustomerManager();

  if (!uuidPattern.test(id)) {
    redirect("/customers?error=not-found");
  }

  const { data, error } = await supabase
    .from("customers")
    .update({ status: "archived" })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    redirect("/customers?error=not-found");
  }

  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  redirect("/customers?message=archived");
}

export async function getCustomers(
  searchQuery?: string,
  status?: string,
): Promise<Customer[]> {
  const { supabase } = await getCustomerAccess();
  const query = supabase
    .from("customers")
    .select(customerFields)
    .order("created_at", { ascending: false });
  const search = searchQuery?.trim().slice(0, 100);

  if (search) {
    const escapedSearch = search
      .replaceAll("\\", "\\\\")
      .replaceAll('"', '\\"')
      .replaceAll("%", "\\%")
      .replaceAll("_", "\\_");
    const pattern = `"%${escapedSearch}%"`;
    query.or(`name.ilike.${pattern},email.ilike.${pattern}`);
  }

  if (status && status !== "all") {
    if (!isCustomerStatus(status)) {
      throw new Error("Invalid customer status filter.");
    }

    query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const { supabase } = await getCustomerAccess();

  if (!uuidPattern.test(id)) {
    return null;
  }

  const { data, error } = await supabase
    .from("customers")
    .select(customerFields)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
