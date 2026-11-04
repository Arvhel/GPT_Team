import { redirect } from "next/navigation";

type ForgotPasswordPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const params = await searchParams;
  const query = new URLSearchParams({ auth: "forgot" });

  if (params.error) query.set("error", params.error);
  if (params.message) query.set("message", params.message);

  redirect(`/?${query.toString()}`);
}
