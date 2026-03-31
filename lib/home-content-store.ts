import { mkdir, readFile, rename, unlink, writeFile } from "fs/promises";
import path from "path";
import { HOME_BLOG, HOME_NEWS, type HomeBlogItem, type HomeNewsItem } from "./home-content";
import { getSupabaseAdmin } from "./supabase/admin";

const ID_NEWS = "home_news";
const ID_BLOG = "home_blog";
const MAX_JSON = 120_000;

const HOME_CONTENT_FILE_PATH = path.join(process.cwd(), "data", "home-content.json");

export function isHomeContentFileStoreEnabled(): boolean {
  return process.env.HOME_CONTENT_FILE === "true";
}

export function canPersistHomeContent(): boolean {
  return getSupabaseAdmin() !== null || isHomeContentFileStoreEnabled();
}

function normalizeStoredHomeJson(raw: unknown): string | null {
  if (raw == null) return null;
  if (typeof raw === "string") {
    const t = raw.trim();
    return t.length > 0 ? t : null;
  }
  if (typeof raw === "number" || typeof raw === "boolean") {
    const s = String(raw).trim();
    return s.length > 0 ? s : null;
  }
  if (typeof raw === "object") {
    try {
      const s = JSON.stringify(raw);
      return s.length > 0 ? s : null;
    } catch {
      return null;
    }
  }
  return null;
}

function isValidId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{1,80}$/.test(id);
}

function isValidDate(d: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
  const t = Date.parse(d + "T12:00:00");
  return Number.isFinite(t);
}

export function validateNewsItems(raw: unknown): HomeNewsItem[] | null {
  if (!Array.isArray(raw) || raw.length > 100) return null;
  const out: HomeNewsItem[] = [];
  const seen = new Set<string>();
  for (const it of raw) {
    if (!it || typeof it !== "object") return null;
    const o = it as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id.trim() : "";
    const date = typeof o.date === "string" ? o.date.trim() : "";
    const title = typeof o.title === "string" ? o.title.trim() : "";
    const excerpt = typeof o.excerpt === "string" ? o.excerpt.trim() : "";
    if (!isValidId(id) || !isValidDate(date) || title.length < 1 || title.length > 300) return null;
    if (excerpt.length < 1 || excerpt.length > 4000) return null;
    if (seen.has(id)) return null;
    seen.add(id);
    out.push({ id, date, title, excerpt });
  }
  return out;
}

export function validateBlogItems(raw: unknown): HomeBlogItem[] | null {
  if (!Array.isArray(raw) || raw.length > 100) return null;
  const out: HomeBlogItem[] = [];
  const seen = new Set<string>();
  for (const it of raw) {
    if (!it || typeof it !== "object") return null;
    const o = it as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id.trim() : "";
    const date = typeof o.date === "string" ? o.date.trim() : "";
    const title = typeof o.title === "string" ? o.title.trim() : "";
    const excerpt = typeof o.excerpt === "string" ? o.excerpt.trim() : "";
    const rm = typeof o.readMinutes === "number" ? o.readMinutes : Number(o.readMinutes);
    if (!isValidId(id) || !isValidDate(date) || title.length < 1 || title.length > 300) return null;
    if (excerpt.length < 1 || excerpt.length > 8000) return null;
    if (!Number.isFinite(rm) || rm < 1 || rm > 240) return null;
    if (seen.has(id)) return null;
    seen.add(id);
    out.push({ id, date, title, excerpt, readMinutes: Math.round(rm) });
  }
  return out;
}

function parseStoredNews(raw: string): HomeNewsItem[] | null {
  try {
    const v = validateNewsItems(JSON.parse(raw));
    return v && v.length > 0 ? v : null;
  } catch {
    return null;
  }
}

function parseStoredBlog(raw: string): HomeBlogItem[] | null {
  try {
    const v = validateBlogItems(JSON.parse(raw));
    return v && v.length > 0 ? v : null;
  } catch {
    return null;
  }
}

