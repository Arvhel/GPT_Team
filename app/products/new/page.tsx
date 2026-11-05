import Link from "next/link";
import { createProduct } from "@/app/actions/products";
import { requireProductManager } from "@/utils/supabase/product-access";

type NewProductPageProps = {
  searchParams: Promise<{ error?: string | string[] }>;
};

export default async function NewProductPage({
  searchParams,
}: NewProductPageProps) {
  await requireProductManager();
  const params = await searchParams;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  return (
    <main className="products-page">
      <p className="eyebrow">Product catalog</p>
      <h1>Add a product</h1>
      <p className="intro">Enter the product details and starting stock.</p>
      {error === "invalid-input" && (
        <p className="form-message form-error" role="alert">
          Check the required fields, price, and stock quantity.
        </p>
      )}
      {error === "sku-exists" && (
        <p className="form-message form-error" role="alert">
          A product with that SKU already exists.
        </p>
      )}
      <form className="product-form" action={createProduct}>
        <label>
          Product name
          <input name="name" required maxLength={200} />
        </label>
        <label>
          SKU
          <input name="sku" required maxLength={100} />
        </label>
        <label>
          Description
          <textarea name="description" rows={4} maxLength={5000} />
        </label>
        <div className="product-form-grid">
          <label>
            Price
            <input
              name="unit_price"
              type="number"
              min="0"
              step="0.01"
              required
            />
          </label>
          <label>
            Cost price <span className="field-hint">(optional)</span>
            <input name="cost_price" type="number" min="0" step="0.01" />
          </label>
          <label>
            Stock quantity
            <input
              name="stock_quantity"
              type="number"
              min="0"
              step="1"
              defaultValue={0}
              required
            />
          </label>
          <label>
            Status
            <select name="status" defaultValue="active">
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
          </label>
        </div>
        <div className="product-form-actions">
          <button type="submit">Create product</button>
          <Link className="link-button secondary-button" href="/products">
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}
