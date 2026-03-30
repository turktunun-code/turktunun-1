import { SignJWT, importPKCS8 } from "jose";
import type { ServiceAccountCredentials } from "./google-service-account";

async function getAccessToken(creds: ServiceAccountCredentials): Promise<string | null> {
  let key;
  try {
    key = await importPKCS8(creds.private_key, "RS256");
  } catch {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  const jwt = await new SignJWT({
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
  })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(creds.client_email)
    .setSubject(creds.client_email)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(key);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) return null;
  const data = (await res.json()) as { access_token?: string };
  return data.access_token ?? null;
}

async function sheetTitleForGid(
  spreadsheetId: string,
  gid: string,
  accessToken: string,
): Promise<string | null> {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets(properties(sheetId,title))`,
    { headers: { Authorization: `Bearer ${accessToken}` }, next: { revalidate: 0 } },
  );
  if (!res.ok) return null;

  const data = (await res.json()) as {
    sheets?: { properties: { sheetId: number; title: string } }[];
  };
  const sheets = data.sheets ?? [];
  if (sheets.length === 0) return null;

  const gidNum = Number(gid);
  if (Number.isFinite(gidNum)) {
    const match = sheets.find((s) => s.properties.sheetId === gidNum);
    if (match) return match.properties.title;
  }
  return sheets[0].properties.title;
}

function gridToCsv(rows: string[][]): string {
  return rows
    .map((row) =>
      row.map((cell) => {
        const s = cell == null ? "" : String(cell);
        if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
        return s;
      }).join(","),
    )
    .join("\n");
}

/**
 * Google Sheets API v4 ile tabloyu okur; mevcut CSV ayrıştırıcı ile uyum için virgül ayraçlı metin üretir.
 */
export async function fetchSheetAsCsvViaApi(
  spreadsheetId: string,
  gid: string,
  creds: ServiceAccountCredentials,
): Promise<string | null> {
  const token = await getAccessToken(creds);
  if (!token) return null;

  const title = await sheetTitleForGid(spreadsheetId, gid, token);
  if (!title) return null;

  const safeTitle = title.replace(/'/g, "''");
  const range = `'${safeTitle}'!A:ZZ`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 0 },
  });
  if (!res.ok) return null;

  const data = (await res.json()) as { values?: string[][] };
  const rows = data.values ?? [];
  return gridToCsv(rows);
}
