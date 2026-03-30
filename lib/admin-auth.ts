import { SignJWT, jwtVerify } from "jose";

export const ADMIN_COOKIE = "turktudun_admin";

function getSecret(): Uint8Array {
  const s = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!s || s.length < 16) {
    throw new Error("ADMIN_SESSION_SECRET en az 16 karakter olmalıdır.");
  }
  return new TextEncoder().encode(s);
}

export async function signAdminToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const s = process.env.ADMIN_SESSION_SECRET?.trim();
    if (!s || s.length < 16) return false;
    await jwtVerify(token, new TextEncoder().encode(s));
    return true;
  } catch {
    return false;
  }
}

export function isAdminPasswordConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD?.length);
}
