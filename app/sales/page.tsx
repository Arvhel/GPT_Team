import Link from "next/link";
import { getSalesRecords } from "@/app/actions/sales";
import { getSalesAccess } from "@/utils/supabase/sales-access";
import type { SaleStatus } from "@/utils/supabase/database.types";

type SalesPageProps = {
  searchParams: Promise<{
    search?: string | string[];
    status?: string | string[];
    error?: string | string[];
  }>;
};

const statuses = ["pending", "completed", "cancelled"] as const satisfies readonly SaleStatus[];
const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SalesPage({ searchParams }: SalesPageProps) {
  const params = await searchParams;
  const search = firstParam(params.search)?.trim() ?? "";
  const requestedStatus = firstParam(params.status) ?? "all";
  const error = firstParam(params.error);
  const validStatus =
    requestedStatus === "all" ||
    statuses.some((status) => status === requestedStatus)
      ? requestedStatus
      : "all";
  const [sales, access] = await Promise.all([
    getSalesRecords(search, validStatus),
    getSalesAccess(),
  ]);

  return (
    <main className="hrm-page">
      <header className="hrm-header">
        <div>
          <p className="eyebrow">HOPE, Inc.</p>
          <h1>Sales</h1>
          <p className="intro">Review and manage customer transactions.</p>
        </div>
        {access.canManageSales && (
          <Link className="link-button" href="/sales/new">
            Create sale
          </Link>
        )}
      </header>

      {error === "forbidden" && (
        <p className="form-message form-error" role="alert">
          You don’t have permission to manage sales.
        </p>
      )}
      {error === "not-found" && (
        <p className="form-message form-error" role="alert">
          That sale could not be found.
        </p>
      )}
      {error === "invalid-input" && (
        <p className="form-message form-error" role="alert">
          The sale status or identifier is invalid.
        </p>
      )}
      {requestedStatus !== validStatus && (
        <p className="form-message form-error" role="alert">
          Unknown status filter. Showing all sales.
        </p>
      )}

      <form className="hrm-filters sales-filters" action="/sales" method="get">
        <label>
          Search sales
          <input
            type="search"
            name="search"
            maxLength={100}
            placeholder="Search customer name or email"
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
              <th scope="col">Date</th>
              <th scope="col">Customer</th>
              <th scope="col">Total</th>
              <th scope="col">Status</th>
              <th scope="col">
                <span className="visually-hidden">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id}>
                <td data-label="Date">
                  <time dateTime={sale.created_at}>
                    {new Date(sale.created_at).toLocaleDateString()}
                  </time>
                </td>
                <td data-label="Customer">
                  <Link href={`/sales/${sale.id}`}>{sale.customer.name}</Link>
                  <span className="hrm-description">{sale.customer.email}</span>
                </td>
                <td data-label="Total">{currency.format(sale.total_amount)}</td>
                <td data-label="Status">
                  <span className={`hrm-status sales-status-${sale.status}`}>
                    {sale.status}
                  </span>
                </td>
                <td data-label="Actions">
                  <Link href={`/sales/${sale.id}`}>View details</Link>
                </td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr>
                <td className="hrm-empty" colSpan={5}>
                  No sales match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
