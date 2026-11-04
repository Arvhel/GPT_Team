"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import "./customers.css";
import "../dashboard/dashboard-theme.css";

type CustomerStatus = "Active" | "Prospect" | "At risk";
type Customer = {
  id: number;
  name: string;
  email: string;
  company: string;
  phone: string;
  status: CustomerStatus;
  value: number;
  lastContact: string;
  note: string;
  color: string;
};
type CustomerDraft = Omit<Customer, "id" | "color">;
type DisplayState = "ready" | "loading" | "empty" | "error";

const initialCustomers: Customer[] = [
  { id: 1, name: "Olivia Bennett", email: "olivia@northstar.co", company: "Northstar Studio", phone: "+1 (415) 555-0182", status: "Active", value: 24800, lastContact: "Today", note: "Renewal conversation is going well. Interested in expanding to the design team.", color: "coral" },
  { id: 2, name: "Marcus Chen", email: "marcus@fieldwork.com", company: "Fieldwork Goods", phone: "+1 (212) 555-0137", status: "Prospect", value: 18200, lastContact: "Yesterday", note: "Requested a walkthrough for the operations team.", color: "blue" },
  { id: 3, name: "Amara Okafor", email: "amara@kindred.org", company: "Kindred Collective", phone: "+1 (312) 555-0159", status: "Active", value: 32600, lastContact: "Oct 28", note: "Long-time customer. Planning a quarterly account review.", color: "sage" },
  { id: 4, name: "Leo Martinez", email: "leo@juniperhouse.com", company: "Juniper House", phone: "+1 (512) 555-0194", status: "At risk", value: 9600, lastContact: "Oct 22", note: "Usage has dipped. Check in about their current workflow.", color: "gold" },
  { id: 5, name: "Priya Shah", email: "priya@softcurrent.io", company: "Soft Current", phone: "+1 (206) 555-0126", status: "Prospect", value: 14750, lastContact: "Oct 20", note: "Comparing options. Follow up with the custom onboarding plan.", color: "lilac" },
  { id: 6, name: "Elliot James", email: "elliot@daybreak.cafe", company: "Daybreak Cafe", phone: "+1 (503) 555-0161", status: "Active", value: 12100, lastContact: "Oct 18", note: "Happy with the current setup; discuss referrals next call.", color: "mint" },
];

const avatarColors = ["coral", "blue", "sage", "gold", "lilac", "mint"];

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
    refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.6 9a7 7 0 0 1 11.6-2L20 12M4 12l2.8 5a7 7 0 0 0 11.6-2" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 2.7a2 2 0 0 1-.6 1.8L7.7 9.5a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 1.8-.6l2.7.5a2 2 0 0 1 1.5 1.8Z" />,
    sparkle: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" /><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" /></>,
  };
  return <svg aria-hidden="true" className="customer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name] ?? paths.sparkle}</svg>;
}

