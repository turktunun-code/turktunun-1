import seedRaw from "@/data/seed-members.json";
import { filterPublicMembers, getApprovalMap } from "./approvals";
import { fetchSheetAsCsvViaApi } from "./google-sheets-api";
import {
  effectiveSheetGid,
  effectiveSheetId,
  getStoredGoogleSheetRows,
  resolveServiceAccountCredentials,
} from "./google-sheet-settings";
import { memberDedupeKey, type Member } from "./member";
import { sheetCsvToMembers } from "./parseSheet";

const REVALIDATE_SECONDS = Number(process.env.CACHE_REVALIDATE_SECONDS ?? 120);

function getSeedMembers(): Member[] {
  return (seedRaw as Member[]).map((m) => ({ ...m, source: "seed" as const }));
}

async function fetchPublicCsvExport(sheetId: string, gid: string): Promise<Member[]> {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${encodeURIComponent(gid)}`;
  try {
    const res = await fetch(url, {
      next: { revalidate: Number.isFinite(REVALIDATE_SECONDS) ? REVALIDATE_SECONDS : 120 },
      headers: { Accept: "text/csv" },
    });

    if (!res.ok) {
      console.error("[members] sheet fetch failed", res.status, res.statusText);
      return [];
    }

    const text = await res.text();
    return sheetCsvToMembers(text);
  } catch (e) {
    console.error("[members] sheet fetch error", e);
    return [];
  }
}

async function fetchSheetMembers(): Promise<Member[]> {
  const stored = await getStoredGoogleSheetRows();
  const sheetId = effectiveSheetId(stored.sheetId);
  const gid = effectiveSheetGid(stored.gid);
  if (!sheetId) return [];

  const creds = await resolveServiceAccountCredentials();
  if (creds) {
    try {
      const csv = await fetchSheetAsCsvViaApi(sheetId, gid, creds);
      if (csv) return sheetCsvToMembers(csv);
    } catch (e) {
      console.error("[members] Sheets API error", e);
    }
    console.error("[members] Sheets API başarısız; herkese açık CSV deneniyor");
  }

  return fetchPublicCsvExport(sheetId, gid);
}

function mergeSheetAndSeed(sheet: Member[], seed: Member[]): Member[] {
  if (sheet.length === 0) return seed;

  const seen = new Set(sheet.map(memberDedupeKey));
  const extras = seed.filter((s) => !seen.has(memberDedupeKey(s)));

  return [...sheet, ...extras];
}

export async function getMergedMembers(): Promise<Member[]> {
  const seed = getSeedMembers();
  const sheet = await fetchSheetMembers();
  return mergeSheetAndSeed(sheet, seed);
}

/** Genel katalog: onay durumuna göre filtrelenir (pending/rejected gizlenir). */
export async function getMembers(): Promise<Member[]> {
  const merged = await getMergedMembers();
  const map = await getApprovalMap();
  return filterPublicMembers(merged, map);
}
