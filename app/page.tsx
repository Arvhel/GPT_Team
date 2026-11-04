import type { ReactNode } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

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
] as const;

function Brand() {
  return (
    <Link className="brand" href="/" aria-label="Hope, Inc. home">
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
  );
}

function Icon({ name }: { name: (typeof modules)[number]["icon"] | "arrow" | "leaf" }) {
  const paths: Record<typeof name, ReactNode> = {
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
      {paths[name]}
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
            <span className="mini-mark">
              <Icon name="leaf" />
            </span>
            <span>
              Good morning, Alex <span className="wave">✳</span>
            </span>
          </div>
          <div className="avatar-stack" aria-hidden="true">
            <i>A</i>
            <i>M</i>
            <i>J</i>
            <b>+2</b>
          </div>
        </div>
        <div className="preview-heading">
          <div>
            <small>MONDAY, OCTOBER 21</small>
            <h2>Your week, in view.</h2>
          </div>
          <span className="today-pill">
            <span /> All systems happy
          </span>
        </div>
        <div className="metric-grid">
          <div className="metric-card">
            <span>Open opportunities</span>
            <strong>128</strong>
            <small className="positive">
              ↗ 12.8% <span>this month</span>
            </small>
            <div className="sparkline" aria-hidden="true">
              <i /><i /><i /><i /><i /><i /><i /><i /><i />
            </div>
          </div>
          <div className="metric-card metric-people">
            <span>Team pulse</span>
            <strong>
              94<span className="metric-percent">%</span>
            </strong>
            <small>Feeling good this week</small>
            <div className="pulse-bar">
              <i />
            </div>
          </div>
        </div>
        <div className="preview-bottom">
          <div className="task-heading">
            <span>Moving along</span>
            <span>
              View all <Icon name="arrow" />
            </span>
          </div>
          <div className="task-row">
            <span className="task-check">✓</span>
            <span>Q4 product launch</span>
            <small>Product</small>
            <b>On track</b>
          </div>
          <div className="task-row">
            <span className="task-check task-empty" />
            <span>Northstar renewal</span>
            <small>Customer</small>
            <b className="task-review">In review</b>
          </div>
        </div>
      </div>
      <div className="float-note note-left">
        <span className="note-icon">
          <Icon name="spark" />
        </span>
        <span>
          <b>One less follow-up</b>
          <small>Your team is up to date</small>
        </span>
        <i>✓</i>
      </div>
      <div className="float-note note-right">
        <span className="note-avatar">S</span>
        <span>
          <b>A little high five</b>
          <small>Maya closed a new deal</small>
        </span>
        <span className="note-heart">♥</span>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error && error.name !== "AuthSessionMissingError") {
    throw error;
  }

  const workspaceHref = data.user ? "/dashboard" : "/login";

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
          <Link className="header-signin" href={workspaceHref}>
            {data.user ? "Your workspace" : "Sign in"}
          </Link>
          <Link className="button button-small" href={workspaceHref}>
            {data.user ? "Open workspace" : "Get started"} <Icon name="arrow" />
          </Link>
        </div>
      </header>

      <section className="hero page-wrap" id="platform">
        <div className="hero-copy">
          <div className="hero-kicker">
            <span className="kicker-icon">
              <Icon name="leaf" />
            </span>
            THE SPACE BETWEEN THE MOVING PARTS
          </div>
          <h1>
            Good work
            <br />
            grows <span>together.</span>
          </h1>
          <p className="hero-description">
            A little more clarity. A little less chasing. Hope brings your products, people,
            sales, and customers into one easy rhythm.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href={workspaceHref}>
              Find your flow <Icon name="arrow" />
            </Link>
            <a className="watch-link" href="#modules">
              <span className="play-icon">↘</span> Take a look around
            </a>
          </div>
          <div className="hero-proof">
            <div className="proof-avatars">
              <i>A</i>
              <i>M</i>
              <i>J</i>
              <i>+</i>
            </div>
            <span>
              Made for teams that care
              <br />
              <b>about how work feels.</b>
            </span>
          </div>
        </div>
        <DashboardPreview />
        <span className="hero-side-note">
          A LITTLE MORE IN SYNC <i>✳</i>
        </span>
      </section>

      <section className="signal-strip">
        <div className="page-wrap signal-inner">
          <span>ONE HOME FOR YOUR EVERYDAY</span>
          <div className="signal-items">
            <span><i>✳</i> products</span>
            <span><i>✳</i> people</span>
            <span><i>✳</i> sales</span>
            <span><i>✳</i> customers</span>
          </div>
          <span className="signal-note">Four good things. One place.</span>
        </div>
      </section>

      <section className="modules-section page-wrap" id="modules">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THE GOOD STUFF, ALL TOGETHER</span>
            <h2>
              One team. Four ways
              <br />
              to move <em>forward.</em>
            </h2>
          </div>
          <p>Less switching between tabs. More room to think, make, and take care of each other.</p>
        </div>
        <div className="module-grid">
          {modules.map((module) => (
            <article className={`module-card ${module.color}`} key={module.number}>
              <div className="module-card-top">
                <span className="module-icon"><Icon name={module.icon} /></span>
                <span className="module-number">{module.number}</span>
              </div>
              <h3>{module.title}</h3>
              <p>{module.description}</p>
              <a href="#about" aria-label={`Learn more about ${module.title}`}>
                <Icon name="arrow" />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="page-wrap about-inner">
          <div className="about-art" aria-hidden="true">
            <div className="about-sun" />
            <div className="about-ring ring-a" />
            <div className="about-ring ring-b" />
            <span className="about-word">
              better,
              <br />
              <em>together.</em>
            </span>
            <span className="about-stamp">✳ &nbsp; KEEP GOOD WORK GROWING</span>
          </div>
          <div className="about-copy">
            <span className="eyebrow">BUILT AROUND PEOPLE, ALWAYS</span>
            <h2>
              More flow.
              <br />
              Less <em>friction.</em>
            </h2>
            <p>
              Work is better when the important things aren&apos;t scattered. Hope gives everyone
              a shared picture of what&apos;s happening, what needs care, and what&apos;s next.
            </p>
            <div className="about-points">
              <span><i>01</i> Your whole team, in the loop</span>
              <span><i>02</i> The details, where they belong</span>
              <span><i>03</i> A little more time for good work</span>
            </div>
            <Link className="button button-dark" href={workspaceHref}>
              Meet your new workspace <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>

      <section className="closing-section page-wrap">
        <span className="closing-flower">✳</span>
        <span className="eyebrow">THERE&apos;S A GOOD WAY FORWARD</span>
        <h2>
          Make room for
          <br />
          <em>what matters.</em>
        </h2>
        <p>Bring your team together with Hope.</p>
        <Link className="button button-primary" href={workspaceHref}>
          Get started with Hope <Icon name="arrow" />
        </Link>
      </section>

      <footer className="site-footer page-wrap">
        <Brand />
        <span>© 2025 Hope, Inc. Made for the way teams really work.</span>
        <div>
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          <Link href={workspaceHref}>
            {data.user ? "Workspace" : "Sign in"} <Icon name="arrow" />
          </Link>
        </div>
      </footer>
    </main>
  );
}
