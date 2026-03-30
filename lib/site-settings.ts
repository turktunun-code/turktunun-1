import { getRedis } from "./redis";

const LOGO_URL_KEY = "settings:logoUrl";

/**
 * Redis’te kayıtlı admin logosu (panelden). Canlı sayfada kullanımı varsayılan olarak kapalıdır;
 * aksi halde dış URL sıkça parşömen arka planlı görüntüyü bastırır. Açmak için:
 * USE_STORED_SITE_LOGO=true
 */
export async function getSiteLogoUrl(): Promise<string | null> {
  const r = getRedis();
  if (!r) return null;
  const v = await r.get<string>(LOGO_URL_KEY);
  const u = v?.trim();
  return u && u.length > 0 ? u : null;
}

/** Ana sayfa logosu: varsayılan her zaman public/logo.png */
export async function getCatalogLogoSrc(): Promise<string> {
  const allowStored = process.env.USE_STORED_SITE_LOGO === "true";
  if (!allowStored) {
    return "/logo.png";
  }
  const custom = await getSiteLogoUrl();
  return custom ?? "/logo.png";
}

export async function setSiteLogoUrl(url: string | null): Promise<void> {
  const r = getRedis();
  if (!r) throw new Error("Redis yapılandırılmadı");

  if (!url?.trim()) {
    await r.del(LOGO_URL_KEY);
  } else {
    await r.set(LOGO_URL_KEY, url.trim().slice(0, 2048));
  }
}
