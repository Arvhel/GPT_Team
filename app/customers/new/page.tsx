import Link from "next/link";
import { createCustomer } from "@/app/actions/customers";
import { requireCustomerManager } from "@/utils/supabase/customer-access";

type NewCustomerPageProps = {
  searchParams: Promise<{ error?: string | string[] }>;
};

export default async function NewCustomerPage({
  searchParams,
}: NewCustomerPageProps) {
  await requireCustomerManager();
  const params = await searchParams;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  return (
    <main className="hrm-page">
      <Link className="hrm-back-link back-link" href="/customers">
        ← All customers
      </Link>
      <p className="eyebrow">Customer directory</p>
      <h1>Add a customer</h1>
      <p className="intro">Enter the customer’s profile and contact details.</p>
      {error === "invalid-input" && (
        <p className="form-message form-error" role="alert">
          Enter a name and valid email address. Check the optional contact
          fields and try again.
        </p>
      )}
      <form className="hrm-form" action={createCustomer}>
        <div className="hrm-form-grid">
          <label>
            Name
            <input
              name="name"
              required
              maxLength={200}
              autoComplete="name"
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
            />
          </label>
          <label>
            Phone <span className="hrm-hint">(optional)</span>
            <input
              name="phone"
              type="tel"
              maxLength={30}
              autoComplete="tel"
            />
          </label>
          <label>
            Address <span className="hrm-hint">(optional)</span>
            <textarea name="address" rows={3} maxLength={1000} autoComplete="street-address" />
          </label>
        </div>
        <div className="hrm-actions">
          <button type="submit">Create customer</button>
          <Link className="link-button secondary-button" href="/customers">
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}
