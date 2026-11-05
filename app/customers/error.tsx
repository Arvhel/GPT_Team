"use client";

import { ModuleError } from "@/app/components/module-states";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ModuleError
      module="Customers"
      href="/customers"
      error={error}
      reset={reset}
    />
  );
}
