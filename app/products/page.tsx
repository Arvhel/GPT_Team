import { getProductAccess } from "@/utils/supabase/product-access";
import { getProducts, saveProduct } from "@/app/actions/products";
import type { ProductStatus } from "@/utils/supabase/database.types";

type ProductsPageProps = {
  searchParams: Promise<{
    message?: string | string[];
    error?: string | string[];
  }>;
};

const productStatuses = [
  "active",
  "draft",
  "out_of_stock",
  "archived",
] as const satisfies readonly ProductStatus[];

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function ProductFields({
  product,
  categories,
}: {
  product?: Awaited<ReturnType<typeof getProducts>>["products"][number];
  categories: Awaited<ReturnType<typeof getProducts>>["categories"];
}) {
  return (
    <>
      {product && <input type="hidden" name="id" value={product.id} />}
      <label>
        Product name
        <input
          name="name"
          defaultValue={product?.name}
          maxLength={200}
          required
        />
      </label>
      <label>
        SKU
        <input
          name="sku"
          defaultValue={product?.sku}
          maxLength={64}
          required
        />
      </label>
      <label>
        Category
        <select name="category_id" defaultValue={product?.category_id ?? ""}>
          <option value="">Uncategorized</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Unit price (USD)
        <input
          name="unit_price"
          type="number"
          min="0"
          max="9999999999.99"
          step="0.01"
          defaultValue={product?.unit_price ?? "0.00"}
          required
        />
      </label>
      <label>
        Stock quantity
        <input
          name="stock_quantity"
          type="number"
          min="0"
          max="2147483647"
          step="1"
          defaultValue={product?.stock_quantity ?? 0}
          required
        />
      </label>
      <label>
        Status
        <select name="status" defaultValue={product?.status ?? "active"}>
          {productStatuses.map((status) => (
            <option key={status} value={status}>
              {status.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </label>
      <label className="product-form-description">
        Description
        <textarea
          name="description"
          maxLength={2000}
          rows={3}
          defaultValue={product?.description ?? ""}
        />
      </label>
      <div className="hrm-actions product-form-actions">
        <button type="submit">{product ? "Save product" : "Add product"}</button>
      </div>
    </>
  );
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const [params, access] = await Promise.all([
    searchParams,
    getProductAccess(),
  ]);
  const message = firstParam(params.message);
  const error = firstParam(params.error);

  if (!access.canManageProducts) {
    return (
      <main className="hrm-page">
        <p className="eyebrow">Product management</p>
        <h1>Products</h1>
        <p className="form-message form-error" role="alert">
          You don’t have permission to manage products. Contact an administrator
          if you need access.
        </p>
      </main>
    );
  }

  const { products, categories } = await getProducts();

  return (
    <main className="hrm-page product-management">
      <header className="hrm-header">
        <div>
          <p className="eyebrow">HOPE, Inc.</p>
          <h1>Products</h1>
          <p className="intro">
            Manage the catalog and inventory used by Sales.
          </p>
        </div>
      </header>

      {message === "saved" && (
        <p className="form-message form-notice" role="status">
          Product saved. Sales options now reflect the current catalog and stock.
        </p>
      )}
      {error === "forbidden" && (
        <p className="form-message form-error" role="alert">
          You don’t have permission to manage products.
        </p>
      )}
      {error === "invalid-input" && (
        <p className="form-message form-error" role="alert">
          Check the product name, SKU, price, stock, and status, then try again.
        </p>
      )}
      {error === "sku-exists" && (
        <p className="form-message form-error" role="alert">
          That SKU is already in use. Choose a unique SKU.
        </p>
      )}
      {error === "save-failed" && (
        <p className="form-message form-error" role="alert">
          The product could not be saved. Please try again.
        </p>
      )}
      {error === "not-found" && (
        <p className="form-message form-error" role="alert">
          This product could not be found. Refresh the catalog and try again.
        </p>
      )}

      <details className="product-create-panel">
        <summary>Add a product</summary>
        <form action={saveProduct} className="hrm-form product-form-grid">
          <ProductFields categories={categories} />
        </form>
      </details>

      <div className="hrm-table-wrap">
        <table className="hrm-table">
          <thead>
            <tr>
              <th scope="col">Product / SKU</th>
              <th scope="col">Category</th>
              <th scope="col">Unit price</th>
              <th scope="col">Stock</th>
              <th scope="col">Status</th>
              <th scope="col">Edit</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td data-label="Product / SKU">
                  <strong>{product.name}</strong>
                  <span className="hrm-description">{product.sku}</span>
                </td>
                <td data-label="Category">{product.category_name ?? "—"}</td>
                <td data-label="Unit price">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(product.unit_price)}
                </td>
                <td data-label="Stock">{product.stock_quantity}</td>
                <td data-label="Status">
                  <span className="hrm-status">{product.status.replaceAll("_", " ")}</span>
                </td>
                <td data-label="Edit">
                  <details className="product-edit-panel">
                    <summary>Edit</summary>
                    <form action={saveProduct} className="hrm-form product-form-grid">
                      <ProductFields
                        categories={categories}
                        product={product}
                      />
                    </form>
                  </details>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td className="hrm-empty" colSpan={6}>
                  No products are in the catalog yet. Add a product to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
