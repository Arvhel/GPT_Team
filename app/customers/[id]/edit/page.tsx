import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCustomerById,
  updateCustomer,
} from "@/app/actions/customers";
import { requireCustomerManager } from "@/utils/supabase/customer-access";
import type { CustomerStatus } from "@/utils/supabase/database.types";

type EditCustomerPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string | string[] }>;
};

const statuses = ["active", "archived"] as const satisfies readonly CustomerStatus[];

export default async function EditCustomerPage({
  params,
  searchParams,
}: EditCustomerPageProps) {
  await requireCustomerManager();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const customer = await getCustomerById(id);

  if (!customer) {
    notFound();
  }

  return (
    <main className="hrm-page">
      <Link
        className="hrm-back-link back-link"
        href={`/customers/${customer.id}`}
      >
        ← Customer profile
      </Link>
      <p className="eyebrow">Customer directory</p>
      <h1>Edit customer</h1>
      <p className="intro">Update {customer.name}’s profile and contact details.</p>
      {error === "invalid-input" && (
        <p className="form-message form-error" role="alert">
          Enter a name and valid email address. Check the optional contact
          fields and try again.
        </p>
      )}
      <form
        className="hrm-form"
        action={updateCustomer.bind(null, customer.id)}
      >
        <div className="hrm-form-grid">
          <label>
            Name
            <input
              name="name"
              required
              maxLength={200}
              autoComplete="name"
              defaultValue={customer.name}
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
              defaultValue={customer.email}
            />
          </label>
          <label>
            Phone <span className="hrm-hint">(optional)</span>
            <input
              name="phone"
              type="tel"
              maxLength={30}
              autoComplete="tel"
              defaultValue={customer.phone ?? ""}
            />
          </label>
          <label>
            Address <span className="hrm-hint">(optional)</span>
            <textarea
              name="address"
              rows={3}
              maxLength={1000}
              autoComplete="street-address"
              defaultValue={customer.address ?? ""}
            />
          </label>
          <label>
            Status
            <select name="status" defaultValue={customer.status}>
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
            href={`/customers/${customer.id}`}
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}
