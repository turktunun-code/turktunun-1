import { mkdir, readFile, rename, unlink, writeFile } from "fs/promises";
import path from "path";
import { HOME_BLOG, HOME_NEWS, type HomeBlogItem, type HomeNewsItem } from "./home-content";
import { getRedis } from "./redis";

const KEY_NEWS = "content:homeNews";
const KEY_BLOG = "content:homeBlog";
const MAX_JSON = 120_000;

const HOME_CONTENT_FILE_PATH = path.join(process.cwd(), "data", "home-content.json");

export function isHomeContentFileStoreEnabled(): boolean {
  return process.env.HOME_CONTENT_FILE === "true";
}

export function canPersistHomeContent(): boolean {
  return getRedis() !== null || isHomeContentFileStoreEnabled();
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

export async function getResolvedHomeNews(): Promise<HomeNewsItem[]> {
  const r = getRedis();
  if (r) {
    const raw = await r.get<string>(KEY_NEWS);
    if (!raw?.trim()) return HOME_NEWS;
    const p = parseStoredNews(raw);
    return p ?? HOME_NEWS;
  }
  if (isHomeContentFileStoreEnabled()) {
    const f = await parseFileStore();
    if (f.news) return f.news;
  }
  return HOME_NEWS;
}

export async function getResolvedHomeBlog(): Promise<HomeBlogItem[]> {
  const r = getRedis();
  if (r) {
    const raw = await r.get<string>(KEY_BLOG);
    if (!raw?.trim()) return HOME_BLOG;
    const p = parseStoredBlog(raw);
    return p ?? HOME_BLOG;
  }
  if (isHomeContentFileStoreEnabled()) {
    const f = await parseFileStore();
    if (f.blog) return f.blog;
  }
  return HOME_BLOG;
}

export async function getHomeContentAdminPayload(): Promise<{
  news: HomeNewsItem[];
  blog: HomeBlogItem[];
  newsOverridden: boolean;
  blogOverridden: boolean;
}> {
  const r = getRedis();
  let newsOverridden = false;
  let blogOverridden = false;
  if (r) {
    const [ns, bs] = await Promise.all([r.get<string>(KEY_NEWS), r.get<string>(KEY_BLOG)]);
    newsOverridden = !!(ns?.trim() && parseStoredNews(ns));
    blogOverridden = !!(bs?.trim() && parseStoredBlog(bs));
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
  const redis = getRedis();
  if (redis) {
    await redis.set(KEY_NEWS, payload);
    return;
  }
  if (isHomeContentFileStoreEnabled()) {
    await writeFileStoreMerge({ news: items });
    return;
  }
  throw new Error("İçerik kaydı için Redis veya HOME_CONTENT_FILE=true gerekli");
}

export async function persistHomeBlog(items: HomeBlogItem[]): Promise<void> {
  const payload = JSON.stringify(items);
  if (payload.length > MAX_JSON) throw new Error("İçerik çok büyük");
  const redis = getRedis();
  if (redis) {
    await redis.set(KEY_BLOG, payload);
    return;
  }
  if (isHomeContentFileStoreEnabled()) {
    await writeFileStoreMerge({ blog: items });
    return;
  }
  throw new Error("İçerik kaydı için Redis veya HOME_CONTENT_FILE=true gerekli");
}

export async function clearPersistedHomeNews(): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.del(KEY_NEWS);
    return;
  }
  if (isHomeContentFileStoreEnabled()) {
    await clearFileSection("news");
    return;
  }
  throw new Error("İçerik kaydı için Redis veya HOME_CONTENT_FILE=true gerekli");
}

export async function clearPersistedHomeBlog(): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.del(KEY_BLOG);
    return;
  }
  if (isHomeContentFileStoreEnabled()) {
    await clearFileSection("blog");
    return;
  }
  throw new Error("İçerik kaydı için Redis veya HOME_CONTENT_FILE=true gerekli");
}
