import data from "@/data/turkiye-il-ilce.json";

export type IlIlceMap = Record<string, string[]>;

export const IL_ILCE = data as IlIlceMap;

export const ILLER: string[] = Object.keys(IL_ILCE).sort((a, b) => a.localeCompare(b, "tr"));

export function ilcelerFor(il: string): string[] {
  const list = IL_ILCE[il];
  return list ? [...list] : [];
}
