import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { createClient } from "@/utils/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error && error.name !== "AuthSessionMissingError") {
    throw error;
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="home-title">
        <p className="eyebrow">HOPE, Inc.</p>
        <h1 id="home-title">Account</h1>
        {data.user ? (
          <>
            <p className="intro">Signed in as {data.user.email}.</p>
            <Link className="link-button" href="/dashboard">
              Go to your workspace
            </Link>
            <form action={logout}>
              <button type="submit">Sign out</button>
            </form>
          </>
        ) : (
          <>
            <p className="intro">Sign in to access your account.</p>
            <Link className="link-button" href="/login">
              Go to sign in
            </Link>
          </>
        )}
      </section>
    </main>
  );
}
