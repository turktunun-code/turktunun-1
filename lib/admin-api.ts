import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyAdminToken } from "./admin-auth";

export async function getAdminSession(): Promise<boolean> {
  const jar = await cookies();
  const t = jar.get(ADMIN_COOKIE)?.value;
  if (!t) return false;
  return verifyAdminToken(t);
}
