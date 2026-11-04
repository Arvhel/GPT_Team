import Link from "next/link";
import { getProducts } from "@/app/actions/products";
import { getProductAccess } from "@/utils/supabase/product-access";
import type { ProductStatus } from "@/utils/supabase/database.types";

type ProductsPageProps = {
  searchParams: Promise<{
    search?: string | string[];
    status?: string | string[];
    error?: string | string[];
    message?: string | string[];
  }>;
};

const statuses: ProductStatus[] = [
  "draft",
  "active",
  "archived",
  "out_of_stock",
];

const errors: Record<string, string> = {
  forbidden: "You don't have permission to manage products.",
  "not-found": "That product could not be found.",
};

const notices: Record<string, string> = {
  archived: "Product archived.",
};

function formatStatus(status: ProductStatus) {
  return status.replaceAll("_", " ");
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const searchValue = Array.isArray(params.search)
    ? params.search[0]
    : params.search;
  const requestedStatus = Array.isArray(params.status)
    ? params.status[0] ?? "all"
    : params.status ?? "all";
  const error = Array.isArray(params.error) ? params.error[0] : params.error;
  const message = Array.isArray(params.message)
    ? params.message[0]
    : params.message;
  const search = searchValue?.trim() ?? "";
  const validStatus =
    requestedStatus === "all" ||
    statuses.includes(requestedStatus as ProductStatus)
      ? requestedStatus
      : "all";
  const [products, access] = await Promise.all([
    getProducts(search, validStatus),
    getProductAccess(),
  ]);

  return (
    <main className="products-page">
      <header className="products-header">
        <div>
          <p className="eyebrow">HOPE, Inc.</p>
          <h1>Products</h1>
          <p className="intro">Keep your catalog and inventory up to date.</p>
        </div>
        {access.canManageProducts && (
          <Link className="link-button" href="/products/new">
            Add product
          </Link>
        )}
      </header>

      {error && errors[error] && (
        <p className="form-message form-error" role="alert">
          {errors[error]}
        </p>
      )}
      {message && notices[message] && (
        <p className="form-message form-notice" role="status">
          {notices[message]}
        </p>
      )}
      {requestedStatus !== validStatus && (
        <p className="form-message form-error" role="alert">
          Unknown status filter. Showing all products.
        </p>
      )}

      <form className="product-filters" action="/products" method="get">
        <label>
          Search products
          <input
            type="search"
            name="search"
            maxLength={100}
            placeholder="Search by name"
            defaultValue={search}
          />
        </label>
        <label>
          Status
          <select name="status" defaultValue={validStatus}>
            <option value="all">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Apply filters</button>
      </form>

      <div className="product-table-wrap">
        <table className="product-table">
          <thead>
            <tr>
              <th scope="col">Product</th>
              <th scope="col">SKU</th>
              <th scope="col">Price</th>
              <th scope="col">Stock</th>
              <th scope="col">Status</th>
              <th scope="col">
                <span className="visually-hidden">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td data-label="Product">
                  <Link href={`/products/${product.id}`}>{product.name}</Link>
                  {product.description && (
                    <span className="product-description">
                      {product.description}
                    </span>
                  )}
                </td>
                <td data-label="SKU">{product.sku}</td>
                <td data-label="Price">${product.unit_price.toFixed(2)}</td>
                <td data-label="Stock">{product.stock_quantity}</td>
                <td data-label="Status">
                  <span className={`product-status status-${product.status}`}>
                    {formatStatus(product.status)}
                  </span>
                </td>
                <td data-label="Actions">
                  <Link href={`/products/${product.id}`}>View</Link>
                  {access.canManageProducts && (
                    <>
                      {" · "}
                      <Link href={`/products/${product.id}/edit`}>Edit</Link>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td className="empty-products" colSpan={6}>
                  No products match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
