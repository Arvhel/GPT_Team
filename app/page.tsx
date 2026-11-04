"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

type AuthView = "login" | "register" | "forgot" | "reset";

const modules = [
  {
    number: "01",
    title: "Product management",
    description: "Keep every launch moving, from first brief to final shipment.",
    icon: "box",
    color: "lavender",
  },
  {
    number: "02",
    title: "People & culture",
    description: "Give your people a clearer view of their work and their growth.",
    icon: "people",
    color: "green",
  },
  {
    number: "03",
    title: "Sales management",
    description: "Turn thoughtful conversations into a healthier sales pipeline.",
    icon: "chart",
    color: "peach",
  },
  {
    number: "04",
    title: "Customer relationships",
    description: "Bring every customer detail together in one considered place.",
    icon: "spark",
    color: "blue",
  },
];

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <a className={`brand${compact ? " brand-compact" : ""}`} href="#" aria-label="Hope, Inc. home">
      <span className="brand-mark" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </span>
      <span className="brand-name">hope<span>, inc.</span></span>
    </a>
  );
}

function Icon({ name }: { name: string }) {
  const paths: Record<string, ReactNode> = {
    box: (
      <>
        <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
        <path d="m4.5 7.7 7.5 4.2 7.5-4.2M12 12v8.5" />
      </>
    ),
    people: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 20v-1.5a5.5 5.5 0 0 1 11 0V20M16 5.5a3 3 0 0 1 0 5.8M18 14a5 5 0 0 1 2.5 4.5V20" />
      </>
    ),
    chart: (
      <>
        <path d="M4 20V11M10 20V5M16 20v-7M22 20H2" />
        <path d="m3 8 6-4 6 6 6-5" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
        <path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" />
      </>
    ),
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    eye: (
      <>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    leaf: (
      <>
        <path d="M20 4C10 4 5 7.5 5 14a6 6 0 0 0 6 6c6.5 0 9-6 9-16Z" />
        <path d="M4 21c2-5 5-8 11-11" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name] ?? paths.spark}
    </svg>
  );
}

function DashboardPreview() {
  return (
    <div className="dashboard-art" aria-label="Preview of the Hope workspace">
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="preview-window">
        <div className="preview-topbar">
          <div className="preview-brand">
            <span className="mini-mark"><Icon name="leaf" /></span>
            <span>Good morning, Alex <span className="wave">✳</span></span>
          </div>
          <div className="avatar-stack" aria-hidden="true"><i>A</i><i>M</i><i>J</i><b>+2</b></div>
        </div>
        <div className="preview-heading">
          <div><small>MONDAY, OCTOBER 21</small><h2>Your week, in view.</h2></div>
          <span className="today-pill"><span /> All systems happy</span>
        </div>
        <div className="metric-grid">
          <div className="metric-card">
            <span>Open opportunities</span>
            <strong>128</strong>
            <small className="positive">↗ 12.8% <span>this month</span></small>
            <div className="sparkline" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
          </div>
          <div className="metric-card metric-people">
            <span>Team pulse</span>
            <strong>94<span className="metric-percent">%</span></strong>
            <small>Feeling good this week</small>
            <div className="pulse-bar"><i /></div>
          </div>
        </div>
        <div className="preview-bottom">
          <div className="task-heading"><span>Moving along</span><a href="/products">View products <Icon name="arrow" /></a></div>
          <div className="task-row"><span className="task-check">✓</span><span>Q4 product launch</span><small>Product</small><b>On track</b></div>
          <div className="task-row"><span className="task-check task-empty" /><span>Northstar renewal</span><small>Customer</small><b className="task-review">In review</b></div>
        </div>
      </div>
      <div className="float-note note-left"><span className="note-icon"><Icon name="spark" /></span><span><b>One less follow-up</b><small>Your team is up to date</small></span><i>✓</i></div>
      <div className="float-note note-right"><span className="note-avatar">S</span><span><b>A little high five</b><small>Maya closed a new deal</small></span><span className="note-heart">♥</span></div>
    </div>
  );
}

