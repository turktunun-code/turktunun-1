import type { Member } from "./member";

const STOP = new Set([
  "ve",
  "ile",
  "için",
  "icin",
  "bir",
  "bu",
  "şu",
  "veya",
  "da",
  "de",
  "mi",
  "mı",
  "mu",
  "mü",
  "gibi",
  "kadar",
  "olan",
  "the",
  "and",
  "or",
]);

export function tokenizeDemand(text: string): string[] {
  const raw = text
    .trim()
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/\p{M}/gu, "");

  return raw
    .split(/[^a-z0-9ğüşöçı]+/i)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2 && !STOP.has(s));
}

function fieldScore(haystack: string, token: string, weight: number): number {
  const hay = haystack.toLocaleLowerCase("tr-TR");
  const tk = token.toLocaleLowerCase("tr-TR");
  if (!hay || !tk) return 0;
  if (hay.includes(tk)) return weight;
  const words = hay.split(/\s+/).filter(Boolean);
  for (const w of words) {
    if (w.startsWith(tk) || tk.length >= 4 && w.includes(tk)) {
      return weight * 0.85;
    }
  }
  return 0;
}

export function scoreMemberForDemand(member: Member, tokens: string[]): number {
  if (tokens.length === 0) return 0;

  let score = 0;
  for (const t of tokens) {
    score += fieldScore(member.materials, t, 5);
    score += fieldScore(member.sector, t, 4);
    score += fieldScore(member.brand, t, 3);
    score += fieldScore(member.location, t, 2);
    score += fieldScore(member.fullName, t, 1);
    if (member.digitalContact) {
      score += fieldScore(member.digitalContact, t, 1);
    }
  }

  return Math.round(score * 10) / 10;
}

export type RankedMember = { member: Member; score: number };

export function recommendByDemand(
  members: Member[],
  demand: string,
  limit = 8,
): RankedMember[] {
  const tokens = tokenizeDemand(demand);
  if (tokens.length === 0) return [];

  const ranked: RankedMember[] = members
    .map((member) => ({ member, score: scoreMemberForDemand(member, tokens) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.member.fullName.localeCompare(b.member.fullName, "tr");
    });

  return ranked.slice(0, limit);
}
