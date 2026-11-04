import Link from "next/link";
import { resetPassword } from "@/app/actions/auth";

type ForgotPasswordPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

const errors: Record<string, string> = {
  "invalid-input": "Enter the email address for your account.",
  "request-failed": "We couldn't start the reset request. Please try again.",
  "reset-failed": "We couldn't send a reset email. Please try again.",
  "invalid-reset-link": "That reset link is invalid or has expired. Request a new one.",
};

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const params = await searchParams;

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="forgot-password-title">
        <Link className="auth-home-link" href="/">
          ← Back to Hope home
        </Link>
        <p className="eyebrow">HOPE, Inc.</p>
        <h1 id="forgot-password-title">Forgot password?</h1>
        <p className="intro">
          Enter your email address and we&apos;ll send you a password reset link.
        </p>

        {params.error && errors[params.error] && (
          <p className="form-message form-error" role="alert">
            {errors[params.error]}
          </p>
        )}
        {params.message === "check-email" && (
          <p className="form-message form-notice" role="status">
            If an account exists for that email, a password reset link is on its
            way.
          </p>
        )}

        <form action={resetPassword} className="auth-form">
          <label htmlFor="reset-email">Email</label>
          <input
            id="reset-email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
          <button type="submit">Send reset link</button>
        </form>

        <p className="back-link">
          <Link href="/login">Back to sign in</Link>
        </p>
      </section>
    </main>
  );
}
