import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-api";
import {
  canPersistHomeContent,
  clearPersistedHomeBlog,
  clearPersistedHomeNews,
  getHomeContentAdminPayload,
  isHomeContentFileStoreEnabled,
  persistHomeBlog,
  persistHomeNews,
  validateBlogItems,
  validateNewsItems,
} from "@/lib/home-content-store";
import { isRedisConfigured } from "@/lib/redis";

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const payload = await getHomeContentAdminPayload();
  const redis = isRedisConfigured();
  const fileStore = isHomeContentFileStoreEnabled();
  return NextResponse.json({
    ...payload,
    redis,
    fileStore,
    canSave: redis || fileStore,
  });
}

type PostBody = {
  news?: unknown;
  blog?: unknown;
  resetNews?: boolean;
  resetBlog?: boolean;
};

export async function POST(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  if (!canPersistHomeContent()) {
    return NextResponse.json(
      { error: "İçerik kaydı için Redis (UPSTASH_*) veya yerelde HOME_CONTENT_FILE=true gerekli" },
      { status: 503 },
    );
  }

  let body: PostBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  try {
    if (body.resetNews === true) {
      await clearPersistedHomeNews();
    }
    if (body.resetBlog === true) {
      await clearPersistedHomeBlog();
    }

    if (body.news !== undefined) {
      const v = validateNewsItems(body.news);
      if (!v || v.length < 1) {
        return NextResponse.json(
          { error: "Haber listesi geçersiz veya boş. Tarih YYYY-AA-GG, benzersiz id ve zorunlu alanlar." },
          { status: 400 },
        );
      }
      await persistHomeNews(v);
    }

    if (body.blog !== undefined) {
      const v = validateBlogItems(body.blog);
      if (!v || v.length < 1) {
        return NextResponse.json(
          { error: "Blog listesi geçersiz veya boş. Okuma süresi 1–240 dk." },
          { status: 400 },
        );
      }
      await persistHomeBlog(v);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Kayıt başarısız";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  revalidatePath("/anasayfa");

  const payload = await getHomeContentAdminPayload();
  const redis = isRedisConfigured();
  const fileStore = isHomeContentFileStoreEnabled();
  return NextResponse.json({ ok: true, ...payload, redis, fileStore, canSave: redis || fileStore });
}
