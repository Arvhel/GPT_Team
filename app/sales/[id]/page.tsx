import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getSaleDetails,
  updateSaleStatus,
} from "@/app/actions/sales";
import { getSalesAccess } from "@/utils/supabase/sales-access";
import type { SaleStatus } from "@/utils/supabase/database.types";

type SaleDetailsPageProps = {
  params: Promise<{ id: string }>;
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export default async function SaleDetailsPage({
  params,
}: SaleDetailsPageProps) {
  const { id } = await params;
  const [sale, access] = await Promise.all([
    getSaleDetails(id),
    getSalesAccess(),
  ]);

  if (!sale) {
    notFound();
  }

  const statusActions: Partial<
    Record<SaleStatus, Array<{ status: SaleStatus; label: string }>>
  > = {
    pending: [
      { status: "completed", label: "Mark completed" },
      { status: "cancelled", label: "Cancel sale" },
    ],
  };
  const availableStatusActions = statusActions[sale.status] ?? [];

  return (
    <main className="hrm-page">
      <Link className="hrm-back-link back-link" href="/sales">
        ← All sales
      </Link>
      <header className="hrm-header">
        <div>
          <p className="eyebrow">Sales transaction</p>
          <h1>Sale details</h1>
          <p className="intro">
            Created {formatDate(sale.created_at)}
          </p>
        </div>
        <span className={`hrm-status sales-status-${sale.status}`}>
          {sale.status}
        </span>
      </header>

      <section aria-labelledby="sale-customer-heading">
        <h2 id="sale-customer-heading">Customer</h2>
        <dl className="hrm-details sale-customer-details">
          <div>
            <dt>Name</dt>
            <dd>{sale.customer.name}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>
              <a href={`mailto:${sale.customer.email}`}>
                {sale.customer.email}
              </a>
            </dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>
              {sale.customer.phone ? (
                <a href={`tel:${sale.customer.phone}`}>
                  {sale.customer.phone}
                </a>
              ) : (
                "Not provided"
              )}
            </dd>
          </div>
          <div>
            <dt>Address</dt>
            <dd>{sale.customer.address || "Not provided"}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="sale-items-heading">
        <h2 id="sale-items-heading">Line items</h2>
        <div className="hrm-table-wrap">
          <table className="hrm-table">
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">SKU</th>
                <th scope="col">Unit price</th>
                <th scope="col">Quantity</th>
                <th scope="col">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item) => (
                <tr key={item.id}>
                  <td data-label="Product">{item.product.name}</td>
                  <td data-label="SKU">{item.product.sku}</td>
                  <td data-label="Unit price">
                    {currency.format(item.unit_price)}
                  </td>
                  <td data-label="Quantity">{item.quantity}</td>
                  <td data-label="Subtotal">
                    {currency.format(item.subtotal)}
                  </td>
                </tr>
              ))}
              {sale.items.length === 0 && (
                <tr>
                  <td className="hrm-empty" colSpan={5}>
                    This sale has no line items.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="sales-total">
          <span>Order total</span>
          <strong>{currency.format(sale.total_amount)}</strong>
        </div>
      </section>

      <dl className="sale-history">
        <div>
          <dt>Created</dt>
          <dd>
            <time dateTime={sale.created_at}>{formatDate(sale.created_at)}</time>
          </dd>
        </div>
        <div>
          <dt>Last updated</dt>
          <dd>
            <time dateTime={sale.updated_at}>{formatDate(sale.updated_at)}</time>
          </dd>
        </div>
      </dl>

      {access.canManageSales && availableStatusActions.length > 0 && (
        <div className="hrm-actions">
          {availableStatusActions.map(({ status, label }) => (
            <form
              key={status}
              action={updateSaleStatus.bind(null, sale.id, status)}
            >
              <button
                className={
                  status === "cancelled" ? "hrm-danger-button" : undefined
                }
                type="submit"
              >
                {label}
              </button>
            </form>
          ))}
        </div>
      )}
    </main>
  );
}
