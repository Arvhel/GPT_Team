"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import "./products.css";
import "../dashboard/dashboard-theme.css";

type ProductStatus = "In stock" | "Low stock" | "Draft";
type Product = {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: ProductStatus;
  updated: string;
  color: string;
};
type DisplayState = "ready" | "loading" | "empty" | "error";
type ProductDraft = Omit<Product, "id" | "updated" | "color" | "status">;

const initialProducts: Product[] = [
  { id: 1, name: "Sunday ceramic mug", sku: "HM-0248", category: "Home & living", price: 28, stock: 84, status: "In stock", updated: "Today", color: "clay" },
  { id: 2, name: "Field notes journal", sku: "ST-0103", category: "Stationery", price: 16, stock: 12, status: "Low stock", updated: "Today", color: "sage" },
  { id: 3, name: "Everyday tote", sku: "AC-0312", category: "Accessories", price: 34, stock: 0, status: "Draft", updated: "Yesterday", color: "lilac" },
  { id: 4, name: "Soft morning candle", sku: "HM-0197", category: "Home & living", price: 22, stock: 36, status: "In stock", updated: "Oct 18", color: "butter" },
  { id: 5, name: "Little rituals set", sku: "AC-0281", category: "Accessories", price: 48, stock: 7, status: "Low stock", updated: "Oct 17", color: "blue" },
];

const categories = ["Home & living", "Stationery", "Accessories"];

function Icon({ name }: { name: string }) {
  const paths: Record<string, ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    box: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="m4.5 7.7 7.5 4.2 7.5-4.2M12 12v8.5" /></>,
    people: <><circle cx="9" cy="8" r="3" /><path d="M3.5 20v-1.5a5.5 5.5 0 0 1 11 0V20M16 5.5a3 3 0 0 1 0 5.8M18 14a5 5 0 0 1 2.5 4.5V20" /></>,
    chart: <><path d="M4 20V11M10 20V5M16 20v-7M22 20H2" /><path d="m3 8 6-4 6 6 6-5" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    down: <path d="m7 10 5 5 5-5" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    leaf: <><path d="M20 4C10 4 5 7.5 5 14a6 6 0 0 0 6 6c6.5 0 9-6 9-16Z" /><path d="M4 21c2-5 5-8 11-11" /></>,
    spark: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" /><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" /></>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.6 9a7 7 0 0 1 11.6-2L20 12M4 12l2.8 5a7 7 0 0 0 11.6-2" /></>,
  };

  return (
    <svg aria-hidden="true" className="product-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {paths[name] ?? paths.spark}
    </svg>
  );
}

function HopeMark() {
  return <span className="products-mark" aria-hidden="true"><Icon name="leaf" /></span>;
}

function ProductForm({
  product,
  onClose,
  onSave,
}: {
  product: Product | null;
  onClose: () => void;
  onSave: (draft: ProductDraft) => void;
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSave({
      name: String(data.get("name")).trim(),
      sku: String(data.get("sku")).trim().toUpperCase(),
      category: String(data.get("category")),
      price: Number(data.get("price")),
      stock: Number(data.get("stock")),
    });
  }

  return (
    <div className="products-modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="products-modal" role="dialog" aria-modal="true" aria-labelledby="product-form-title">
        <button className="products-modal-close" type="button" onClick={onClose} aria-label="Close form"><Icon name="close" /></button>
        <span className="products-eyebrow">{product ? "A SMALL UPDATE" : "SOMETHING NEW"}</span>
        <h2 id="product-form-title">{product ? "Edit product" : "Add a product"}</h2>
        <p>Keep the important details together. You can always change them later.</p>
        <form className="product-form" onSubmit={submit}>
          <label>Product name<input name="name" placeholder="e.g. Sunday ceramic mug" defaultValue={product?.name} required maxLength={70} /></label>
          <div className="product-form-row">
            <label>SKU<input name="sku" placeholder="e.g. HM-0248" defaultValue={product?.sku} required maxLength={24} /></label>
            <label>Category<select name="category" defaultValue={product?.category ?? categories[0]}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
          </div>
          <div className="product-form-row">
            <label>Price (USD)<input name="price" type="number" min="0" step="0.01" placeholder="0.00" defaultValue={product?.price} required /></label>
            <label>Units in stock<input name="stock" type="number" min="0" step="1" placeholder="0" defaultValue={product?.stock} required /></label>
          </div>
          <div className="product-form-actions">
            <button type="button" className="products-secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="products-primary-button">{product ? "Save changes" : "Add product"}<Icon name="arrow" /></button>
          </div>
        </form>
      </section>
    </div>
  );
}

