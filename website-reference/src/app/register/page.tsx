import { redirect } from "next/navigation";

export default async function RegisterRedirectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = typeof params?.next === "string" ? params.next : undefined;
  if (next) {
    redirect(`/signup?next=${encodeURIComponent(next)}`);
  }
  redirect("/signup");
}
