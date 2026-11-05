import Link from "next/link";
import { notFound } from "next/navigation";
import {
  archiveCustomer,
  getCustomerById,
} from "@/app/actions/customers";
import { getCustomerAccess } from "@/utils/supabase/customer-access";

type CustomerDetailsPageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export default async function CustomerDetailsPage({
  params,
}: CustomerDetailsPageProps) {
  const { id } = await params;
  const [customer, access] = await Promise.all([
    getCustomerById(id),
    getCustomerAccess(),
  ]);

  if (!customer) {
    notFound();
  }

  return (
    <main className="hrm-page">
      <Link className="hrm-back-link back-link" href="/customers">
        ← All customers
      </Link>
      <header className="hrm-header">
        <div>
          <p className="eyebrow">Customer profile</p>
          <h1>{customer.name}</h1>
          <p className="intro">{customer.email}</p>
        </div>
        <span className={`hrm-status hrm-status-${customer.status}`}>
          {customer.status}
        </span>
      </header>

      <dl className="hrm-details">
        <div>
          <dt>Email</dt>
          <dd>
            <a href={`mailto:${customer.email}`}>{customer.email}</a>
          </dd>
        </div>
        <div>
          <dt>Phone</dt>
          <dd>
            {customer.phone ? (
              <a href={`tel:${customer.phone}`}>{customer.phone}</a>
            ) : (
              "Not provided"
            )}
          </dd>
        </div>
        <div>
          <dt>Address</dt>
          <dd>{customer.address || "Not provided"}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{customer.status}</dd>
        </div>
      </dl>

      <section aria-labelledby="customer-history-heading">
        <h2 id="customer-history-heading">Profile history</h2>
        <ol className="customer-history">
          <li>
            <strong>Customer profile created</strong>
            <time dateTime={customer.created_at}>
              {formatDate(customer.created_at)}
            </time>
          </li>
          {customer.updated_at !== customer.created_at && (
            <li>
              <strong>Profile last updated</strong>
              <time dateTime={customer.updated_at}>
                {formatDate(customer.updated_at)}
              </time>
            </li>
          )}
        </ol>
      </section>

      {access.canManageCustomers && (
        <div className="hrm-actions">
          <Link
            className="link-button"
            href={`/customers/${customer.id}/edit`}
          >
            Edit customer
          </Link>
          {customer.status !== "archived" && (
            <form action={archiveCustomer.bind(null, customer.id)}>
              <button className="hrm-danger-button" type="submit">
                Archive customer
              </button>
            </form>
          )}
        </div>
      )}
    </main>
  );
}
