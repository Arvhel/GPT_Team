import { updatePassword } from "@/app/actions/auth";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

const errors: Record<string, string> = {
  "invalid-password": "Passwords must match and be at least 8 characters long.",
  "update-failed": "We couldn't update your password. Please try again.",
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="reset-password-title">
        <p className="eyebrow">HOPE, Inc.</p>
        <h1 id="reset-password-title">Choose a new password</h1>
        <p className="intro">Use at least 8 characters for your new password.</p>

        {params.error && errors[params.error] && (
          <p className="form-message form-error" role="alert">
            {errors[params.error]}
          </p>
        )}

        <form action={updatePassword} className="auth-form">
          <label htmlFor="new-password">New password</label>
          <input
            id="new-password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
          <label htmlFor="confirm-password">Confirm new password</label>
          <input
            id="confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
          <button type="submit">Update password</button>
        </form>
      </section>
    </main>
  );
}
