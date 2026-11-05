import Link from "next/link";
import { getCustomers } from "@/app/actions/customers";
import { getCustomerAccess } from "@/utils/supabase/customer-access";
import type { CustomerStatus } from "@/utils/supabase/database.types";

type CustomersPageProps = {
  searchParams: Promise<{
    search?: string | string[];
    status?: string | string[];
    error?: string | string[];
    message?: string | string[];
  }>;
};

const statuses = ["active", "archived"] as const satisfies readonly CustomerStatus[];

const errors: Record<string, string> = {
  forbidden: "You don't have permission to manage customers.",
  "not-found": "That customer could not be found.",
};

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CustomersPage({
  searchParams,
}: CustomersPageProps) {
  const params = await searchParams;
  const search = firstParam(params.search)?.trim() ?? "";
  const requestedStatus = firstParam(params.status) ?? "all";
  const error = firstParam(params.error);
  const message = firstParam(params.message);
  const validStatus =
    requestedStatus === "all" ||
    statuses.some((status) => status === requestedStatus)
      ? requestedStatus
      : "all";
  const [customers, access] = await Promise.all([
    getCustomers(search, validStatus),
    getCustomerAccess(),
  ]);

  return (
    <main className="hrm-page">
      <header className="hrm-header">
        <div>
          <p className="eyebrow">HOPE, Inc.</p>
          <h1>Customers</h1>
          <p className="intro">Manage customer profiles and contact details.</p>
        </div>
        {access.canManageCustomers && (
          <Link className="link-button" href="/customers/new">
            Add customer
          </Link>
        )}
      </header>

      {error && errors[error] && (
        <p className="form-message form-error" role="alert">
          {errors[error]}
        </p>
      )}
      {message === "archived" && (
        <p className="form-message form-notice" role="status">
          Customer archived.
        </p>
      )}
      {requestedStatus !== validStatus && (
        <p className="form-message form-error" role="alert">
          Unknown status filter. Showing all customers.
        </p>
      )}

      <form className="hrm-filters" action="/customers" method="get">
        <label>
          Search customers
          <input
            type="search"
            name="search"
            maxLength={100}
            placeholder="Search by name or email"
            defaultValue={search}
          />
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
              <th scope="col">Customer</th>
              <th scope="col">Phone</th>
              <th scope="col">Address</th>
              <th scope="col">Status</th>
              <th scope="col">
                <span className="visually-hidden">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td data-label="Customer">
                  <Link href={`/customers/${customer.id}`}>{customer.name}</Link>
                  <span className="hrm-description">{customer.email}</span>
                </td>
                <td data-label="Phone">
                  {customer.phone ? (
                    <a href={`tel:${customer.phone}`}>{customer.phone}</a>
                  ) : (
                    "—"
                  )}
                </td>
                <td data-label="Address">{customer.address || "—"}</td>
                <td data-label="Status">
                  <span
                    className={`hrm-status hrm-status-${customer.status}`}
                  >
                    {customer.status}
                  </span>
                </td>
                <td data-label="Actions">
                  <Link href={`/customers/${customer.id}`}>View</Link>
                  {access.canManageCustomers && (
                    <>
                      {" · "}
                      <Link href={`/customers/${customer.id}/edit`}>Edit</Link>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td className="hrm-empty" colSpan={5}>
                  No customers match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
