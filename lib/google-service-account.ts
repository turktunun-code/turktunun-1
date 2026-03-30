export type ServiceAccountCredentials = {
  client_email: string;
  private_key: string;
};

export function parseServiceAccountJson(raw: string): ServiceAccountCredentials | null {
  try {
    const o = JSON.parse(raw) as Record<string, unknown>;
    const email = typeof o.client_email === "string" ? o.client_email.trim() : "";
    let key = typeof o.private_key === "string" ? o.private_key.trim() : "";
    key = key.replace(/\\n/g, "\n");
    if (!email || !key.includes("PRIVATE KEY")) return null;
    return { client_email: email, private_key: key };
  } catch {
    return null;
  }
}
