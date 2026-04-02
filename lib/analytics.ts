import { getSupabaseAdmin } from "./supabase/admin";

const ISTANBUL_TZ = "Europe/Istanbul";

/** Günlük sayaç anahtarı — Türkiye takvimi (UTC gece kayması yok). */
function todayKey(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: ISTANBUL_TZ });
}

export async function trackPageView(): Promise<void> {
  const sb = getSupabaseAdmin();
  if (!sb) return;
  const d = todayKey();
  try {
    await sb.rpc("analytics_increment", { p_category: "pv_day", p_field: d, p_delta: 1 });
    await sb.rpc("analytics_increment", { p_category: "pv_total", p_field: "all", p_delta: 1 });
  } catch (e) {
    console.error("[analytics] pv", e);
  }
}

export async function trackSectorPick(sector: string): Promise<void> {
  const s = sector.trim();
  if (s.length < 2) return;
  const sb = getSupabaseAdmin();
  if (!sb) return;
  try {
    await sb.rpc("analytics_increment", { p_category: "sector_pick", p_field: s.slice(0, 240), p_delta: 1 });
  } catch (e) {
    console.error("[analytics] sector", e);
  }
}

export async function trackSearchQuery(query: string): Promise<void> {
  const q = query
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/\s+/g, " ")
    .slice(0, 120);
  if (q.length < 2) return;
  const sb = getSupabaseAdmin();
  if (!sb) return;
  try {
    await sb.rpc("analytics_increment", { p_category: "search_query", p_field: q, p_delta: 1 });
  } catch (e) {
    console.error("[analytics] search", e);
  }
}

export async function trackFormCtaClick(): Promise<void> {
  const sb = getSupabaseAdmin();
  if (!sb) return;
  const d = todayKey();
  try {
    await sb.rpc("analytics_increment", { p_category: "cta_form", p_field: d, p_delta: 1 });
  } catch (e) {
    console.error("[analytics] cta", e);
  }
}

export type AdminStats = {
  supabaseConfigured: boolean;
  dailyPv: { date: string; count: number }[];
  topSectors: { name: string; count: number }[];
  topSearches: { term: string; count: number }[];
  dailyCta: { date: string; count: number }[];
  totalPv: number;
};

/** En eski → bugün (İstanbul), YYYY-MM-DD — `todayKey` ile aynı takvim. */
function lastNDates(n: number): string[] {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ISTANBUL_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  let y = Number(parts.find((p) => p.type === "year")?.value);
  let m = Number(parts.find((p) => p.type === "month")?.value);
  let day = Number(parts.find((p) => p.type === "day")?.value);

  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    out.unshift(`${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
    const prev = new Date(Date.UTC(y, m - 1, day - 1));
    y = prev.getUTCFullYear();
    m = prev.getUTCMonth() + 1;
    day = prev.getUTCDate();
  }
  return out;
}

export async function getAdminStats(): Promise<AdminStats> {
  const sb = getSupabaseAdmin();
  if (!sb) {
    return {
      supabaseConfigured: false,
      dailyPv: [],
      topSectors: [],
      topSearches: [],
      dailyCta: [],
      totalPv: 0,
    };
  }

  const days = lastNDates(14);

  const { data: rows, error } = await sb.from("analytics_counters").select("category,field,value");
  if (error) {
    console.error("[analytics] stats", error.message);
    return {
      supabaseConfigured: true,
      dailyPv: days.map((date) => ({ date, count: 0 })),
      topSectors: [],
      topSearches: [],
      dailyCta: days.map((date) => ({ date, count: 0 })),
      totalPv: 0,
    };
  }

  const map = new Map<string, number>();
  for (const r of rows ?? []) {
    map.set(`${r.category}\0${r.field}`, Number(r.value ?? 0));
  }

  const get = (cat: string, field: string) => map.get(`${cat}\0${field}`) ?? 0;

  const dailyPv = days.map((date) => ({ date, count: get("pv_day", date) }));
  const dailyCta = days.map((date) => ({ date, count: get("cta_form", date) }));

  const topSectors = (rows ?? [])
    .filter((r) => r.category === "sector_pick")
    .map((r) => ({ name: r.field as string, count: Number(r.value) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const topSearches = (rows ?? [])
    .filter((r) => r.category === "search_query")
    .map((r) => ({ term: r.field as string, count: Number(r.value) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const totalPv = get("pv_total", "all");

  return {
    supabaseConfigured: true,
    dailyPv,
    topSectors,
    topSearches,
    dailyCta,
    totalPv,
  };
}