function AuthDialog({
  view,
  setView,
  onClose,
}: {
  view: AuthView;
  setView: (view: AuthView) => void;
  onClose: () => void;
}) {
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setStatus("");
    setIsSubmitting(false);
    return () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    };
  }, [view]);

  const titles: Record<AuthView, { eyebrow: string; title: string; detail: string }> = {
    login: { eyebrow: "WELCOME BACK", title: "Good to see you.", detail: "Sign in to pick up right where you left off." },
    register: { eyebrow: "A BETTER WAY TO WORK", title: "Make room for good work.", detail: "Create your Hope workspace. Your team is just around the corner." },
    forgot: { eyebrow: "NO WORRIES", title: "Let's get you back in.", detail: "Enter the email address linked to your account." },
    reset: { eyebrow: "ONE LAST THING", title: "Choose a new password.", detail: "Make it strong, memorable, and just for you." },
  };

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setStatus("");
    if (
      view === "reset" &&
      formData.get("newPassword") !== formData.get("confirmPassword")
    ) {
      setStatus("Those passwords don’t match. Please try again.");
      return;
    }

    setIsSubmitting(true);
    timeoutRef.current = window.setTimeout(() => {
      setIsSubmitting(false);
      setStatus(
        view === "login"
          ? "We couldn’t sign you in because authentication isn’t connected in this preview."
          : view === "register"
            ? "We couldn’t create your account because authentication isn’t connected in this preview."
            : view === "forgot"
              ? "We couldn’t send reset instructions because authentication isn’t connected in this preview."
              : "We couldn’t update your password because authentication isn’t connected in this preview.",
      );
      timeoutRef.current = null;
    }, 650);
  }

  const title = titles[view];

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section
        aria-labelledby="auth-title"
        aria-modal="true"
        className="auth-dialog"
        role="dialog"
      >
        <button className="dialog-close" type="button" aria-label="Close dialog" onClick={onClose}>
          <Icon name="close" />
        </button>
        <div className="auth-aside">
          <Brand compact />
          <div className="auth-aside-copy">
            <span className="eyebrow">A CALMER KIND OF WORK</span>
            <p>Good things happen when everyone&apos;s <em>in sync.</em></p>
            <span className="aside-spark"><Icon name="spark" /></span>
          </div>
          <span className="aside-foot">HOPE, INC. &nbsp;·&nbsp; YOUR WORK, TOGETHER</span>
        </div>
        <div className="auth-content">
          <span className="eyebrow">{title.eyebrow}</span>
          <h2 id="auth-title">{title.title}</h2>
          <p className="auth-description">{title.detail}</p>
          <form className="auth-form" onSubmit={submitForm} aria-busy={isSubmitting}>
            {view === "register" && (
              <div className="field-row">
                <label className="field">First name<input autoComplete="given-name" name="firstName" placeholder="Alex" required disabled={isSubmitting} /></label>
                <label className="field">Last name<input autoComplete="family-name" name="lastName" placeholder="Morgan" required disabled={isSubmitting} /></label>
              </div>
            )}
            {view === "register" && (
              <label className="field">Company name<input autoComplete="organization" name="company" placeholder="Your company" required disabled={isSubmitting} /></label>
            )}
            {(view === "login" || view === "register" || view === "forgot") && (
              <label className="field">Work email<input autoComplete="email" name="email" placeholder="you@company.com" type="email" required disabled={isSubmitting} /></label>
            )}
            {(view === "login" || view === "register") && (
              <label className="field">Password<input autoComplete={view === "login" ? "current-password" : "new-password"} minLength={8} name="password" placeholder="At least 8 characters" type="password" required disabled={isSubmitting} /><span className="field-hint">Use at least 8 characters.</span></label>
            )}
            {view === "reset" && (
              <>
                <label className="field">Reset code<input autoComplete="one-time-code" name="resetCode" placeholder="Enter your reset code" required disabled={isSubmitting} /></label>
                <label className="field">New password<input autoComplete="new-password" minLength={8} name="newPassword" placeholder="At least 8 characters" type="password" required disabled={isSubmitting} /><span className="field-hint">Use at least 8 characters.</span></label>
                <label className="field">Confirm new password<input autoComplete="new-password" minLength={8} name="confirmPassword" placeholder="Enter your new password again" type="password" required disabled={isSubmitting} /></label>
              </>
            )}
            {view === "login" && (
              <button className="text-link forgot-link" type="button" onClick={() => setView("forgot")} disabled={isSubmitting}>Forgot password?</button>
            )}
            <button className="button button-primary auth-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <><span className="button-spinner" aria-hidden="true" />Checking…</>
              ) : (
                <>{view === "login" ? "Sign in" : view === "register" ? "Create your account" : view === "forgot" ? "Send reset instructions" : "Set new password"}<Icon name="arrow" /></>
              )}
            </button>
            {isSubmitting && <p className="form-loading" role="status">Checking your details…</p>}
            {status && <p className="form-notice form-notice-error" role="alert">{status}</p>}
          </form>
          <div className="auth-switch">
            {view === "login" ? (
              <>New to Hope? <button className="text-link" type="button" onClick={() => setView("register")} disabled={isSubmitting}>Create an account</button></>
            ) : view === "register" ? (
              <>Already have an account? <button className="text-link" type="button" onClick={() => setView("login")} disabled={isSubmitting}>Sign in</button></>
            ) : view === "forgot" ? (
              <><button className="text-link" type="button" onClick={() => setView("login")} disabled={isSubmitting}>Back to sign in</button><span>·</span><button className="text-link" type="button" onClick={() => setView("reset")} disabled={isSubmitting}>I have a reset code</button></>
            ) : (
              <button className="text-link" type="button" onClick={() => setView("login")} disabled={isSubmitting}>Back to sign in</button>
            )}
          </div>
          <p className="auth-legal">By continuing, you agree to our <a href="#terms">Terms</a> and <a href="#privacy">Privacy Policy</a>.</p>
        </div>
      </section>
    </div>
  );
}