function Initials({ name, color }: { name: string; color: string }) {
  return <span className={`customer-avatar avatar-${color}`} aria-hidden="true">{name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</span>;
}

function CustomerForm({ customer, onClose, onSave }: {
  customer: Customer | null;
  onClose: () => void;
  onSave: (draft: CustomerDraft) => void;
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSave({
      name: String(data.get("name")).trim(),
      email: String(data.get("email")).trim(),
      company: String(data.get("company")).trim(),
      phone: String(data.get("phone")).trim(),
      status: String(data.get("status")) as CustomerStatus,
      value: Number(data.get("value")),
      lastContact: String(data.get("lastContact")),
      note: String(data.get("note")).trim(),
    });
  }

  return (
    <div className="customer-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="customer-modal" role="dialog" aria-modal="true" aria-labelledby="customer-form-title">
        <button className="customer-modal-close" type="button" onClick={onClose} aria-label="Close form"><Icon name="close" /></button>
        <span className="customer-eyebrow">{customer ? "KEEP THE CONVERSATION CURRENT" : "A NEW CONNECTION STARTS HERE"}</span>
        <h2 id="customer-form-title">{customer ? "Edit customer" : "Add a customer"}</h2>
        <p>Keep the relationship details thoughtful and easy to find.</p>
        <form className="customer-form" onSubmit={submit}>
          <div className="customer-form-row">
            <label>Contact name<input name="name" placeholder="e.g. Olivia Bennett" defaultValue={customer?.name} required maxLength={70} /></label>
            <label>Company<input name="company" placeholder="e.g. Northstar Studio" defaultValue={customer?.company} required maxLength={80} /></label>
          </div>
          <div className="customer-form-row">
            <label>Email address<input name="email" type="email" placeholder="name@company.com" defaultValue={customer?.email} required maxLength={120} /></label>
            <label>Phone<input name="phone" type="tel" placeholder="+1 (555) 000-0000" defaultValue={customer?.phone} required maxLength={30} /></label>
          </div>
          <div className="customer-form-row">
            <label>Relationship<select name="status" defaultValue={customer?.status ?? "Prospect"}><option>Active</option><option>Prospect</option><option>At risk</option></select></label>
            <label>Account value (USD)<input name="value" type="number" min="0" step="50" defaultValue={customer?.value ?? 0} required /></label>
          </div>
          <label>Last contact<input name="lastContact" placeholder="e.g. Today or Oct 28" defaultValue={customer?.lastContact ?? "Today"} required maxLength={30} /></label>
          <label>Relationship notes<textarea name="note" placeholder="What should your team remember about this relationship?" defaultValue={customer?.note} rows={3} maxLength={400} /></label>
          <div className="customer-form-actions"><button type="button" className="customer-secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="customer-primary-button">{customer ? "Save changes" : "Add customer"}<Icon name="arrow" /></button></div>
        </form>
      </section>
    </div>
  );
}

function CustomerProfile({ customer, onClose, onEdit }: { customer: Customer; onClose: () => void; onEdit: () => void }) {
  return (
    <div className="customer-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="customer-modal customer-profile-modal" role="dialog" aria-modal="true" aria-labelledby="customer-profile-title">
        <button className="customer-modal-close" type="button" onClick={onClose} aria-label="Close profile"><Icon name="close" /></button>
        <div className="customer-profile-cover"><span>GOOD RELATIONSHIPS, GROWING TOGETHER</span><i>✳</i></div>
        <div className="customer-profile-identity"><Initials name={customer.name} color={customer.color} /><span className={`customer-status status-${customer.status.toLowerCase().replace(" ", "-")}`}><i />{customer.status}</span></div>
        <h2 id="customer-profile-title">{customer.name}</h2>
        <p className="customer-profile-company">{customer.company}</p>
        <div className="customer-profile-contact">
          <a href={`mailto:${customer.email}`}><Icon name="mail" />{customer.email}</a>
          <a href={`tel:${customer.phone.replace(/[^\d+]/g, "")}`}><Icon name="phone" />{customer.phone}</a>
        </div>
        <div className="customer-profile-stats"><span>ACCOUNT VALUE<strong>${customer.value.toLocaleString("en-US")}</strong></span><span>LAST CONTACT<strong>{customer.lastContact}</strong></span></div>
        <div className="customer-note"><span>RELATIONSHIP NOTES</span><p>{customer.note || "No notes yet. Add a note to keep the team in the loop."}</p></div>
        <button className="customer-primary-button customer-profile-edit" type="button" onClick={onEdit}>Edit customer<Icon name="arrow" /></button>
      </section>
    </div>
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState(initialCustomers);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All relationships");
  const [displayState, setDisplayState] = useState<DisplayState>("ready");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null | undefined>(undefined);
  const [notice, setNotice] = useState("");

  const visibleCustomers = useMemo(() => customers.filter((customer) => {
    const text = `${customer.name} ${customer.company} ${customer.email}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (statusFilter === "All relationships" || customer.status === statusFilter);
  }), [customers, query, statusFilter]);
  const activeCount = customers.filter((customer) => customer.status === "Active").length;
  const prospectCount = customers.filter((customer) => customer.status === "Prospect").length;
  const atRiskCount = customers.filter((customer) => customer.status === "At risk").length;
  const totalValue = customers.reduce((sum, customer) => sum + customer.value, 0);

  function announce(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  }

  function saveCustomer(draft: CustomerDraft) {
    if (editingCustomer) {
      setCustomers((current) => current.map((customer) => customer.id === editingCustomer.id ? { ...customer, ...draft } : customer));
      setSelectedCustomer(null);
      announce(`${draft.name}'s customer profile has been updated.`);
    } else {
      const newCustomer: Customer = {
        ...draft,
        id: Math.max(0, ...customers.map((customer) => customer.id)) + 1,
        color: avatarColors[customers.length % avatarColors.length],
      };
      setCustomers((current) => [newCustomer, ...current]);
      announce(`${draft.name} has been added to your customers.`);
    }
    setEditingCustomer(undefined);
  }

  function setTemporaryState(state: DisplayState) {
    if (state === "loading") {
      setDisplayState("loading");
      window.setTimeout(() => setDisplayState("ready"), 800);
      return;
    }
    setDisplayState(state);
  }

  return (
    <main className="customers-app">
      <aside className="customers-sidebar">
        <a className="customers-brand" href="/" aria-label="Hope home"><span className="customers-mark"><Icon name="leaf" /></span><span>hope<span>, inc.</span></span></a>
        <div className="customers-workspace"><span className="customers-workspace-avatar">H</span><span><b>Hope Studio</b><small>Workspace</small></span><Icon name="down" /></div>
        <span className="customers-sidebar-label">YOUR WORKSPACE</span>
        <nav className="customers-nav" aria-label="Workspace navigation">
          <a href="/dashboard"><Icon name="grid" />Overview</a>
          <a href="/products"><Icon name="box" />Products</a>
          <a href="/people"><Icon name="people" />People</a>
          <a href="/sales"><Icon name="chart" />Sales</a>
          <a className="customer-nav-child active-child" href="/customers" aria-current="page"><Icon name="sparkle" />Customer management<span>{customers.length}</span></a>
        </nav>
        <div className="customers-sidebar-bottom">
          <div className="customers-side-note"><span>✳</span><b>Every good thing starts with a connection.</b><p>Keep the details close. Make the follow-through feel personal.</p></div>
          <a href="/" className="customers-home-link">← <span>Back to Hope home</span></a>
          <div className="customers-sidebar-profile"><span className="customer-avatar avatar-blue">AM</span><span><b>Alex Morgan</b><small>Workspace owner</small></span><span className="customers-profile-dots">···</span></div>
        </div>
      </aside>

      <section className="customers-main">
        <header className="customers-topbar">
          <div className="customers-breadcrumb"><span>Workspace</span><i>/</i><b>Customer management</b></div>
          <div className="customers-topbar-right"><span>RELATIONSHIPS, NOT JUST RECORDS</span><span className="customers-topbar-avatar">A</span></div>
        </header>

        <div className="customers-content">
          <div className="customers-heading">
            <div><span className="customers-eyebrow">THE PEOPLE BEHIND THE PARTNERSHIPS</span><h1>Customer management<span>.</span></h1><p>A warmer, clearer view of every customer relationship.</p></div>
            <button className="customer-primary-button add-customer-button" type="button" onClick={() => setEditingCustomer(null)}><Icon name="plus" />Add customer</button>
          </div>

          <section className="customer-overview" aria-label="Customer relationship overview">
            <article className="customer-stat-card customer-stat-total"><span>PEOPLE IN YOUR CORNER <i>✳</i></span><strong>{customers.length.toString().padStart(2, "0")}</strong><small>Relationships, all together</small><b aria-hidden="true">01</b></article>
            <article className="customer-stat-card"><span>GROWING TOGETHER</span><strong>{activeCount.toString().padStart(2, "0")}</strong><small><i className="customer-dot dot-active" />Active customers</small></article>
            <article className="customer-stat-card"><span>NEW CONNECTIONS</span><strong>{prospectCount.toString().padStart(2, "0")}</strong><small><i className="customer-dot dot-prospect" />Prospects to nurture</small></article>
            <article className="customer-stat-card customer-stat-value"><span>RELATIONSHIP VALUE</span><strong>${totalValue.toLocaleString("en-US")}</strong><small>{atRiskCount} account{atRiskCount === 1 ? "" : "s"} could use a check-in</small><i aria-hidden="true">⌁</i></article>
          </section>

          <section className="customer-list-panel" aria-labelledby="customer-list-title">
            <div className="customer-list-heading">
              <div><span className="customers-eyebrow">GOOD CONVERSATIONS, ALL IN ONE PLACE</span><h2 id="customer-list-title">Your relationships <span>{customers.length}</span></h2></div>
              <details className="customer-state-control">
                <summary>View states <Icon name="down" /></summary>
                <div>{(["ready", "loading", "empty", "error"] as DisplayState[]).map((state) => <button key={state} type="button" onClick={(event) => { setTemporaryState(state); event.currentTarget.closest("details")?.removeAttribute("open"); }}>{state[0].toUpperCase() + state.slice(1)}</button>)}</div>
              </details>
            </div>
            <div className="customer-toolbar">
              <label className="customer-search"><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search people, companies, or email" aria-label="Search customers" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><Icon name="close" /></button>}</label>
              <label className="customer-filter"><span className="sr-only">Filter customers by relationship</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All relationships</option><option>Active</option><option>Prospect</option><option>At risk</option></select><Icon name="down" /></label>
            </div>

            {displayState === "loading" ? (
              <div className="customer-state-panel" role="status"><span className="customer-state-icon customer-loading-icon"><Icon name="refresh" /></span><h3>Bringing things into view…</h3><p>Gathering your customer relationships.</p></div>
            ) : displayState === "empty" || visibleCustomers.length === 0 ? (
              <div className="customer-state-panel"><span className="customer-state-icon"><Icon name="people" /></span><h3>{displayState === "empty" ? "A little room for new connections." : "No match in this corner just yet."}</h3><p>{displayState === "empty" ? "Add a customer to start building your relationship list." : "Try another search or clear your filters."}</p>{displayState === "empty" ? <button className="customer-primary-button" type="button" onClick={() => setEditingCustomer(null)}><Icon name="plus" />Add customer</button> : <button className="customer-secondary-button" type="button" onClick={() => { setQuery(""); setStatusFilter("All relationships"); setDisplayState("ready"); }}>Clear filters</button>}</div>
            ) : displayState === "error" ? (
              <div className="customer-state-panel"><span className="customer-state-icon customer-error-icon">!</span><h3>We couldn’t load the customer list.</h3><p>Your customer details are safe. Try loading the list again.</p><button className="customer-secondary-button" type="button" onClick={() => setTemporaryState("loading")}><Icon name="refresh" />Try again</button></div>
            ) : (
              <div className="customer-table-wrap">
                <table className="customer-table">
                  <thead><tr><th scope="col">CUSTOMER</th><th scope="col">COMPANY</th><th scope="col">RELATIONSHIP</th><th scope="col">ACCOUNT VALUE</th><th scope="col">LAST CONTACT</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                  <tbody>{visibleCustomers.map((customer) => <tr key={customer.id}>
                    <td><button className="customer-person-button" type="button" onClick={() => setSelectedCustomer(customer)}><Initials name={customer.name} color={customer.color} /><span><b>{customer.name}</b><small>{customer.email}</small></span></button></td>
                    <td><span className="customer-company-name">{customer.company}</span></td>
                    <td><span className={`customer-status status-${customer.status.toLowerCase().replace(" ", "-")}`}><i />{customer.status}</span></td>
                    <td className="customer-value">${customer.value.toLocaleString("en-US")}</td>
                    <td className="customer-last-contact">{customer.lastContact}</td>
                    <td><button className="customer-row-action" type="button" aria-label={`Edit ${customer.name}`} onClick={() => setEditingCustomer(customer)}>···</button></td>
                  </tr>)}</tbody>
                </table>
              </div>
            )}
            {displayState === "ready" && visibleCustomers.length > 0 && <div className="customer-table-foot"><span>Showing <b>{visibleCustomers.length}</b> of <b>{customers.length}</b> relationships</span><span>Small details. Stronger connections. <i>✳</i></span></div>}
          </section>

          <footer className="customers-footer"><span>HOPE, INC. &nbsp;·&nbsp; MADE FOR THE WAY TEAMS REALLY WORK</span><a href="/">A little more in sync <Icon name="leaf" /></a></footer>
        </div>
      </section>
      {notice && <div className="customer-toast" role="status"><span>✓</span>{notice}</div>}
      {editingCustomer !== undefined && <CustomerForm customer={editingCustomer} onClose={() => setEditingCustomer(undefined)} onSave={saveCustomer} />}
      {selectedCustomer && <CustomerProfile customer={customers.find((customer) => customer.id === selectedCustomer.id) ?? selectedCustomer} onClose={() => setSelectedCustomer(null)} onEdit={() => { setEditingCustomer(selectedCustomer); setSelectedCustomer(null); }} />}
    </main>
  );
}
