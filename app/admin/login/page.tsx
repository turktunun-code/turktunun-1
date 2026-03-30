import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { getAdminSession } from "@/lib/admin-api";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ misconfigured?: string }>;
}) {
  if (await getAdminSession()) {
    redirect("/admin");
  }

  const sp = await searchParams;
  return <AdminLoginForm misconfigured={sp.misconfigured === "1"} />;
}
