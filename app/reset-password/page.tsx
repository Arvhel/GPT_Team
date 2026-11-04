import { redirect } from "next/navigation";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;
  const query = new URLSearchParams({ auth: "reset" });

  if (params.error) query.set("error", params.error);

  redirect(`/?${query.toString()}`);
}
