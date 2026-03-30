import { getRedis, isRedisConfigured } from "./redis";
import { parseServiceAccountJson, type ServiceAccountCredentials } from "./google-service-account";

const KEY_SHEET_ID = "settings:googleSheetId";
const KEY_SHEET_GID = "settings:googleSheetGid";
/** JSON string — yalnızca yönetim panelinden veya güvenli ortamda kullanın. */
const KEY_SERVICE_ACCOUNT = "settings:googleServiceAccountJson";

export type GoogleSheetAdminView = {
  redis: boolean;
  sheetIdStored: string | null;
  gidStored: string | null;
  sheetIdEffective: string | null;
  gidEffective: string;
  hasServiceAccountInRedis: boolean;
  serviceAccountEmail: string | null;
  hasServiceAccountInEnv: boolean;
  serviceAccountEnvEmail: string | null;
  fetchMode: "api" | "public_csv" | "none";
};

function serviceAccountFromEnv(): ServiceAccountCredentials | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return null;
  return parseServiceAccountJson(raw);
}

export async function getStoredGoogleSheetRows(): Promise<{
  sheetId: string | null;
  gid: string | null;
  serviceAccountJson: string | null;
}> {
  const r = getRedis();
  if (!r) return { sheetId: null, gid: null, serviceAccountJson: null };

  const [sheetId, gid, sa] = await Promise.all([
    r.get<string>(KEY_SHEET_ID),
    r.get<string>(KEY_SHEET_GID),
    r.get<string>(KEY_SERVICE_ACCOUNT),
  ]);

  return {
    sheetId: sheetId?.trim() || null,
    gid: gid?.trim() || null,
    serviceAccountJson: sa?.trim() || null,
  };
}

export function effectiveSheetId(storedId: string | null): string | null {
  const s = storedId?.trim() || process.env.GOOGLE_SHEET_ID?.trim();
  return s || null;
}

export function effectiveSheetGid(storedGid: string | null): string {
  const g = storedGid?.trim() || process.env.GOOGLE_SHEET_GID?.trim() || "0";
  return g || "0";
}

/** Üye listesi çekilirken: önce Redis’teki, sonra ortam değişkenindeki servis hesabı. */
export async function resolveServiceAccountCredentials(): Promise<ServiceAccountCredentials | null> {
  const stored = await getStoredGoogleSheetRows();
  if (stored.serviceAccountJson) {
    const c = parseServiceAccountJson(stored.serviceAccountJson);
    if (c) return c;
  }
  return serviceAccountFromEnv();
}

export async function getGoogleSheetAdminView(): Promise<GoogleSheetAdminView> {
  const stored = await getStoredGoogleSheetRows();
  const envSa = serviceAccountFromEnv();
  const redis = isRedisConfigured();
  const sheetIdEffective = effectiveSheetId(stored.sheetId);
  const gidEffective = effectiveSheetGid(stored.gid);
  const redisParsed = stored.serviceAccountJson ? parseServiceAccountJson(stored.serviceAccountJson) : null;

  const hasApi =
    sheetIdEffective &&
    (redisParsed !== null || envSa !== null);

  return {
    redis,
    sheetIdStored: stored.sheetId,
    gidStored: stored.gid,
    sheetIdEffective,
    gidEffective,
    hasServiceAccountInRedis: redisParsed !== null,
    serviceAccountEmail: redisParsed?.client_email ?? null,
    hasServiceAccountInEnv: envSa !== null,
    serviceAccountEnvEmail: envSa?.client_email ?? null,
    fetchMode: !sheetIdEffective ? "none" : hasApi ? "api" : "public_csv",
  };
}

export async function setGoogleSheetSettings(input: {
  sheetId: string;
  gid: string;
  /** undefined = değiştirme; null veya \"\" = sil */
  serviceAccountJson?: string | null;
}): Promise<void> {
  const r = getRedis();
  if (!r) throw new Error("Redis yapılandırılmadı");

  const id = input.sheetId.trim();
  if (!id) {
    await r.del(KEY_SHEET_ID);
    await r.del(KEY_SHEET_GID);
  } else {
    await r.set(KEY_SHEET_ID, id.slice(0, 128));
    await r.set(KEY_SHEET_GID, (input.gid.trim() || "0").slice(0, 32));
  }

  if (input.serviceAccountJson === undefined) {
    return;
  }

  const raw = input.serviceAccountJson?.trim();
  if (!raw) {
    await r.del(KEY_SERVICE_ACCOUNT);
    return;
  }

  const parsed = parseServiceAccountJson(raw);
  if (!parsed) {
    throw new Error("Geçersiz servis hesabı JSON");
  }

  await r.set(KEY_SERVICE_ACCOUNT, raw.slice(0, 12000));
}
