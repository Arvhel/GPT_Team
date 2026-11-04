import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { createClient } from "@/utils/supabase/server";

type DashboardPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error("The dashboard requires an authenticated user.");
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="dashboard-title">
        <p className="eyebrow">HOPE, Inc.</p>
        <h1 id="dashboard-title">Dashboard</h1>
        <p className="intro">Signed in as {data.user.email}.</p>
        {params.message === "password-updated" && (
          <p className="form-message form-notice" role="status">
            Your password was updated.
          </p>
        )}
        <nav className="dashboard-workspaces" aria-label="Hope workspaces">
          <Link href="/people">
            <span>01</span>
            <strong>People &amp; culture</strong>
            <small>HR dashboard, employee profiles, and departments</small>
          </Link>
          <Link href="/customers">
            <span>02</span>
            <strong>Customer management</strong>
            <small>Customer relationships, search, and account details</small>
          </Link>
          <Link href="/products">
            <span>03</span>
            <strong>Product management</strong>
            <small>Products, inventory, and product details</small>
          </Link>
        </nav>
        <form action={logout}>
          <button type="submit">Log out</button>
        </form>
      </section>
    </main>
  );
}
