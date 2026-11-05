"use client";

import Link from "next/link";
import { useEffect } from "react";

export function ModuleLoading({ module }: { module: string }) {
  return (
    <main className="hrm-page module-state" aria-busy="true">
      <p className="eyebrow">{module}</p>
      <h1>Loading {module.toLowerCase()}…</h1>
      <p className="intro">Please wait while your workspace is prepared.</p>
    </main>
  );
}

export function ModuleError({
  module,
  href,
  error,
  reset,
}: {
  module: string;
  href: string;
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(`[${module}] The module failed to load.`, error);
  }, [error, module]);

  return (
    <main className="hrm-page module-state">
      <p className="eyebrow">{module}</p>
      <h1>This section couldn’t load.</h1>
      <p className="intro" role="alert">
        Your data is safe. Try again, or return to the module overview.
      </p>
      <div className="module-state-actions">
        <button type="button" onClick={reset}>Try again</button>
        <Link href={href}>
          Back to {module.toLowerCase()}
        </Link>
      </div>
    </main>
  );
}
