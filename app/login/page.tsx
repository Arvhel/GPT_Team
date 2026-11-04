"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { login, signup } from "@/app/actions/auth";

const messages: Record<string, string> = {
  "invalid-input": "Enter a valid email address and password.",
  "signup-failed": "We couldn't create your account. Please try again.",
  "login-failed": "Email or password is incorrect.",
  "logout-failed": "We couldn't sign you out. Please try again.",
  "reset-session-missing": "Open the password reset link from your email first.",
};

const notices: Record<string, string> = {
  "check-email": "Check your email to confirm your account.",
  "signed-out": "You have been signed out.",
};

function AuthForms() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const message = searchParams.get("message");

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <Link className="auth-home-link" href="/">
          ← Back to Hope home
        </Link>
        <p className="eyebrow">HOPE, Inc.</p>
        <h1 id="auth-title">Welcome</h1>
        <p className="intro">Sign in or create an account to continue.</p>

        {error && messages[error] && (
          <p className="form-message form-error" role="alert">
            {messages[error]}
          </p>
        )}
        {message && notices[message] && (
          <p className="form-message form-notice" role="status">
            {notices[message]}
          </p>
        )}

        <form className="auth-form">
          <h2>Sign in</h2>
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
          <Link className="forgot-password-link" href="/forgot-password">
            Forgot Password?
          </Link>
          <div className="form-actions">
            <button type="submit" formAction={login}>
              Sign in
            </button>
            <button
              type="submit"
              formAction={signup}
              className="secondary-button"
            >
              Create account
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="auth-page">
          <p>Loading sign-in form...</p>
        </main>
      }
    >
      <AuthForms />
    </Suspense>
  );
}
