import Link from "next/link";
import { createEmployee } from "@/app/actions/employees";
import { getDepartments } from "@/app/actions/departments";
import { requireHrManager } from "@/utils/supabase/hr-access";

type NewEmployeePageProps = {
  searchParams: Promise<{ error?: string | string[] }>;
};

export default async function NewEmployeePage({
  searchParams,
}: NewEmployeePageProps) {
  await requireHrManager();
  const [departments, params] = await Promise.all([
    getDepartments(),
    searchParams,
  ]);
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  return (
    <main className="hrm-page">
      <Link className="hrm-back-link back-link" href="/employees">
        ← All employees
      </Link>
      <p className="eyebrow">Employee directory</p>
      <h1>Add an employee</h1>
      <p className="intro">Enter the employee’s profile and assignment.</p>
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
      {departments.length === 0 && (
        <p className="form-message form-error" role="alert">
          Create a department before adding an employee.{" "}
          <Link href="/departments">Manage departments</Link>
        </p>
      )}
      <form className="hrm-form" action={createEmployee}>
        <div className="hrm-form-grid">
          <label>
            First name
            <input name="first_name" required maxLength={100} autoComplete="given-name" />
          </label>
          <label>
            Last name
            <input name="last_name" required maxLength={100} autoComplete="family-name" />
          </label>
          <label>
            Email
            <input
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
            />
          </label>
          <label>
            Phone <span className="hrm-hint">(optional)</span>
            <input name="phone" type="tel" maxLength={30} autoComplete="tel" />
          </label>
          <label>
            Position
            <input name="position" required maxLength={150} />
          </label>
          <label>
            Department
            <select name="department_id" required defaultValue="">
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
              defaultValue={new Date().toISOString().slice(0, 10)}
            />
          </label>
        </div>
        <div className="hrm-actions">
          <button type="submit" disabled={departments.length === 0}>
            Create employee
          </button>
          <Link className="link-button secondary-button" href="/employees">
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}
