import seedRaw from "@/data/seed-members.json";
import { filterPublicMembers, getApprovalMap } from "./approvals";
import { memberDedupeKey, type Member } from "./member";
import { sheetCsvToMembers } from "./parseSheet";

const REVALIDATE_SECONDS = Number(process.env.CACHE_REVALIDATE_SECONDS ?? 120);

function getSeedMembers(): Member[] {
  return (seedRaw as Member[]).map((m) => ({ ...m, source: "seed" as const }));
}

function sheetExportUrl(): string | null {
  const id = process.env.GOOGLE_SHEET_ID?.trim();
  if (!id) return null;
  const gid = (process.env.GOOGLE_SHEET_GID ?? "0").trim();
  return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;
}

async function fetchSheetMembers(): Promise<Member[]> {
  const url = sheetExportUrl();
  if (!url) return [];

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
