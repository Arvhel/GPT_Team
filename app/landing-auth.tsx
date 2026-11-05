"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login, resetPassword, signup, updatePassword } from "@/app/actions/auth";

type AuthView = "login" | "signup" | "forgot" | "reset";

const errorMessages: Record<string, string> = {
  "invalid-input": "Please check the information you entered and try again.",
  "signup-failed": "We couldn't create your account. Please try again.",
  "login-failed": "Email or password is incorrect.",
  "logout-failed": "We couldn't sign you out. Please try again.",
  "reset-session-missing": "Open the password reset link from your email first.",
  "invalid-reset-link": "That reset link is invalid or expired. Request a new one.",
  "request-failed": "We couldn't start the reset request. Please try again.",
  "reset-failed": "We couldn't send a reset email. Please try again.",
  "invalid-password": "Passwords must match and be at least 8 characters long.",
  "update-failed": "We couldn't update your password. Please try again.",
};

const noticeMessages: Record<string, string> = {
  "check-email": "Check your email to confirm your account.",
  "reset-email": "If an account exists for that email, a reset link is on its way.",
  "signed-out": "You have been signed out.",
};

type LandingAuthContextValue = {
  open: (view: AuthView) => void;
};

const LandingAuthContext = createContext<LandingAuthContextValue | null>(null);

type LandingAuthProps = {
  children: ReactNode;
  initialView?: AuthView;
  error?: string;
  message?: string;
};

export function LandingAuth({
  children,
  initialView,
  error,
  message,
}: LandingAuthProps) {
  const router = useRouter();
  const [view, setView] = useState<AuthView | null>(initialView ?? null);
  const [activeError, setActiveError] = useState(error ?? "");
  const [activeMessage, setActiveMessage] = useState(message ?? "");

  function open(nextView: AuthView) {
    setActiveError("");
    setActiveMessage("");
    setView(nextView);
  }

  function close() {
    setView(null);
    if (initialView || error || message) {
      router.replace("/", { scroll: false });
    }
  }

  return (
    <LandingAuthContext.Provider value={{ open }}>
      {children}
      {view && (
        <AuthDialog
          view={view}
          error={activeError}
          message={activeMessage}
          onClose={close}
          onViewChange={open}
        />
      )}
    </LandingAuthContext.Provider>
  );
}

export function AuthTrigger({
  view,
  className,
  children,
}: {
  view: AuthView;
  className: string;
  children: ReactNode;
}) {
  const auth = useContext(LandingAuthContext);

  if (!auth) {
    throw new Error("AuthTrigger must be used inside LandingAuth.");
  }

  return (
    <button className={className} type="button" onClick={() => auth.open(view)}>
      {children}
    </button>
  );
}

