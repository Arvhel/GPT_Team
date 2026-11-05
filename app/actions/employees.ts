"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { EmployeeStatus } from "@/utils/supabase/database.types";
import { throwSupabaseError } from "@/utils/supabase/action-errors";
import { getHrAccess, requireHrManager } from "@/utils/supabase/hr-access";

const employeeStatuses = ["active", "archived"] as const;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const employeeFields =
  "id, first_name, last_name, email, phone, position, department_id, hire_date, status, created_at, updated_at";

export type Employee = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  position: string | null;
  department_id: string | null;
  department_name: string | null;
  hire_date: string;
  status: EmployeeStatus;
  created_at: string;
  updated_at: string;
};

function isEmployeeStatus(value: string): value is EmployeeStatus {
  return employeeStatuses.some((status) => status === value);
}

function readText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : null;
}

function parseEmployeeForm(formData: FormData) {
  const firstName = readText(formData, "first_name");
  const lastName = readText(formData, "last_name");
  const email = readText(formData, "email");
  const phone = readText(formData, "phone") ?? "";
  const position = readText(formData, "position");
  const departmentId = readText(formData, "department_id");
  const hireDate = readText(formData, "hire_date");
  const requestedStatus = readText(formData, "status") ?? "active";
  const parsedDate =
    hireDate && /^\d{4}-\d{2}-\d{2}$/.test(hireDate)
      ? new Date(`${hireDate}T00:00:00.000Z`)
      : null;

  if (
    !firstName ||
    firstName.length > 100 ||
    !lastName ||
    lastName.length > 100 ||
    !email ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    phone.length > 30 ||
    !position ||
    position.length > 150 ||
    !departmentId ||
    !uuidPattern.test(departmentId) ||
    !hireDate ||
    !parsedDate ||
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== hireDate ||
    !isEmployeeStatus(requestedStatus)
  ) {
    return null;
  }

  return {
    first_name: firstName,
    last_name: lastName,
    email: email.toLowerCase(),
    phone: phone || null,
    position,
    department_id: departmentId,
    hire_date: hireDate,
    status: requestedStatus,
  };
}

function invalidEmployeeForm(path: string): never {
  redirect(`${path}?error=invalid-input`);
}

async function validateDepartment(
  supabase: Awaited<ReturnType<typeof requireHrManager>>["supabase"],
  departmentId: string,
  errorPath: string,
) {
  const { data, error } = await supabase
    .from("departments")
    .select("id")
    .eq("id", departmentId)
    .maybeSingle();

  if (error) {
    throwSupabaseError(
      "employees.department-validation",
      error,
      "The department could not be verified. Please try again.",
    );
  }

  if (!data) {
    invalidEmployeeForm(errorPath);
  }
}

async function addDepartmentNames(
  supabase: Awaited<ReturnType<typeof getHrAccess>>["supabase"],
  employees: Array<{
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
    position: string | null;
    department_id: string | null;
    hire_date: string;
    status: EmployeeStatus;
    created_at: string;
    updated_at: string;
  }>,
): Promise<Employee[]> {
  const departmentIds = [
    ...new Set(
      employees
        .map((employee) => employee.department_id)
        .filter((id): id is string => id !== null),
    ),
  ];

  if (departmentIds.length === 0) {
    return employees.map((employee) => ({ ...employee, department_name: null }));
  }

  const { data: departments, error } = await supabase
    .from("departments")
    .select("id, name")
    .in("id", departmentIds);

  if (error) {
    throwSupabaseError(
      "employees.department-names",
      error,
      "Department information could not be loaded. Please try again.",
    );
  }

  const departmentNames = new Map(
    departments.map((department) => [department.id, department.name]),
  );

  return employees.map((employee) => ({
    ...employee,
    department_name:
      employee.department_id === null
        ? null
        : (departmentNames.get(employee.department_id) ?? null),
  }));
}

