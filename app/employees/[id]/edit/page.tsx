import Link from "next/link";
import { notFound } from "next/navigation";
import { getEmployeeById, updateEmployee } from "@/app/actions/employees";
import { getDepartments } from "@/app/actions/departments";
import { requireHrManager } from "@/utils/supabase/hr-access";
import type { EmployeeStatus } from "@/utils/supabase/database.types";

type EditEmployeePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string | string[] }>;
};

const statuses: EmployeeStatus[] = ["active", "archived"];

export default async function EditEmployeePage({
  params,
  searchParams,
}: EditEmployeePageProps) {
  await requireHrManager();
  const [{ id }, query, departments] = await Promise.all([
    params,
    searchParams,
    getDepartments(),
  ]);
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const employee = await getEmployeeById(id);

  if (!employee) {
    notFound();
  }

  return (
    <main className="hrm-page">
      <Link className="hrm-back-link back-link" href={`/employees/${employee.id}`}>
        ← Employee profile
      </Link>
      <p className="eyebrow">Employee directory</p>
      <h1>Edit employee</h1>
      <p className="intro">
        Update {[employee.first_name, employee.last_name].filter(Boolean).join(" ")}.
      </p>
      {error === "invalid-input" && (
        <p className="form-message form-error" role="alert">
          Check the required fields, email address, hire date, and department.
        </p>
      )}
      {error === "email-exists" && (
        <p className="form-message form-error" role="alert">
          An employee with that email address already exists.
        </p>
      )}
      <form
        className="hrm-form"
        action={updateEmployee.bind(null, employee.id)}
      >
        <div className="hrm-form-grid">
          <label>
            First name
            <input
              name="first_name"
              required
              maxLength={100}
              autoComplete="given-name"
              defaultValue={employee.first_name ?? ""}
            />
          </label>
          <label>
            Last name
            <input
              name="last_name"
              required
              maxLength={100}
              autoComplete="family-name"
              defaultValue={employee.last_name ?? ""}
            />
          </label>
          <label>
            Email
            <input
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              defaultValue={employee.email ?? ""}
            />
          </label>
          <label>
            Phone <span className="hrm-hint">(optional)</span>
            <input
              name="phone"
              type="tel"
              maxLength={30}
              autoComplete="tel"
              defaultValue={employee.phone ?? ""}
            />
          </label>
          <label>
            Position
            <input
              name="position"
              required
              maxLength={150}
              defaultValue={employee.position ?? ""}
            />
          </label>
          <label>
            Department
            <select
              name="department_id"
              required
              defaultValue={employee.department_id ?? ""}
            >
              <option value="" disabled>
                Select a department
              </option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Hire date
            <input
              name="hire_date"
              type="date"
              required
              defaultValue={employee.hire_date}
            />
          </label>
          <label>
            Status
            <select name="status" defaultValue={employee.status}>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="hrm-actions">
          <button type="submit">Save changes</button>
          <Link
            className="link-button secondary-button"
            href={`/employees/${employee.id}`}
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}
