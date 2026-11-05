import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById, updateProduct } from "@/app/actions/products";
import { requireProductManager } from "@/utils/supabase/product-access";
import type { ProductStatus } from "@/utils/supabase/database.types";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string | string[] }>;
};

const statuses: ProductStatus[] = [
  "draft",
  "active",
  "out_of_stock",
  "archived",
];

export default async function EditProductPage({
  params,
  searchParams,
}: EditProductPageProps) {
  await requireProductManager();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <main className="products-page">
      <p className="eyebrow">Product catalog</p>
      <h1>Edit product</h1>
      <p className="intro">Update {product.name} and its inventory.</p>
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
      <form
        className="product-form"
        action={updateProduct.bind(null, product.id)}
      >
        <label>
          Product name
          <input
            name="name"
            required
            maxLength={200}
            defaultValue={product.name}
          />
        </label>
        <label>
          SKU
          <input
            name="sku"
            required
            maxLength={100}
            defaultValue={product.sku}
          />
        </label>
        <label>
          Description
          <textarea
            name="description"
            rows={4}
            maxLength={5000}
            defaultValue={product.description ?? ""}
          />
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
              defaultValue={product.unit_price}
            />
          </label>
          <label>
            Cost price <span className="field-hint">(optional)</span>
            <input
              name="cost_price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={product.cost_price ?? ""}
            />
          </label>
          <label>
            Stock quantity
            <input
              name="stock_quantity"
              type="number"
              min="0"
              step="1"
              required
              defaultValue={product.stock_quantity}
            />
          </label>
          <label>
            Status
            <select name="status" defaultValue={product.status}>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="product-form-actions">
          <button type="submit">Save changes</button>
          <Link
            className="link-button secondary-button"
            href={`/products/${product.id}`}
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}