export async function createEmployee(formData: FormData) {
  const { supabase } = await requireHrManager();
  const employee = parseEmployeeForm(formData);
  const path = "/employees/new";

  if (!employee) {
    invalidEmployeeForm(path);
  }

  await validateDepartment(supabase, employee.department_id, path);

  const { data, error } = await supabase
    .from("employees")
    .insert({
      ...employee,
      job_title: employee.position,
      employee_code: null,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      redirect(`${path}?error=email-exists`);
    }

    throwSupabaseError(
      "employees.create",
      error,
      "The employee could not be created. Please try again.",
    );
  }

  revalidatePath("/employees");
  redirect(`/employees/${data.id}`);
}

export async function updateEmployee(id: string, formData: FormData) {
  const { supabase } = await requireHrManager();

  if (!uuidPattern.test(id)) {
    redirect("/employees?error=not-found");
  }

  const path = `/employees/${encodeURIComponent(id)}/edit`;
  const employee = parseEmployeeForm(formData);

  if (!employee) {
    invalidEmployeeForm(path);
  }

  await validateDepartment(supabase, employee.department_id, path);

  const { data, error } = await supabase
    .from("employees")
    .update({
      ...employee,
      job_title: employee.position,
    })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      redirect(`${path}?error=email-exists`);
    }

    throwSupabaseError(
      "employees.update",
      error,
      "The employee could not be updated. Please try again.",
    );
  }

  if (!data) {
    redirect("/employees?error=not-found");
  }

  revalidatePath("/employees");
  revalidatePath(`/employees/${id}`);
  redirect(`/employees/${id}`);
}

export async function archiveEmployee(id: string) {
  const { supabase } = await requireHrManager();

  if (!uuidPattern.test(id)) {
    redirect("/employees?error=not-found");
  }

  const { data, error } = await supabase
    .from("employees")
    .update({ status: "archived" })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    throwSupabaseError(
      "employees.archive",
      error,
      "The employee could not be archived. Please try again.",
    );
  }

  if (!data) {
    redirect("/employees?error=not-found");
  }

  revalidatePath("/employees");
  revalidatePath(`/employees/${id}`);
  redirect("/employees?message=archived");
}

export async function getEmployees(
  searchQuery?: string,
  departmentId?: string,
  status?: string,
): Promise<Employee[]> {
  const { supabase } = await getHrAccess();
  const query = supabase
    .from("employees")
    .select(employeeFields)
    .order("created_at", { ascending: false });
  const search = searchQuery?.trim().slice(0, 100);

  if (search) {
    const escapedSearch = search
      .replaceAll("\\", "\\\\")
      .replaceAll('"', '\\"')
      .replaceAll("%", "\\%")
      .replaceAll("_", "\\_");
    const pattern = `"%${escapedSearch}%"`;
    query.or(
      `first_name.ilike.${pattern},last_name.ilike.${pattern},email.ilike.${pattern},position.ilike.${pattern}`,
    );
  }

  if (departmentId && departmentId !== "all") {
    if (!uuidPattern.test(departmentId)) {
      throw new Error("Invalid department filter.");
    }

    query.eq("department_id", departmentId);
  }

  if (status && status !== "all") {
    if (!isEmployeeStatus(status)) {
      throw new Error("Invalid employee status filter.");
    }

    query.eq("status", status);
  }

  const { data: employees, error } = await query;

  if (error) {
    throwSupabaseError(
      "employees.list",
      error,
      "Employees could not be loaded. Please try again.",
    );
  }

  return addDepartmentNames(supabase, employees);
}

export async function getEmployeeById(id: string): Promise<Employee | null> {
  const { supabase } = await getHrAccess();

  if (!uuidPattern.test(id)) {
    return null;
  }

  const { data: employee, error } = await supabase
    .from("employees")
    .select(employeeFields)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throwSupabaseError(
      "employees.details",
      error,
      "Employee details could not be loaded. Please try again.",
    );
  }

  if (!employee) {
    return null;
  }

  const [enrichedEmployee] = await addDepartmentNames(supabase, [employee]);
  return enrichedEmployee;
}
