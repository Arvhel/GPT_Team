"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { logout } from "@/app/actions/auth";

const modules = [
  { href: "/products", label: "Products" },
  { href: "/employees", label: "People / HR" },
  { href: "/customers", label: "Customers" },
  { href: "/sales", label: "Sales" },
];

export default function WorkspaceHeader() {
  const pathname = usePathname();
  const [account, setAccount] = useState<
    | { status: "loading" }
    | { status: "signed-out" }
    | { status: "signed-in"; email: string }
    | { status: "error" }
  >({ status: "loading" });
  const isWorkspace = [
    "/products",
    "/employees",
    "/departments",
    "/customers",
    "/sales",
    "/dashboard",
  ].some((route) => pathname === route || pathname.startsWith(`${route}/`));

  useEffect(() => {
    if (!isWorkspace) return;

    const supabase = createClient();
    let active = true;
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setAccount(
        session?.user
          ? { status: "signed-in", email: session.user.email ?? "Signed in" }
          : { status: "signed-out" },
      );
    });

    void supabase.auth.getUser().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        console.error("[workspace-header] Unable to check the current session.", error);
        setAccount({ status: "error" });
        return;
      }
      setAccount(
        data.user
          ? { status: "signed-in", email: data.user.email ?? "Signed in" }
          : { status: "signed-out" },
      );
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [isWorkspace]);

  if (!isWorkspace) return null;

  return (
    <header className="workspace-header">
      <Link className="workspace-brand" href="/dashboard" aria-label="HOPE, Inc. dashboard">
        hope<span>, inc.</span>
      </Link>
      <nav className="workspace-nav" aria-label="Main navigation">
        {modules.map((module) => {
          const active =
            pathname === module.href || pathname.startsWith(`${module.href}/`);
          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={active ? "workspace-nav-link is-active" : "workspace-nav-link"}
              href={module.href}
              key={module.href}
            >
              {module.label}
            </Link>
          );
        })}
        <Link
          aria-current={pathname.startsWith("/departments") ? "page" : undefined}
          className={
            pathname.startsWith("/departments")
              ? "workspace-nav-link is-active"
              : "workspace-nav-link"
          }
          href="/departments"
        >
          Departments
        </Link>
      </nav>
      <div className="workspace-account">
        <span
          className={`workspace-account-indicator is-${account.status}`}
          aria-hidden="true"
        />
        <span className="workspace-account-label">
          {account.status === "signed-in"
            ? account.email
            : account.status === "signed-out"
              ? "Not signed in"
              : account.status === "error"
                ? "Session unavailable"
                : "Checking session"}
        </span>
        {account.status === "signed-in" ? (
          <form action={logout}>
            <button className="workspace-account-action" type="submit">
              Sign out
            </button>
          </form>
        ) : account.status === "signed-out" ? (
          <Link className="workspace-account-action" href="/login">
            Sign in
          </Link>
        ) : null}
      </div>
    </header>
  );
}
