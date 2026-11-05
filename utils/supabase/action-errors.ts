export function throwSupabaseError(
  context: string,
  error: unknown,
  message: string,
): never {
  console.error(`[${context}] Supabase request failed.`, error);
  throw new Error(message);
}
