import Link from "next/link";
import { getEmployees } from "@/app/actions/employees";
import { getDepartments } from "@/app/actions/departments";
import { getHrAccess } from "@/utils/supabase/hr-access";
import type { EmployeeStatus } from "@/utils/supabase/database.types";

type EmployeesPageProps = {
  searchParams: Promise<{
    search?: string | string[];
    department?: string | string[];
    status?: string | string[];
    error?: string | string[];
    message?: string | string[];
  }>;
};

const statuses = ["active", "archived"] as const satisfies readonly EmployeeStatus[];

const errors: Record<string, string> = {
  forbidden: "You don't have permission to manage employees.",
  "not-found": "That employee could not be found.",
};

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function EmployeesPage({
  searchParams,
}: EmployeesPageProps) {
  const params = await searchParams;
  const search = firstParam(params.search)?.trim() ?? "";
  const requestedDepartment = firstParam(params.department) ?? "all";
  const requestedStatus = firstParam(params.status) ?? "all";
  const error = firstParam(params.error);
  const message = firstParam(params.message);
  const [departments, access] = await Promise.all([
    getDepartments(),
    getHrAccess(),
  ]);
  const validDepartment =
    requestedDepartment === "all" ||
    departments.some((department) => department.id === requestedDepartment)
      ? requestedDepartment
      : "all";
  const validStatus =
    requestedStatus === "all" ||
    statuses.some((status) => status === requestedStatus)
      ? requestedStatus
      : "all";
  const employees = await getEmployees(
    search,
    validDepartment,
    validStatus,
  );

  return (
    <main className="hrm-page">
      <header className="hrm-header">
        <div>
          <p className="eyebrow">HOPE, Inc.</p>
          <h1>Employees</h1>
          <p className="intro">Manage employee profiles and assignments.</p>
        </div>
        <div className="hrm-actions">
          <Link className="link-button secondary-button" href="/departments">
            Departments
          </Link>
          {access.canManageEmployees && (
            <Link className="link-button" href="/employees/new">
              Add employee
            </Link>
          )}
        </div>
      </header>

      {error && errors[error] && (
        <p className="form-message form-error" role="alert">
          {errors[error]}
        </p>
      )}
      {message === "archived" && (
        <p className="form-message form-notice" role="status">
          Employee archived.
        </p>
      )}
      {(requestedDepartment !== validDepartment ||
        requestedStatus !== validStatus) && (
        <p className="form-message form-error" role="alert">
          An unknown filter was ignored.
        </p>
      )}

      <form className="hrm-filters" action="/employees" method="get">
        <label>
          Search employees
          <input
            type="search"
            name="search"
            maxLength={100}
            placeholder="Search name, email, or position"
            defaultValue={search}
          />
        </label>
        <label>
          Department
          <select name="department" defaultValue={validDepartment}>
            <option value="all">All departments</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select name="status" defaultValue={validStatus}>
            <option value="all">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Apply filters</button>
      </form>

      <div className="hrm-table-wrap">
        <table className="hrm-table">
          <thead>
            <tr>
              <th scope="col">Employee</th>
              <th scope="col">Position</th>
              <th scope="col">Department</th>
              <th scope="col">Hire date</th>
              <th scope="col">Status</th>
              <th scope="col">
                <span className="visually-hidden">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td data-label="Employee">
                  <Link href={`/employees/${employee.id}`}>
                    {[employee.first_name, employee.last_name]
                      .filter(Boolean)
                      .join(" ") || employee.email || "Unnamed employee"}
                  </Link>
                  {employee.email && (
                    <span className="hrm-description">{employee.email}</span>
                  )}
                </td>
                <td data-label="Position">{employee.position ?? "—"}</td>
                <td data-label="Department">{employee.department_name ?? "—"}</td>
                <td data-label="Hire date">
                  <time dateTime={employee.hire_date}>
                    {new Date(`${employee.hire_date}T00:00:00`).toLocaleDateString()}
                  </time>
                </td>
                <td data-label="Status">
                  <span className={`hrm-status hrm-status-${employee.status}`}>
                    {employee.status}
                  </span>
                </td>
                <td data-label="Actions">
                  <Link href={`/employees/${employee.id}`}>View</Link>
                  {access.canManageEmployees && (
                    <>
                      {" · "}
                      <Link href={`/employees/${employee.id}/edit`}>Edit</Link>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td className="hrm-empty" colSpan={6}>
                  No employees match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
