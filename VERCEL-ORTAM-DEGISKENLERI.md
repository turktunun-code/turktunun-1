# Vercel ortam değişkenleri (baştan liste)

Bu dosya, **Türk Tü’tün** projesini Vercel’e bağlarken **Environment Variables** bölümüne eklemeniz gereken değişkenleri listeler. İsimler **birebir** bu şekilde olmalıdır; Vercel’in Supabase entegrasyonunun ürettiği `service_role`, `anon_public` gibi isimler uygulama tarafından okunmaz.

**Nereye:** [Vercel Dashboard](https://vercel.com/dashboard) → projeniz → **Settings** → **Environment Variables**

Her değişkende **Production** / **Preview** / **Development** kapsamını ihtiyacınıza göre seçin (canlı site için en az **Production**). Kaydettikten sonra **Deployments → Redeploy** yapın.

---

## Zorunlu değişkenler

| Ortam değişkeni | Ne işe yarar? | Değeri nereden alırsınız? |
|-----------------|---------------|---------------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase proje adresi; istemci ve sunucu bağlantısı. | [Supabase Dashboard](https://supabase.com/dashboard) → projeniz → **Project Settings** (dişli) → **API** → **Project URL** |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Tarayıcıdaki Supabase istemcisi (anon / publishable anahtar). | Aynı **Settings → API** sayfasında **Project API keys** → **anon** veya **publishable** (etiket arayüze göre değişir) |
| `SUPABASE_SERVICE_ROLE_KEY` | Sunucu tarafında (API route’lar) yönetimsel erişim; RLS’yi bypass eder. | **Settings → API** → **service_role** (**secret**). Bu anahtarı **yalnızca** bu isimle ve **sadece Vercel sunucu ortamında** tutun; `NEXT_PUBLIC_` önekli yapmayın. |
| `ADMIN_PASSWORD` | `/admin` giriş ekranındaki şifre. | Siz belirlersiniz; güçlü ve benzersiz bir parola seçin. Supabase’te yok — kendi parolanız. |
| `ADMIN_SESSION_SECRET` | Yönetici oturum jetonlarını imzalamak için gizli dize; **en az 16 karakter** olmalıdır. | Örneğin `openssl rand -base64 32` veya güvenilir bir parola üreticisi ile rastgele uzun bir dize üretin. |

**Ön koşul:** Supabase SQL Editor’da `supabase/migrations/001_initial.sql` dosyasını çalıştırmış olmanız gerekir (tablolar yoksa uygulama veritabanında hata verir). Kurulum özeti: `KURULUM.md`, Supabase ↔ Vercel: `SUPABASE-VERCEL.md`.

---

## İsteğe bağlı değişkenler

| Ortam değişkeni | Ne zaman? | Değeri nereden / nasıl? |
|-----------------|-----------|-------------------------|
| `REVALIDATE_SECRET` | `POST /api/revalidate?secret=...` ile dışarıdan (ör. zamanlayıcı, script) önbelleği tazelemek istiyorsanız. | Uzun, tahmin edilemez bir dize; kendiniz üretin. Tanımlı değilse bu uç gizli anahtar olmadan kullanılamaz. |
| `HOME_CONTENT_FILE` | Üretimde genelde **kullanmayın**. Yerelde `true` yapılırsa anasayfa içeriği dosyadan okunur (`data/home-content.json`). Vercel’de boş bırakın veya hiç eklemeyin; içerik Supabase üzerinden gelir. | — |

Projede `CACHE_REVALIDATE_SECONDS` `.env.example` / dokümantasyonda geçebilir; sayfa önbelleği şu an kodda sabit (**120** saniye) tanımlıdır. Vercel’e eklemeniz şart değildir.

---

## Sık yapılan hata: yanlış isim

| Vercel’de görebileceğiniz yanlış isim | Olması gereken |
|--------------------------------------|----------------|
| `service_role` | `SUPABASE_SERVICE_ROLE_KEY` |
| `anon_public` | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` |

Uygulama yalnızca bu repodaki tam isimleri `process.env` üzerinden okur.

---

## Güvenlik özeti

- **`SUPABASE_SERVICE_ROLE_KEY`**, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `REVALIDATE_SECRET` — paylaşmayın, commit etmeyin, istemci kodunda kullanmayın.
- **`NEXT_PUBLIC_`** ile başlayanlar derlemede istemciye gidebilir; yalnızca Supabase **anon/publishable** anahtarını oraya koyun, **service_role** asla.

---

## İlgili dosyalar

- Şablon: `.env.example`  
- Genel kurulum: `KURULUM.md`  
- Supabase adımları: `SUPABASE-VERCEL.md`  
- Vercel özeti: `VERCEL.md`