function ProductDetails({ product, onClose, onEdit }: { product: Product; onClose: () => void; onEdit: () => void }) {
  return (
    <div className="products-modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="products-modal product-detail-modal" role="dialog" aria-modal="true" aria-labelledby="product-detail-title">
        <button className="products-modal-close" type="button" onClick={onClose} aria-label="Close details"><Icon name="close" /></button>
        <div className={`product-art product-art-${product.color} product-detail-art`}><Icon name="box" /></div>
        <span className="products-eyebrow">{product.category.toUpperCase()} &nbsp;·&nbsp; {product.sku}</span>
        <h2 id="product-detail-title">{product.name}</h2>
        <p>A little snapshot of this product, all in one place.</p>
        <div className="product-detail-grid">
          <span>Price<strong>${product.price.toFixed(2)}</strong></span>
          <span>Available units<strong>{product.stock}</strong></span>
          <span>Status<strong><i className={`status-dot status-${product.status.toLowerCase().replace(" ", "-")}`} />{product.status}</strong></span>
          <span>Last updated<strong>{product.updated}</strong></span>
        </div>
        <button className="products-primary-button product-detail-edit" type="button" onClick={onEdit}>Edit product<Icon name="arrow" /></button>
      </section>
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [status, setStatus] = useState("All status");
  const [displayState, setDisplayState] = useState<DisplayState>("ready");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null | undefined>(undefined);
  const [notice, setNotice] = useState("");

  const visibleProducts = useMemo(() => products.filter((product) => {
    const matchesQuery = `${product.name} ${product.sku}`.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === "All categories" || product.category === category;
    const matchesStatus = status === "All status" || product.status === status;
    return matchesQuery && matchesCategory && matchesStatus;
  }), [products, query, category, status]);

  const activeCount = products.filter((product) => product.status === "In stock").length;
  const lowStockCount = products.filter((product) => product.status === "Low stock").length;
  const inventoryValue = products.reduce((sum, product) => sum + product.price * product.stock, 0);

  function saveProduct(draft: ProductDraft) {
    setProducts((current) => {
      if (editingProduct) {
        return current.map((product) => product.id === editingProduct.id
          ? { ...product, ...draft, status: draft.stock === 0 ? "Draft" : draft.stock < 15 ? "Low stock" : "In stock", updated: "Just now" }
          : product);
      }
      const newProduct: Product = {
        ...draft,
        id: Math.max(0, ...current.map((product) => product.id)) + 1,
        status: draft.stock === 0 ? "Draft" : draft.stock < 15 ? "Low stock" : "In stock",
        updated: "Just now",
        color: ["clay", "sage", "lilac", "butter", "blue"][current.length % 5],
      };
      return [newProduct, ...current];
    });
    setNotice(editingProduct ? "Your product has been updated." : "Your new product is ready.");
    setEditingProduct(undefined);
    window.setTimeout(() => setNotice(""), 3200);
  }

  function refreshProducts() {
    setDisplayState("loading");
    window.setTimeout(() => setDisplayState("ready"), 850);
  }

  function retryProducts() {
    setDisplayState("loading");
    window.setTimeout(() => setDisplayState("ready"), 850);
  }

  const previewStates: { label: string; value: DisplayState }[] = [
    { label: "Normal view", value: "ready" },
    { label: "Loading", value: "loading" },
    { label: "Empty", value: "empty" },
    { label: "Error", value: "error" },
  ];

  return (
    <main className="products-app">
      <aside className="products-sidebar">
        <a className="products-brand" href="/" aria-label="Hope home"><HopeMark /><span>hope<span>, inc.</span></span></a>
        <div className="sidebar-workspace"><span className="workspace-avatar">H</span><span><b>Hope Studio</b><small>Workspace</small></span><Icon name="down" /></div>
        <span className="sidebar-label">YOUR WORKSPACE</span>
        <nav className="products-nav" aria-label="Workspace navigation">
          <a href="/dashboard"><Icon name="grid" />Overview</a>
          <a className="active" href="/products" aria-current="page"><Icon name="box" />Products<span className="nav-count">{products.length}</span></a>
          <a href="/people"><Icon name="people" />People</a>
          <a href="/sales"><Icon name="chart" />Sales</a>
          <a href="/customers"><Icon name="spark" />Customer management</a>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note"><span>✳</span><b>Good work grows here.</b><p>A little more clarity, for the whole team.</p></div>
          <a href="/" className="sidebar-back">← <span>Back to Hope home</span></a>
          <div className="sidebar-profile"><span className="profile-avatar">AM</span><span><b>Alex Morgan</b><small>Workspace owner</small></span><span className="profile-menu">···</span></div>
        </div>
      </aside>

      <section className="products-main">
        <header className="products-topbar">
          <div className="breadcrumb"><span>Workspace</span><i>/</i><b>Products</b></div>
          <div className="topbar-right"><span className="topbar-date">TUESDAY, NOVEMBER 5</span><span className="topbar-avatar">A</span></div>
        </header>

        <div className="products-content">
          <div className="products-heading">
            <div><span className="products-eyebrow">YOUR LITTLE CORNER OF INVENTORY</span><h1>Product studio<span className="heading-period">.</span></h1><p>All the things you make, in one easy rhythm.</p></div>
            <button className="products-primary-button add-product-button" type="button" onClick={() => setEditingProduct(null)}><Icon name="plus" />Add product</button>
          </div>

          <section className="products-overview" aria-label="Product overview">
            <article className="overview-card overview-total"><span>Products in your studio <i>✳</i></span><strong>{products.length.toString().padStart(2, "0")}</strong><small>Across {categories.length} thoughtful categories</small><span className="overview-decoration">01</span></article>
            <article className="overview-card"><span>In stock</span><strong>{activeCount.toString().padStart(2, "0")}</strong><small><i className="overview-dot dot-green" />Ready to find a home</small></article>
            <article className="overview-card"><span>Needs a little love</span><strong>{lowStockCount.toString().padStart(2, "0")}</strong><small><i className="overview-dot dot-amber" />Running low on stock</small></article>
            <article className="overview-card overview-value"><span>Inventory value</span><strong>${inventoryValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}</strong><small>Based on current stock</small><span className="value-spark" aria-hidden="true">⌁</span></article>
          </section>

          <section className="product-list-section" aria-labelledby="product-list-title">
            <div className="list-heading">
              <div><span className="products-eyebrow">A GOOD THING, ONE BY ONE</span><h2 id="product-list-title">Your products <span>{products.length}</span></h2></div>
              <button type="button" className="text-refresh" onClick={refreshProducts} aria-label="Refresh products"><Icon name="refresh" />Refresh</button>
            </div>
            <div className="product-toolbar">
              <label className="product-search"><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a product or SKU" aria-label="Search products" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><Icon name="close" /></button>}</label>
              <div className="toolbar-filters">
                <label className="filter-select"><span className="sr-only">Filter by category</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option>All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select><Icon name="down" /></label>
                <label className="filter-select status-filter"><span className="sr-only">Filter by status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option>All status</option><option>In stock</option><option>Low stock</option><option>Draft</option></select><Icon name="down" /></label>
                <details className="state-preview">
                  <summary>View states <Icon name="down" /></summary>
                  <div className="state-preview-menu">{previewStates.map((item) => <button key={item.value} type="button" onClick={(event) => { setDisplayState(item.value); event.currentTarget.closest("details")?.removeAttribute("open"); }}>{item.label}</button>)}</div>
                </details>
              </div>
            </div>

            <div className="product-table-wrap">
              {displayState === "loading" ? (
                <div className="product-table-loading" role="status" aria-label="Loading products">{Array.from({ length: 4 }, (_, index) => <div className="skeleton-row" key={index}><i /><span /><span /><span /><span /></div>)}</div>
              ) : displayState === "error" ? (
                <div className="product-state-panel product-error-state"><span className="state-illustration state-error">!</span><h3>We lost the thread for a moment.</h3><p>Your products couldn&apos;t be loaded. Let&apos;s give it another try.</p><button className="products-secondary-button" type="button" onClick={retryProducts}><Icon name="refresh" />Try again</button></div>
              ) : displayState === "empty" || visibleProducts.length === 0 ? (
                <div className="product-state-panel"><span className="state-illustration"><Icon name="box" /></span><h3>{displayState === "empty" ? "A little room to grow." : "Nothing found just yet."}</h3><p>{displayState === "empty" ? "Your product shelf is waiting for its first good thing." : "Try another search or loosen up those filters."}</p>{displayState === "empty" ? <button className="products-primary-button" type="button" onClick={() => { setDisplayState("ready"); setEditingProduct(null); }}><Icon name="plus" />Add your first product</button> : <button className="products-secondary-button" type="button" onClick={() => { setQuery(""); setCategory("All categories"); setStatus("All status"); }}>Clear filters</button>}</div>
              ) : (
                <table className="product-table">
                  <thead><tr><th scope="col">PRODUCT</th><th scope="col">CATEGORY</th><th scope="col">PRICE</th><th scope="col">IN STOCK</th><th scope="col">STATUS</th><th scope="col">UPDATED</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                  <tbody>{visibleProducts.map((product) => (
                    <tr key={product.id}>
                      <td><button className="product-name-button" type="button" onClick={() => setSelectedProduct(product)}><span className={`product-art product-art-${product.color}`}><Icon name="box" /></span><span className="product-name-copy"><b>{product.name}</b><small>{product.sku}</small></span></button></td>
                      <td><span className="category-name">{product.category}</span></td>
                      <td className="product-price">${product.price.toFixed(2)}</td>
                      <td><span className="stock-value">{product.stock}<span className="stock-unit"> units</span></span><span className="stock-track"><i style={{ width: `${Math.min(product.stock, 100)}%` }} /></span></td>
                      <td><span className={`product-status status-${product.status.toLowerCase().replace(" ", "-")}`}><i />{product.status}</span></td>
                      <td className="updated-cell">{product.updated}</td>
                      <td><button className="row-action" type="button" onClick={() => setEditingProduct(product)} aria-label={`Edit ${product.name}`}>···</button></td>
                    </tr>
                  ))}</tbody>
                </table>
              )}
            </div>
            {displayState === "ready" && visibleProducts.length > 0 && <div className="table-foot"><span>Showing <b>{visibleProducts.length}</b> of <b>{products.length}</b> products</span><span>Looking good so far <i>✳</i></span></div>}
          </section>
          <footer className="products-footer"><span>HOPE, INC. &nbsp;·&nbsp; MADE FOR THE WAY TEAMS REALLY WORK</span><a href="/">A little more in sync <Icon name="leaf" /></a></footer>
        </div>
      </section>

      {notice && <div className="product-toast" role="status"><span>✓</span>{notice}</div>}
      {editingProduct !== undefined && <ProductForm product={editingProduct} onClose={() => setEditingProduct(undefined)} onSave={saveProduct} />}
      {selectedProduct && <ProductDetails product={products.find((item) => item.id === selectedProduct.id) ?? selectedProduct} onClose={() => setSelectedProduct(null)} onEdit={() => { setEditingProduct(selectedProduct); setSelectedProduct(null); }} />}
    </main>
  );
}
