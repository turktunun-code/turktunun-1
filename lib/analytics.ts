import { getRedis } from "./redis";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function trackPageView(): Promise<void> {
  const r = getRedis();
  if (!r) return;
  const d = todayKey();
  await r.incr(`pv:${d}`);
  await r.incr("pv:total");
}

export async function trackSectorPick(sector: string): Promise<void> {
  const s = sector.trim();
  if (s.length < 2) return;
  const r = getRedis();
  if (!r) return;
  const field = s.slice(0, 240);
  await r.hincrby("stats:sector_pick", field, 1);
}

export async function trackSearchQuery(query: string): Promise<void> {
  const q = query
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/\s+/g, " ")
    .slice(0, 120);
  if (q.length < 2) return;
  const r = getRedis();
  if (!r) return;
  await r.hincrby("stats:search_query", q, 1);
}

export async function trackFormCtaClick(): Promise<void> {
  const r = getRedis();
  if (!r) return;
  const d = todayKey();
  await r.incr(`cta_form:${d}`);
}

export type AdminStats = {
  redisConfigured: boolean;
  dailyPv: { date: string; count: number }[];
  topSectors: { name: string; count: number }[];
  topSearches: { term: string; count: number }[];
  dailyCta: { date: string; count: number }[];
  totalPv: number;
};

function lastNDates(n: number): string[] {
  return [...Array(n)]
    .map((_, i) => {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - (n - 1 - i));
      return d.toISOString().slice(0, 10);
    });
}

export async function getAdminStats(): Promise<AdminStats> {
  const r = getRedis();
  if (!r) {
    return {
      redisConfigured: false,
      dailyPv: [],
      topSectors: [],
      topSearches: [],
      dailyCta: [],
      totalPv: 0,
    };
  }

  const days = lastNDates(14);

  const dailyPv = await Promise.all(
    days.map(async (date) => {
      const v = await r.get(`pv:${date}`);
      return { date, count: Number(v ?? 0) };
    }),
  );

  const dailyCta = await Promise.all(
    days.map(async (date) => {
      const v = await r.get(`cta_form:${date}`);
      return { date, count: Number(v ?? 0) };
    }),
  );

  const sectorEntries = await r.hgetall("stats:sector_pick");
  const topSectors = Object.entries(sectorEntries ?? {})
    .map(([name, count]) => ({ name, count: Number(count) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const searchEntries = await r.hgetall("stats:search_query");
  const topSearches = Object.entries(searchEntries ?? {})
    .map(([term, count]) => ({ term, count: Number(count) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const totalPv = Number((await r.get("pv:total")) ?? 0);

  return {
    redisConfigured: true,
    dailyPv,
    topSectors,
    topSearches,
    dailyCta,
    totalPv,
  };
}
