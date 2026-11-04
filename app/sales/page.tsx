"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import "./sales.css";

type SaleStatus = "Paid" | "Pending" | "Cancelled";

type Sale = {
  id: string;
  customer: string;
  product: string;
  date: string;
  quantity: number;
  total: number;
  status: SaleStatus;
  payment: string;
  note: string;
};

type SaleDraft = Omit<Sale, "id" | "total"> & { unitPrice: number };

const products = [
  { name: "Sunday ceramic mug", price: 28 },
  { name: "Field notes journal", price: 16 },
  { name: "Everyday tote", price: 34 },
  { name: "Soft morning candle", price: 22 },
  { name: "Little rituals set", price: 48 },
];

const customers = [
  "Olivia Bennett — Northstar Studio",
  "Marcus Chen — Fieldwork Goods",
  "Amara Okafor — Kindred Collective",
  "Leo Martinez — Juniper House",
  "Priya Shah — Soft Current",
  "Elliot James — Daybreak Cafe",
];

const initialSales: Sale[] = [
  { id: "HO-2048", customer: customers[0], product: products[0].name, date: "Nov 05, 2026", quantity: 12, total: 336, status: "Paid", payment: "Card", note: "Repeat order for the Northstar studio shop." },
  { id: "HO-2047", customer: customers[2], product: products[4].name, date: "Nov 04, 2026", quantity: 8, total: 384, status: "Pending", payment: "Invoice", note: "Invoice sent; follow up next week." },
  { id: "HO-2046", customer: customers[1], product: products[1].name, date: "Nov 03, 2026", quantity: 20, total: 320, status: "Paid", payment: "Bank transfer", note: "Bulk order for the Fieldwork team." },
  { id: "HO-2045", customer: customers[4], product: products[2].name, date: "Nov 02, 2026", quantity: 5, total: 170, status: "Cancelled", payment: "—", note: "Customer postponed the order." },
  { id: "HO-2044", customer: customers[5], product: products[3].name, date: "Nov 01, 2026", quantity: 15, total: 330, status: "Paid", payment: "Card", note: "Seasonal candle restock." },
];

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
    receipt: <><path d="M5 3h14v18l-3-2-4 2-4-2-3 2V3Z" /><path d="M8 8h8M8 12h8M8 16h4" /></>,
    trend: <><path d="m3 17 6-6 4 4 8-9" /><path d="M15 6h6v6" /></>,
  };

  return <svg aria-hidden="true" className="sales-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name] ?? paths.chart}</svg>;
}

