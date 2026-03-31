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
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const payload = await getHomeContentAdminPayload();
  const supabase = isSupabaseConfigured();
  const fileStore = isHomeContentFileStoreEnabled();
  return NextResponse.json({
    ...payload,
    supabase,
    fileStore,
    canSave: canPersistHomeContent(),
  });
}

type PostBody = {
  news?: unknown;
  blog?: unknown;
  resetNews?: boolean;
  resetBlog?: boolean;
};

export async function POST(req: Request) {
  try {
    if (!(await getAdminSession())) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    if (!canPersistHomeContent()) {
      return NextResponse.json(
        { error: "İçerik kaydı için Supabase veya yerelde HOME_CONTENT_FILE=true gerekli" },
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
            { error: "Blog listesi geçersiz veya boş. Başlık ve özet dolu olmalı; okuma 1–240 dk." },
            { status: 400 },
          );
        }
        await persistHomeBlog(v);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Kayıt başarısız";
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    try {
      revalidatePath("/anasayfa");
    } catch (e) {
      console.error("[admin home-content] revalidatePath", e);
    }

    const payload = await getHomeContentAdminPayload();
    const supabase = isSupabaseConfigured();
    const fileStore = isHomeContentFileStoreEnabled();
    return NextResponse.json({ ok: true, ...payload, supabase, fileStore, canSave: canPersistHomeContent() });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Sunucu hatası";
    console.error("[admin home-content POST]", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