type FileShape = {
  news?: unknown;
  blog?: unknown;
};

async function readRawFileStore(): Promise<FileShape | null> {
  try {
    const raw = await readFile(HOME_CONTENT_FILE_PATH, "utf8");
    const j = JSON.parse(raw) as unknown;
    if (!j || typeof j !== "object") return null;
    return j as FileShape;
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    if (err.code === "ENOENT") return null;
    return null;
  }
}

async function parseFileStore(): Promise<{
  news: HomeNewsItem[] | null;
  blog: HomeBlogItem[] | null;
}> {
  const raw = await readRawFileStore();
  if (!raw) return { news: null, blog: null };
  const newsV = raw.news !== undefined ? validateNewsItems(raw.news) : null;
  const blogV = raw.blog !== undefined ? validateBlogItems(raw.blog) : null;
  return {
    news: newsV && newsV.length > 0 ? newsV : null,
    blog: blogV && blogV.length > 0 ? blogV : null,
  };
}

async function atomicWriteHomeContentFile(body: string): Promise<void> {
  const dir = path.dirname(HOME_CONTENT_FILE_PATH);
  await mkdir(dir, { recursive: true });
  const tmp = `${HOME_CONTENT_FILE_PATH}.${process.pid}.tmp`;
  await writeFile(tmp, body, "utf8");
  await rename(tmp, HOME_CONTENT_FILE_PATH);
}

async function writeFileStoreMerge(partial: { news?: HomeNewsItem[]; blog?: HomeBlogItem[] }): Promise<void> {
  if (!isHomeContentFileStoreEnabled()) throw new Error("Dosya deposu kapalı");
  const existing = (await readRawFileStore()) ?? {};
  const next: FileShape = { ...existing };
  if (partial.news !== undefined) next.news = partial.news;
  if (partial.blog !== undefined) next.blog = partial.blog;
  await atomicWriteHomeContentFile(`${JSON.stringify(next, null, 2)}\n`);
}

async function clearFileSection(kind: "news" | "blog"): Promise<void> {
  if (!isHomeContentFileStoreEnabled()) throw new Error("Dosya deposu kapalı");
  const existing = await readRawFileStore();
  if (!existing) return;
  const next: FileShape = { ...existing };
  delete next[kind];
  const hasAny = next.news !== undefined || next.blog !== undefined;
  if (!hasAny) {
    await unlink(HOME_CONTENT_FILE_PATH).catch(() => {});
    return;
  }
  await atomicWriteHomeContentFile(`${JSON.stringify(next, null, 2)}\n`);
}

async function readHomeNewsFromSupabase(): Promise<HomeNewsItem[] | null> {
  const sb = getSupabaseAdmin();
  if (!sb) return null;
  const { data, error } = await sb.from("home_content").select("data").eq("id", ID_NEWS).maybeSingle();
  if (error || !data?.data) return null;
  const raw = normalizeStoredHomeJson(data.data);
  if (!raw) return validateNewsItems(data.data as unknown) ?? null;
  return parseStoredNews(raw);
}

async function readHomeBlogFromSupabase(): Promise<HomeBlogItem[] | null> {
  const sb = getSupabaseAdmin();
  if (!sb) return null;
  const { data, error } = await sb.from("home_content").select("data").eq("id", ID_BLOG).maybeSingle();
  if (error || !data?.data) return null;
  if (Array.isArray(data.data)) return validateBlogItems(data.data);
  const raw = normalizeStoredHomeJson(data.data);
  if (!raw) return null;
  return parseStoredBlog(raw);
}

export async function getResolvedHomeNews(): Promise<HomeNewsItem[]> {
  const sbNews = await readHomeNewsFromSupabase();
  if (sbNews) return sbNews;

  if (isHomeContentFileStoreEnabled()) {
    try {
      const f = await parseFileStore();
      if (f.news) return f.news;
    } catch (e) {
      console.error("[home-content] Dosya deposu haber okunamadı", e);
    }
  }
  return HOME_NEWS;
}

