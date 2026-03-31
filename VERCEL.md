# Vercel dağıtımı — Türk Tudun

## Önkoşul: Supabase

1. [Supabase](https://supabase.com) projesi oluşturun.
2. Repodaki `supabase/migrations/001_initial.sql` dosyasını **SQL Editor**’da çalıştırın.
3. **Settings → API** bölümünden proje URL’si ve anahtarları alın.

## Vercel ortam değişkenleri

**Settings → Environment Variables** — ayrıntılı şablon: [.env.example](.env.example)

| Değişken | Zorunlu | Açıklama |
|----------|---------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Evet | Supabase proje URL’si |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Evet | İstemci / Auth (yayımlanabilir anahtar) |
| `SUPABASE_SERVICE_ROLE_KEY` | Evet* | Sunucu: üyeler, ayarlar, analitik, içerik yazma |
| `ADMIN_PASSWORD` | Panel için | Yönetim girişi |
| `ADMIN_SESSION_SECRET` | Panel için | ≥16 karakter, oturum imzası |
| `CACHE_REVALIDATE_SECONDS` | Hayır | ISR, varsayılan 120 |
| `REVALIDATE_SECRET` | Hayır | `/api/revalidate` için |

\* Üretimde `SUPABASE_SERVICE_ROLE_KEY` olmadan katalog ve panel verisi çalışmaz; bu anahtarı yalnızca sunucu ortamında tutun.

## Anında sayfa yenileme (isteğe bağlı)

```http
POST https://<proje>.vercel.app/api/revalidate?secret=<REVALIDATE_SECRET>
```

## Yönetim paneli

`/admin/login` → `ADMIN_PASSWORD` ile giriş. Logo, üye onayları, haber/blog ve özet istatistikler Supabase üzerinden saklanır.

## Yerel geliştirme

`.env.local` oluşturun ([.env.example](.env.example)). İsteğe bağlı: `HOME_CONTENT_FILE=true` ile haber/blog’u `data/home-content.json` içinde tutabilirsiniz (üretimde Supabase tercih edilir).

```bash
npm install
npm run dev
```
