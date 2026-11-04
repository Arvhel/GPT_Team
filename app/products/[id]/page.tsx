import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteOrArchiveProduct, getProductById } from "@/app/actions/products";
import { getProductAccess } from "@/utils/supabase/product-access";
import type { ProductStatus } from "@/utils/supabase/database.types";

type ProductDetailsPageProps = {
  params: Promise<{ id: string }>;
};

function formatStatus(status: ProductStatus) {
  return status.replaceAll("_", " ");
}

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const { id } = await params;
  const [product, access] = await Promise.all([
    getProductById(id),
    getProductAccess(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <main className="products-page">
      <Link className="back-link" href="/products">
        ← All products
      </Link>
      <header className="products-header product-details-header">
        <div>
          <p className="eyebrow">{product.sku}</p>
          <h1>{product.name}</h1>
          <p className="intro">{product.description || "No description provided."}</p>
        </div>
        <span className={`product-status status-${product.status}`}>
          {formatStatus(product.status)}
        </span>
      </header>

      <dl className="product-details">
        <div>
          <dt>Price</dt>
          <dd>${product.unit_price.toFixed(2)}</dd>
        </div>
        <div>
          <dt>Cost price</dt>
          <dd>
            {product.cost_price === null
              ? "Not set"
              : `$${product.cost_price.toFixed(2)}`}
          </dd>
        </div>
        <div>
          <dt>Stock</dt>
          <dd>{product.stock_quantity}</dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>
            <time dateTime={product.created_at}>
              {new Date(product.created_at).toLocaleDateString()}
            </time>
          </dd>
        </div>
      </dl>

      {access.canManageProducts && (
        <div className="product-form-actions">
          <Link
            className="link-button"
            href={`/products/${product.id}/edit`}
          >
            Edit product
          </Link>
          {product.status !== "archived" && (
            <form action={deleteOrArchiveProduct.bind(null, product.id)}>
              <button className="danger-button" type="submit">
                Archive product
              </button>
            </form>
          )}
        </div>
      )}
    </main>
  );
}
