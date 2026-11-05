import Link from "next/link";
import { notFound } from "next/navigation";
import { archiveEmployee, getEmployeeById } from "@/app/actions/employees";
import { getHrAccess } from "@/utils/supabase/hr-access";

type EmployeeDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EmployeeDetailsPage({
  params,
}: EmployeeDetailsPageProps) {
  const { id } = await params;
  const [employee, access] = await Promise.all([
    getEmployeeById(id),
    getHrAccess(),
  ]);

  if (!employee) {
    notFound();
  }

  return (
    <main className="hrm-page">
      <Link className="hrm-back-link back-link" href="/employees">
        ← All employees
      </Link>
      <header className="hrm-header">
        <div>
          <p className="eyebrow">Employee profile</p>
          <h1>
            {[employee.first_name, employee.last_name].filter(Boolean).join(" ")}
          </h1>
          <p className="intro">{employee.position ?? "Position not provided"}</p>
        </div>
        <span className={`hrm-status hrm-status-${employee.status}`}>
          {employee.status}
        </span>
      </header>

      <dl className="hrm-details">
        <div>
          <dt>Email</dt>
          <dd>
            {employee.email ? (
              <a href={`mailto:${employee.email}`}>{employee.email}</a>
            ) : (
              "Not provided"
            )}
          </dd>
        </div>
        <div>
          <dt>Phone</dt>
          <dd>
            {employee.phone ? (
              <a href={`tel:${employee.phone}`}>{employee.phone}</a>
            ) : (
              "Not provided"
            )}
          </dd>
        </div>
        <div>
          <dt>Department</dt>
          <dd>{employee.department_name ?? "Not assigned"}</dd>
        </div>
        <div>
          <dt>Hire date</dt>
          <dd>
            <time dateTime={employee.hire_date}>
              {new Date(`${employee.hire_date}T00:00:00`).toLocaleDateString()}
            </time>
          </dd>
        </div>
        <div>
          <dt>Profile created</dt>
          <dd>
            <time dateTime={employee.created_at}>
              {new Date(employee.created_at).toLocaleDateString()}
            </time>
          </dd>
        </div>
      </dl>

      {access.canManageEmployees && (
        <div className="hrm-actions">
          <Link
            className="link-button"
            href={`/employees/${employee.id}/edit`}
          >
            Edit employee
          </Link>
          {employee.status !== "archived" && (
            <form action={archiveEmployee.bind(null, employee.id)}>
              <button className="hrm-danger-button" type="submit">
                Archive employee
              </button>
            </form>
          )}
        </div>
      )}
    </main>
  );
}