function TransactionForm({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (draft: SaleDraft) => void;
}) {
  const [selectedProduct, setSelectedProduct] = useState(products[0].name);
  const [quantity, setQuantity] = useState("1");
  const product = products.find((item) => item.name === selectedProduct) ?? products[0];
  const total = product.price * Math.max(0, Number(quantity) || 0);
  const now = new Date();
  const localToday = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onSave({
      customer: String(formData.get("customer")),
      product: selectedProduct,
      date: new Date(`${String(formData.get("date"))}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      quantity: Number(quantity),
      unitPrice: product.price,
      status: String(formData.get("status")) as SaleStatus,
      payment: String(formData.get("payment")),
      note: String(formData.get("note")).trim(),
    });
  }

  return (
    <div className="sales-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="sales-modal" role="dialog" aria-modal="true" aria-labelledby="sale-form-title">
        <button className="sales-modal-close" type="button" onClick={onClose} aria-label="Close form"><Icon name="close" /></button>
        <span className="sales-eyebrow">A GOOD CONVERSATION, MADE OFFICIAL</span>
        <h2 id="sale-form-title">Record a sale</h2>
        <p>Bring the order, customer, and next step together.</p>
        <form className="sales-form" onSubmit={submit}>
          <label>Customer<select name="customer" defaultValue={customers[0]}>{customers.map((customer) => <option key={customer}>{customer}</option>)}</select></label>
          <label>Product<select value={selectedProduct} onChange={(event) => setSelectedProduct(event.target.value)}>{products.map((item) => <option key={item.name} value={item.name}>{item.name} · ${item.price.toFixed(2)}</option>)}</select></label>
          <div className="sales-form-row">
            <label>Quantity<input name="quantity" type="number" min="1" max="9999" value={quantity} onChange={(event) => setQuantity(event.target.value)} required /></label>
            <label>Unit price<input aria-label="Unit price" value={`$${product.price.toFixed(2)}`} readOnly /></label>
          </div>
          <div className="sales-form-row">
            <label>Sale date<input name="date" type="date" defaultValue={localToday} required /></label>
            <label>Status<select name="status" defaultValue="Pending"><option>Pending</option><option>Paid</option><option>Cancelled</option></select></label>
          </div>
          <label>Payment method<select name="payment" defaultValue="Card"><option>Card</option><option>Bank transfer</option><option>Invoice</option><option>Cash</option><option>—</option></select></label>
          <label>Transaction note<textarea name="note" rows={3} maxLength={300} placeholder="Add a helpful detail for the team." /></label>
          <div className="sales-form-total"><span>Order total</span><strong>${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></div>
          <div className="sales-form-actions"><button type="button" className="sales-secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="sales-primary-button">Save transaction<Icon name="arrow" /></button></div>
        </form>
      </section>
    </div>
  );
}

function TransactionDetails({ sale, onClose }: { sale: Sale; onClose: () => void }) {
  return (
    <div className="sales-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="sales-modal sales-details-modal" role="dialog" aria-modal="true" aria-labelledby="sale-detail-title">
        <button className="sales-modal-close" type="button" onClick={onClose} aria-label="Close details"><Icon name="close" /></button>
        <span className="sales-eyebrow">TRANSACTION {sale.id}</span>
        <h2 id="sale-detail-title">{sale.customer.split(" — ")[0]}</h2>
        <p>{sale.customer.split(" — ")[1]}</p>
        <div className="sales-detail-total"><span>ORDER TOTAL</span><strong>${sale.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></div>
        <div className="sales-detail-grid">
          <span>Product<strong>{sale.product}</strong></span>
          <span>Quantity<strong>{sale.quantity} units</strong></span>
          <span>Date<strong>{sale.date}</strong></span>
          <span>Payment<strong>{sale.payment}</strong></span>
          <span>Status<strong><StatusBadge status={sale.status} /></strong></span>
        </div>
        <div className="sales-detail-note"><span>TEAM NOTE</span><p>{sale.note || "No notes added to this transaction."}</p></div>
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: SaleStatus }) {
  return <span className={`sales-status status-${status.toLowerCase()}`}><i />{status}</span>;
}

export default function SalesPage() {
  const [sales, setSales] = useState(initialSales);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [showForm, setShowForm] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [notice, setNotice] = useState("");

  const visibleSales = useMemo(() => sales.filter((sale) => {
    const matchesQuery = `${sale.id} ${sale.customer} ${sale.product}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === "All statuses" || sale.status === statusFilter;
    return matchesQuery && matchesStatus;
  }), [sales, query, statusFilter]);

  const paidTotal = sales.filter((sale) => sale.status === "Paid").reduce((sum, sale) => sum + sale.total, 0);
  const pendingTotal = sales.filter((sale) => sale.status === "Pending").reduce((sum, sale) => sum + sale.total, 0);
  const paidCount = sales.filter((sale) => sale.status === "Paid").length;

  function saveSale(draft: SaleDraft) {
    const nextNumber = Math.max(2043, ...sales.map((sale) => Number(sale.id.replace("HO-", "")))) + 1;
    const newSale: Sale = { ...draft, id: `HO-${nextNumber}`, total: draft.unitPrice * draft.quantity };
    setSales((current) => [newSale, ...current]);
    setShowForm(false);
    setNotice(`${newSale.id} was added to your sales records.`);
    window.setTimeout(() => setNotice(""), 3200);
  }

  return (
    <main className="sales-app">
      <aside className="sales-sidebar">
        <a className="sales-brand" href="/" aria-label="Hope home"><span className="sales-mark"><Icon name="trend" /></span><span>hope<span>, inc.</span></span></a>
        <div className="sales-workspace"><span className="sales-workspace-avatar">H</span><span><b>Hope Studio</b><small>Workspace</small></span><Icon name="down" /></div>
        <span className="sales-sidebar-label">YOUR WORKSPACE</span>
        <nav className="sales-nav" aria-label="Workspace navigation">
          <a href="/dashboard"><Icon name="grid" />Overview</a>
          <a href="/products"><Icon name="box" />Products</a>
          <a href="/people"><Icon name="people" />People</a>
          <a className="active" href="/sales" aria-current="page"><Icon name="chart" />Sales</a>
          <a className="sales-nav-child" href="/customers"><Icon name="receipt" />Customer management</a>
        </nav>
        <div className="sales-sidebar-bottom">
          <div className="sales-side-note"><span>↗</span><b>Good conversations add up.</b><p>Keep every order and follow-up moving forward.</p></div>
          <a href="/" className="sales-home-link">← <span>Back to Hope home</span></a>
          <div className="sales-sidebar-profile"><span className="sales-profile-avatar">AM</span><span><b>Alex Morgan</b><small>Workspace owner</small></span><span className="sales-profile-dots">···</span></div>
        </div>
      </aside>

      <section className="sales-main">
        <header className="sales-topbar">
          <div className="sales-breadcrumb"><span>Workspace</span><i>/</i><b>Sales management</b></div>
          <div className="sales-topbar-right"><span>KEEPING GOOD WORK MOVING</span><span className="sales-topbar-avatar">A</span></div>
        </header>
        <div className="sales-content">
          <div className="sales-heading">
            <div><span className="sales-eyebrow">A CLEARER VIEW OF WHAT'S MOVING</span><h1>Sales management<span>.</span></h1><p>Track every order, spot the next opportunity, and keep the follow-through simple.</p></div>
            <button className="sales-primary-button add-sale-button" type="button" onClick={() => setShowForm(true)}><Icon name="plus" />Record a sale</button>
          </div>

          {notice && <p className="sales-notice" role="status">{notice}</p>}

          <section className="sales-overview" aria-label="Sales overview">
            <article className="sales-stat-card sales-stat-highlight"><span>COLLECTED SALES <i><Icon name="trend" /></i></span><strong>${paidTotal.toLocaleString("en-US")}</strong><small>Across {paidCount} paid transactions</small><b aria-hidden="true">01</b></article>
            <article className="sales-stat-card"><span>OPEN PIPELINE</span><strong>${pendingTotal.toLocaleString("en-US")}</strong><small><i className="sales-dot dot-pending" />Waiting on payment</small></article>
            <article className="sales-stat-card"><span>ORDERS RECORDED</span><strong>{sales.length.toString().padStart(2, "0")}</strong><small><i className="sales-dot dot-paid" />{paidCount} completed successfully</small></article>
            <article className="sales-stat-card sales-stat-dark"><span>AVERAGE ORDER</span><strong>${(paidTotal / Math.max(1, paidCount)).toLocaleString("en-US", { maximumFractionDigits: 0 })}</strong><small>Per paid transaction</small><i aria-hidden="true">⌁</i></article>
          </section>

          <section className="sales-insights" aria-label="Sales activity overview">
            <article className="sales-chart-panel">
              <div className="sales-panel-heading"><div><span className="sales-eyebrow">A STEADY RHYTHM</span><h2>Sales activity</h2></div><span className="sales-chart-legend"><i /> Paid orders</span></div>
              <div className="sales-chart" role="img" aria-label="Weekly paid orders: Monday 42%, Tuesday 61%, Wednesday 48%, Thursday 78%, Friday 55%, Saturday 88%, Sunday 67%">
                {[["Mon", 42], ["Tue", 61], ["Wed", 48], ["Thu", 78], ["Fri", 55], ["Sat", 88], ["Sun", 67]].map(([day, height]) => <div className="sales-chart-column" key={day}><span style={{ height: `${height}%` }} /><small>{day}</small></div>)}
              </div>
            </article>
            <article className="sales-focus-card"><span className="sales-focus-icon"><Icon name="trend" /></span><span className="sales-eyebrow">A GOOD NEXT STEP</span><h2>Follow through feels good.</h2><p>{sales.filter((sale) => sale.status === "Pending").length} open transaction{sales.filter((sale) => sale.status === "Pending").length === 1 ? "" : "s"} could use a quick check-in.</p><button type="button" onClick={() => setStatusFilter("Pending")}>View pending orders<Icon name="arrow" /></button><span className="sales-focus-decoration" aria-hidden="true">✳</span></article>
          </section>

          <section className="sales-records" aria-labelledby="sales-records-title">
            <div className="sales-records-heading"><div><span className="sales-eyebrow">EVERY ORDER, ALL IN ONE PLACE</span><h2 id="sales-records-title">Sales records <span>{visibleSales.length}</span></h2></div><a href="/customers">Go to customer management<Icon name="arrow" /></a></div>
            <div className="sales-toolbar">
              <label className="sales-search"><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search order, customer, or product" aria-label="Search sales records" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><Icon name="close" /></button>}</label>
              <label className="sales-filter"><span className="sales-sr-only">Filter sales by status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All statuses</option><option>Paid</option><option>Pending</option><option>Cancelled</option></select><Icon name="down" /></label>
            </div>
            {visibleSales.length === 0 ? (
              <div className="sales-empty"><span><Icon name="receipt" /></span><h3>No matching sales just yet.</h3><p>Try another search or choose a different status.</p><button className="sales-secondary-button" type="button" onClick={() => { setQuery(""); setStatusFilter("All statuses"); }}>Clear filters</button></div>
            ) : (
              <div className="sales-table-wrap">
                <table className="sales-table">
                  <thead><tr><th scope="col">TRANSACTION</th><th scope="col">CUSTOMER</th><th scope="col">PRODUCT</th><th scope="col">DATE</th><th scope="col">TOTAL</th><th scope="col">STATUS</th></tr></thead>
                  <tbody>{visibleSales.map((sale) => <tr key={sale.id} onClick={() => setSelectedSale(sale)} tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedSale(sale); }}>
                    <td><button className="sales-id-button" type="button" onClick={() => setSelectedSale(sale)}>{sale.id}</button></td>
                    <td><span className="sales-customer-name">{sale.customer.split(" — ")[0]}</span><small className="sales-company-name">{sale.customer.split(" — ")[1]}</small></td>
                    <td>{sale.product}<small className="sales-company-name">{sale.quantity} units</small></td>
                    <td className="sales-date">{sale.date}</td>
                    <td className="sales-value">${sale.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                    <td><StatusBadge status={sale.status} /></td>
                  </tr>)}</tbody>
                </table>
              </div>
            )}
            {visibleSales.length > 0 && <div className="sales-table-foot"><span>Showing <b>{visibleSales.length}</b> of <b>{sales.length}</b> transactions</span><span>Choose an order to view its details</span></div>}
          </section>
        </div>
      </section>

      {showForm && <TransactionForm onClose={() => setShowForm(false)} onSave={saveSale} />}
      {selectedSale && <TransactionDetails sale={selectedSale} onClose={() => setSelectedSale(null)} />}
    </main>
  );
}