export default function Home() {
  const [authView, setAuthView] = useState<AuthView | null>(null);

  return (
    <main>
      <header className="site-header page-wrap">
        <Brand />
        <nav className="main-nav" aria-label="Main navigation">
          <a href="#platform">Platform</a>
          <a href="#about">Why Hope</a>
          <a href="#modules">What&apos;s inside</a>
        </nav>
        <div className="header-actions">
          <button className="header-signin" onClick={() => setAuthView("login")}>Sign in</button>
          <button className="button button-small" onClick={() => setAuthView("register")}>Get started <Icon name="arrow" /></button>
        </div>
      </header>

      <section className="hero page-wrap" id="platform">
        <div className="hero-copy">
          <div className="hero-kicker"><span className="kicker-icon"><Icon name="leaf" /></span> THE SPACE BETWEEN THE MOVING PARTS</div>
          <h1>Good work<br />grows <span>together.</span></h1>
          <p className="hero-description">A little more clarity. A little less chasing. Hope brings your products, people, sales, and customers into one easy rhythm.</p>
          <div className="hero-actions">
            <button className="button button-primary" onClick={() => setAuthView("register")}>Find your flow <Icon name="arrow" /></button>
            <a className="watch-link" href="#modules"><span className="play-icon">↘</span> Take a look around</a>
          </div>
          <div className="hero-proof"><div className="proof-avatars"><i>A</i><i>M</i><i>J</i><i>+</i></div><span>Made for teams that care<br /><b>about how work feels.</b></span></div>
        </div>
        <DashboardPreview />
        <span className="hero-side-note">A LITTLE MORE IN SYNC <i>✳</i></span>
      </section>

      <section className="signal-strip">
        <div className="page-wrap signal-inner">
          <span>ONE HOME FOR YOUR EVERYDAY</span>
          <div className="signal-items"><span><i>✳</i> products</span><span><i>✳</i> people</span><span><i>✳</i> sales</span><span><i>✳</i> customers</span></div>
          <span className="signal-note">Four good things. One place.</span>
        </div>
      </section>

      <section className="modules-section page-wrap" id="modules">
        <div className="section-heading">
          <div><span className="eyebrow">THE GOOD STUFF, ALL TOGETHER</span><h2>One team. Four ways<br />to move <em>forward.</em></h2></div>
          <p>Less switching between tabs. More room to think, make, and take care of each other.</p>
        </div>
        <div className="module-grid">
          {modules.map((module) => (
            <article className={`module-card ${module.color}`} key={module.number}>
              <div className="module-card-top"><span className="module-icon"><Icon name={module.icon} /></span><span className="module-number">{module.number}</span></div>
              <h3>{module.title}</h3>
              <p>{module.description}</p>
              <a href={module.number === "01" ? "/products" : "#about"} aria-label={module.number === "01" ? "Open product management" : `Learn more about ${module.title}`}><Icon name="arrow" /></a>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="page-wrap about-inner">
          <div className="about-art" aria-hidden="true">
            <div className="about-sun" />
            <div className="about-ring ring-a" /><div className="about-ring ring-b" />
            <span className="about-word">better,<br /><em>together.</em></span>
            <span className="about-stamp">✳ &nbsp; KEEP GOOD WORK GROWING</span>
          </div>
          <div className="about-copy">
            <span className="eyebrow">BUILT AROUND PEOPLE, ALWAYS</span>
            <h2>More flow.<br />Less <em>friction.</em></h2>
            <p>Work is better when the important things aren&apos;t scattered. Hope gives everyone a shared picture of what&apos;s happening, what needs care, and what&apos;s next.</p>
            <div className="about-points"><span><i>01</i> Your whole team, in the loop</span><span><i>02</i> The details, where they belong</span><span><i>03</i> A little more time for good work</span></div>
            <button className="button button-dark" onClick={() => setAuthView("register")}>Meet your new workspace <Icon name="arrow" /></button>
          </div>
        </div>
      </section>

      <section className="closing-section page-wrap">
        <span className="closing-flower">✳</span>
        <span className="eyebrow">THERE'S A GOOD WAY FORWARD</span>
        <h2>Make room for<br /><em>what matters.</em></h2>
        <p>Bring your team together with Hope.</p>
        <button className="button button-primary" onClick={() => setAuthView("register")}>Get started with Hope <Icon name="arrow" /></button>
      </section>

      <footer className="site-footer page-wrap">
        <Brand />
        <span>© 2025 Hope, Inc. Made for the way teams really work.</span>
        <div><a href="#privacy">Privacy</a><a href="#terms">Terms</a><button onClick={() => setAuthView("login")}>Sign in <Icon name="arrow" /></button></div>
      </footer>

      {authView && <AuthDialog view={authView} setView={setAuthView} onClose={() => setAuthView(null)} />}
    </main>
  );
}
