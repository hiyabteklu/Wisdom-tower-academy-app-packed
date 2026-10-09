import { redirect } from "next/navigation";

export default async function SigninRedirectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = typeof params?.next === "string" ? params.next : undefined;
  if (next) {
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }
  redirect("/login");
}
