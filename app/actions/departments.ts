"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { throwSupabaseError } from "@/utils/supabase/action-errors";
import { getHrAccess, requireHrManager } from "@/utils/supabase/hr-access";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getDepartments() {
  const { supabase } = await getHrAccess();
  const { data, error } = await supabase
    .from("departments")
    .select("id, name, description, created_at")
    .order("name");

  if (error) {
    throwSupabaseError(
      "departments.list",
      error,
      "Departments could not be loaded. Please try again.",
    );
  }

  return data;
}

export async function manageDepartments(formData: FormData) {
  const { supabase } = await requireHrManager();
  const operation = formData.get("operation");
  const nameValue = formData.get("name");
  const descriptionValue = formData.get("description");
  const name = typeof nameValue === "string" ? nameValue.trim() : "";
  const description =
    typeof descriptionValue === "string" ? descriptionValue.trim() : "";
  const idValue = formData.get("id");
  const id = typeof idValue === "string" ? idValue : "";
  const isUpdate = operation === "update";
  const formPath = "/departments";

  if (
    (operation !== "create" && !isUpdate) ||
    !name ||
    name.length > 120 ||
    description.length > 2000 ||
    (isUpdate && !uuidPattern.test(id))
  ) {
    redirect(`${formPath}?error=invalid-input`);
  }

  const { data, error } = isUpdate
    ? await supabase
        .from("departments")
        .update({ name, description: description || null })
        .eq("id", id)
        .select("id")
        .maybeSingle()
    : await supabase
        .from("departments")
        .insert({ name, description: description || null })
        .select("id")
        .single();

  if (error) {
    if (error.code === "23505") {
      redirect(`${formPath}?error=name-exists`);
    }

    throwSupabaseError(
      "departments.save",
      error,
      "The department could not be saved. Please try again.",
    );
  }

  if (isUpdate && !data) {
    redirect(`${formPath}?error=not-found`);
  }

  revalidatePath("/departments");
  revalidatePath("/employees");
  redirect("/departments?message=saved");
}
