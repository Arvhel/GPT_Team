import Link from "next/link";
import { getDepartments, manageDepartments } from "@/app/actions/departments";
import { getHrAccess } from "@/utils/supabase/hr-access";

type DepartmentsPageProps = {
  searchParams: Promise<{
    error?: string | string[];
    message?: string | string[];
  }>;
};

export default async function DepartmentsPage({
  searchParams,
}: DepartmentsPageProps) {
  const [departments, access, params] = await Promise.all([
    getDepartments(),
    getHrAccess(),
    searchParams,
  ]);
  const error = Array.isArray(params.error) ? params.error[0] : params.error;
  const message = Array.isArray(params.message)
    ? params.message[0]
    : params.message;

  return (
    <main className="hrm-page">
      <Link className="hrm-back-link back-link" href="/employees">
        ← All employees
      </Link>
      <header className="hrm-header">
        <div>
          <p className="eyebrow">Employee directory</p>
          <h1>Departments</h1>
          <p className="intro">Manage the departments in your organization.</p>
        </div>
      </header>
      {error === "invalid-input" && (
        <p className="form-message form-error" role="alert">
          Enter a department name and check that all fields are within their limits.
        </p>
      )}
      {error === "name-exists" && (
        <p className="form-message form-error" role="alert">
          A department with that name already exists.
        </p>
      )}
      {error === "not-found" && (
        <p className="form-message form-error" role="alert">
          That department could not be found.
        </p>
      )}
      {error === "forbidden" && (
        <p className="form-message form-error" role="alert">
          You don’t have permission to manage departments.
        </p>
      )}
      {message === "saved" && (
        <p className="form-message form-notice" role="status">
          Department saved.
        </p>
      )}

      {access.canManageEmployees && (
        <form className="hrm-form" action={manageDepartments}>
          <input type="hidden" name="operation" value="create" />
          <h2>Add a department</h2>
          <div className="hrm-form-grid">
            <label>
              Department name
              <input name="name" required maxLength={120} />
            </label>
            <label>
              Description <span className="hrm-hint">(optional)</span>
              <input name="description" maxLength={2000} />
            </label>
          </div>
          <button type="submit">Create department</button>
        </form>
      )}

      <div className="hrm-table-wrap">
        <table className="hrm-table">
          <thead>
            <tr>
              <th scope="col">Department</th>
              <th scope="col">Description</th>
              {access.canManageEmployees && (
                <th scope="col">
                  <span className="visually-hidden">Actions</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {departments.map((department) => (
              <tr key={department.id}>
                {access.canManageEmployees ? (
                  <td colSpan={3} data-label="Department">
                    <form className="hrm-department-edit-form" action={manageDepartments}>
                      <input type="hidden" name="operation" value="update" />
                      <input type="hidden" name="id" value={department.id} />
                      <label>
                        <span className="visually-hidden">Department name</span>
                        <input
                          name="name"
                          required
                          maxLength={120}
                          defaultValue={department.name}
                        />
                      </label>
                      <label>
                        <span className="visually-hidden">Description</span>
                        <input
                          name="description"
                          maxLength={2000}
                          defaultValue={department.description ?? ""}
                        />
                      </label>
                      <button type="submit">Save</button>
                    </form>
                  </td>
                ) : (
                  <>
                    <td data-label="Department">{department.name}</td>
                    <td data-label="Description">
                      {department.description ?? "—"}
                    </td>
                  </>
                )}
              </tr>
            ))}
            {departments.length === 0 && (
              <tr>
                <td
                  className="hrm-empty"
                  colSpan={access.canManageEmployees ? 3 : 2}
                >
                  No departments have been created.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