export async function getResolvedHomeBlog(): Promise<HomeBlogItem[]> {
  const sbBlog = await readHomeBlogFromSupabase();
  if (sbBlog) return sbBlog;

  if (isHomeContentFileStoreEnabled()) {
    try {
      const f = await parseFileStore();
      if (f.blog) return f.blog;
    } catch (e) {
      console.error("[home-content] Dosya deposu blog okunamadı", e);
    }
  }
  return HOME_BLOG;
}

export async function getHomeContentAdminPayload(): Promise<{
  news: HomeNewsItem[];
  blog: HomeBlogItem[];
  newsOverridden: boolean;
  blogOverridden: boolean;
}> {
  const sb = getSupabaseAdmin();
  let newsOverridden = false;
  let blogOverridden = false;
  if (sb) {
    try {
      const [nR, bR] = await Promise.all([
        sb.from("home_content").select("id").eq("id", ID_NEWS).maybeSingle(),
        sb.from("home_content").select("id").eq("id", ID_BLOG).maybeSingle(),
      ]);
      newsOverridden = !!nR.data;
      blogOverridden = !!bR.data;
    } catch (e) {
      console.error("[home-content] Supabase admin payload", e);
    }
  } else if (isHomeContentFileStoreEnabled()) {
    const f = await parseFileStore();
    newsOverridden = f.news !== null;
    blogOverridden = f.blog !== null;
  }

  const [news, blog] = await Promise.all([getResolvedHomeNews(), getResolvedHomeBlog()]);
  return { news, blog, newsOverridden, blogOverridden };
}

export async function persistHomeNews(items: HomeNewsItem[]): Promise<void> {
  const payload = JSON.stringify(items);
  if (payload.length > MAX_JSON) throw new Error("İçerik çok büyük");

  const sb = getSupabaseAdmin();
  if (sb) {
    const { error } = await sb.from("home_content").upsert(
      { id: ID_NEWS, data: items, updated_at: new Date().toISOString() },
      { onConflict: "id" },
    );
    if (error) throw new Error(error.message);
    return;
  }
  if (isHomeContentFileStoreEnabled()) {
    await writeFileStoreMerge({ news: items });
    return;
  }
  throw new Error("İçerik kaydı için Supabase veya HOME_CONTENT_FILE=true gerekli");
}

export async function persistHomeBlog(items: HomeBlogItem[]): Promise<void> {
  const payload = JSON.stringify(items);
  if (payload.length > MAX_JSON) throw new Error("İçerik çok büyük");

  const sb = getSupabaseAdmin();
  if (sb) {
    const { error } = await sb.from("home_content").upsert(
      { id: ID_BLOG, data: items, updated_at: new Date().toISOString() },
      { onConflict: "id" },
    );
    if (error) throw new Error(error.message);
    return;
  }
  if (isHomeContentFileStoreEnabled()) {
    await writeFileStoreMerge({ blog: items });
    return;
  }
  throw new Error("İçerik kaydı için Supabase veya HOME_CONTENT_FILE=true gerekli");
}

export async function clearPersistedHomeNews(): Promise<void> {
  const sb = getSupabaseAdmin();
  if (sb) {
    await sb.from("home_content").delete().eq("id", ID_NEWS);
    return;
  }
  if (isHomeContentFileStoreEnabled()) {
    await clearFileSection("news");
    return;
  }
  throw new Error("İçerik kaydı için Supabase veya HOME_CONTENT_FILE=true gerekli");
}

export async function clearPersistedHomeBlog(): Promise<void> {
  const sb = getSupabaseAdmin();
  if (sb) {
    await sb.from("home_content").delete().eq("id", ID_BLOG);
    return;
  }
  if (isHomeContentFileStoreEnabled()) {
    await clearFileSection("blog");
    return;
  }
  throw new Error("İçerik kaydı için Supabase veya HOME_CONTENT_FILE=true gerekli");
}
