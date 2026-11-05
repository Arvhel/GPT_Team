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
      module="Human resources"
      href="/departments"
      error={error}
      reset={reset}
    />
  );
}