function AuthDialog({
  view,
  error,
  message,
  onClose,
  onViewChange,
}: {
  view: AuthView;
  error: string;
  message: string;
  onClose: () => void;
  onViewChange: (view: AuthView) => void;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const isSignup = view === "signup";
  const isForgot = view === "forgot";
  const isReset = view === "reset";
  const title = isSignup
    ? "Make room for good work."
    : isForgot
      ? "Let's get you back in."
      : isReset
        ? "Choose a new password."
        : "Good to see you.";
  const description = isSignup
    ? "Create your Hope workspace. Your team is just around the corner."
    : isForgot
      ? "Enter the email address linked to your account."
      : isReset
        ? "Choose a strong password for your Hope account."
        : "Sign in to pick up right where you left off.";
  const eyebrow = isSignup
    ? "A BETTER WAY TO WORK"
    : isForgot
      ? "NO WORRIES"
      : isReset
        ? "ONE LAST THING"
        : "WELCOME BACK";
  const action = isSignup
    ? signup
    : isForgot
      ? resetPassword
      : isReset
        ? updatePassword
        : login;

  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="auth-dialog-title"
        aria-modal="true"
        className="auth-dialog"
        role="dialog"
      >
        <button
          className="dialog-close"
          type="button"
          aria-label="Close"
          onClick={onClose}
        >
          <svg aria-hidden="true" className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>
        <aside className="auth-aside">
          <Link className="brand brand-compact" href="/" onClick={onClose}>
            <span className="brand-mark" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </span>
            <span className="brand-name">
              hope<span>, inc.</span>
            </span>
          </Link>
          <div className="auth-aside-copy">
            <span className="eyebrow">A CALMER KIND OF WORK</span>
            <p>
              Good things happen when everyone&apos;s <em>in sync.</em>
            </p>
            <span className="aside-spark" aria-hidden="true">✧</span>
          </div>
          <span className="aside-foot">HOPE, INC. &nbsp;·&nbsp; YOUR WORK, TOGETHER</span>
        </aside>
        <div className="auth-content">
          <span className="eyebrow">{eyebrow}</span>
          <h2 id="auth-dialog-title">{title}</h2>
          <p className="auth-description">{description}</p>

          {errorMessages[error] && (
            <p className="form-notice form-notice-error" role="alert">
              {errorMessages[error]}
            </p>
          )}
          {noticeMessages[message] && (
            <p className="form-notice" role="status">
              {noticeMessages[message]}
            </p>
          )}

          <form action={action} className="auth-form">
            {isSignup && (
              <>
                <div className="field-row">
                  <label className="field">
                    First name
                    <input autoComplete="given-name" name="firstName" placeholder="Alex" required />
                  </label>
                  <label className="field">
                    Last name
                    <input autoComplete="family-name" name="lastName" placeholder="Morgan" required />
                  </label>
                </div>
                <label className="field">
                  Company name
                  <input autoComplete="organization" name="company" placeholder="Your company" required />
                </label>
              </>
            )}

            {(view === "login" || isSignup || isForgot) && (
              <label className="field">
                Work email
                <input
                  autoComplete="email"
                  name="email"
                  placeholder="you@company.com"
                  type="email"
                  required
                />
              </label>
            )}

            {(view === "login" || isSignup) && (
              <label className="field">
                Password
                <input
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  minLength={isSignup ? 8 : undefined}
                  name="password"
                  placeholder={isSignup ? "At least 8 characters" : "Enter your password"}
                  type="password"
                  required
                />
                {isSignup && <span className="field-hint">Use at least 8 characters.</span>}
              </label>
            )}

            {isReset && (
              <>
                <label className="field">
                  New password
                  <input
                    autoComplete="new-password"
                    minLength={8}
                    name="password"
                    placeholder="At least 8 characters"
                    type="password"
                    required
                  />
                </label>
                <label className="field">
                  Confirm new password
                  <input
                    autoComplete="new-password"
                    minLength={8}
                    name="confirmPassword"
                    placeholder="Enter your new password again"
                    type="password"
                    required
                  />
                </label>
              </>
            )}

            {view === "login" && (
              <button
                className="text-link forgot-link"
                type="button"
                onClick={() => onViewChange("forgot")}
              >
                Forgot password?
              </button>
            )}

            <button className="button button-primary auth-submit" type="submit">
              {isSignup
                ? "Create your account"
                : isForgot
                  ? "Send reset instructions"
                  : isReset
                    ? "Set new password"
                    : "Sign in"}
              <span aria-hidden="true">→</span>
            </button>
          </form>

          <div className="auth-switch">
            {view === "login" ? (
              <>
                New to Hope?{" "}
                <button className="text-link" type="button" onClick={() => onViewChange("signup")}>
                  Create an account
                </button>
              </>
            ) : isSignup ? (
              <>
                Already have an account?{" "}
                <button className="text-link" type="button" onClick={() => onViewChange("login")}>
                  Sign in
                </button>
              </>
            ) : isForgot ? (
              <button className="text-link" type="button" onClick={() => onViewChange("login")}>
                Back to sign in
              </button>
            ) : (
              <button className="text-link" type="button" onClick={() => onViewChange("login")}>
                Back to sign in
              </button>
            )}
          </div>
          <p className="auth-legal">
            By continuing, you agree to our <Link href="/#terms">Terms</Link> and{" "}
            <Link href="/#privacy">Privacy Policy</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
