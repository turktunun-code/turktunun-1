# Türk Tudun — Kurulum kılavuzu

Bu belge, projeyi yerelde çalıştırmak ve canlıya almak için gerekli adımları özetler. Veri kaynağı **Supabase (Postgres)**; Google E-Tablo / Drive ve Redis kullanılmaz.

**İçindekiler:** Kavramlar → Proje özeti → Windows hazırlık → Projeyi çalıştırma → Ortam değişkenleri → **Supabase** → Admin paneli → Vercel → Domain → Önbellek → Env tablosu → Kontrol listesi → Sorun giderme → Güvenlik

---

## 1. Kavramlar sözlüğü

| Terim | Anlamı |
|--------|--------|
| **Git / repo** | Kod deposu (ör. GitHub). |
| **Node.js / npm** | `npm install`, `npm run dev` için gerekli. |
| **.env.local** | Yerel gizli ayarlar; **Git’e eklenmez**. |
| **Supabase** | Postgres veritabanı + API; üyeler, başvurular, logo URL, içerik, analitik burada. |
| **Vercel** | Next.js için barındırma. |

---

## 2. Bu proje ne işe yarar?

- **Anasayfa** (haber/blog), **üye kataloğu**, **üyelik başvurusu**, **yönetim paneli** (`/admin`).
- Üye ve ayar verisi **Supabase** tablolarında tutulur (`supabase/migrations/001_initial.sql` şeması).

---

## 3. Bilgisayarınıza hazırlık (Windows)

### 3.1. Node.js

1. [nodejs.org](https://nodejs.org) → **LTS** indirin, kurun.
2. PowerShell’de kontrol: `node -v` ve `npm -v`

### 3.2. Git (isteğe bağlı)

[git-scm.com/download/win](https://git-scm.com/download/win) — `git clone` için.

### 3.3. Editör

[Visual Studio Code](https://code.visualstudio.com) önerilir.

---

## 4. Projeyi alma ve çalıştırma

```powershell
cd Desktop
git clone <repo-url>
cd turktudun
npm install
npm run dev
```

Tarayıcı: [http://localhost:3000](http://localhost:3000)

| Adres | İçerik |
|--------|--------|
| `/anasayfa` | Haber / blog |
| `/katalog` | Üye listesi |
| `/kayit` | Başvuru formu |
| `/admin/login` | Yönetim girişi |

---

## 5. Ortam değişkeni (.env)

Gizli bilgileri koda yazmayın. Proje kökünde **`.env.local`** oluşturun (`.gitignore` zaten hariç tutar).

Şablon: **[`.env.example`](.env.example)** dosyasını kopyalayıp doldurun.

---

## 6. Supabase kurulumu

1. [supabase.com](https://supabase.com) → yeni proje.
2. **SQL Editor**’da repodaki **`supabase/migrations/001_initial.sql`** dosyasının tamamını çalıştırın.
3. **Settings → API:**
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL  
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` veya **anon** public key (dashboard’daki isim farklı olabilir)  
   - **`SUPABASE_SERVICE_ROLE_KEY`** = **service_role** (yalnızca sunucu; tarayıcıya koymayın)

Üretimde **Row Level Security** politikalarını kendi güvenlik modelinize göre ayarlayın; bu proje sunucuda çoğunlukla **service role** ile yazıp okur.

### Üyeleri ilk kez doldurma

Eski veriyi Google E-Tablodan taşıyorsanız: Supabase Table Editor veya CSV import ile `members` tablosunu doldurun. `lineage_key` alanı tutarlı olmalı (ad küçük harf + boşluk düzeni | telefon rakamları gibi bir kural).

---

## 7. Admin paneli (şifre ve oturum)

| Değişken | Açıklama |
|----------|----------|
| `ADMIN_PASSWORD` | Giriş şifresi |
| `ADMIN_SESSION_SECRET` | **En az 16 karakter**, rastgele dize |

`http://localhost:3000/admin/login` → giriş → `/admin`.

**Yapılandırma eksikse** (`ADMIN_SESSION_SECRET` kısa veya yok): middleware sizi `?misconfigured=1` ile uyarır — `.env.local` değerlerini düzeltip sunucuyu yeniden başlatın.

---

## 8. Vercel ile canlıya alma

Özet: **[VERCEL.md](VERCEL.md)**

1. Kodu GitHub’a gönderin (`.env*` commit etmeyin).
2. [vercel.com](https://vercel.com) → Import proje.
3. **Environment Variables** içine `.env.example`’daki ilgili anahtarları ekleyin (`SUPABASE_SERVICE_ROLE_KEY` dahil).
4. Deploy / Redeploy.

---

## 9. Alan adı (domain)

Vercel **Settings → Domains** → DNS kayıtlarını alan sağlayıcınızda oluşturun. HTTPS otomatik.

---

## 10. Önbelleği elle yenileme (isteğe bağlı)

`.env.local` / Vercel:

```env
REVALIDATE_SECRET=uzun_rastgele_gizli
```

```text
POST https://ALAN-ADINIZ/api/revalidate?secret=DEGER
```

---

## 11. Ortam değişkenleri özeti

| Değişken | Gerekli? | Not |
|----------|-----------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | Evet | |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Evet | veya dashboard’daki anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Üretim / tam özellik | Sunucu only |
| `ADMIN_PASSWORD` | Panel | |
| `ADMIN_SESSION_SECRET` | Panel | ≥16 karakter |
| `REVALIDATE_SECRET` | Hayır | |
| `CACHE_REVALIDATE_SECONDS` | Hayır | |
| `HOME_CONTENT_FILE` | Yerel isteğe bağlı | `true` → `data/home-content.json` |

Logo, panelden veya `site_settings` tablosunda tutulur; ayrı `GOOGLE_*` veya `UPSTASH_*` yoktur.

---

## 12. Kontrol listesi

- [ ] `npm install` / `npm run dev` çalışıyor
- [ ] Supabase SQL migration uygulandı
- [ ] `.env.local` / Vercel’de Supabase + admin değişkenleri tanımlı
- [ ] `/katalog` ve `/admin` beklendiği gibi

---

## 13. Sorun giderme

| Belirti | Olası neden |
|---------|-------------|
| Katalog boş | `members` tablosu boş veya `SUPABASE_SERVICE_ROLE_KEY` eksik |
| Admin uyarısı (misconfigured) | `ADMIN_SESSION_SECRET` yok veya &lt; 16 karakter |
| Başvuru 503 | Supabase URL / anahtarları eksik |
| Build hatası | Env eksik; Vercel build loguna bakın |

---

## 14. Güvenlik

- **`SUPABASE_SERVICE_ROLE_KEY`**, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `REVALIDATE_SECRET` paylaşılmamalı.
- Ekran görüntüsü ile göndermeyin; GitHub’a `.env` yüklemeyin.
- Eski repolarda paylaşılmış Google / Redis anahtarları varsa **iptal / rotate** edin.

---

## Son not

Bu kılavuz mevcut kod ile uyumludur. Değişken ekledikçe `.env.example` ve bu dosyayı güncelleyin. Destek alırken: **değişken isimleri** ve hata metni yeterlidir; gizli değerleri paylaşmayın.
