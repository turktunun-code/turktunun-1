# Supabase’i Vercel’e bağlama (adım adım)

Bu rehber, **Türk Tü’tün** Next.js uygulamasını Vercel’de çalıştırırken **Supabase** veritabanını ve API anahtarlarını güvenli şekilde tanımlamanız içindir. Ekranda *“Başvuru sunucusu yapılandırılmamış… NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY”* uyarısı görüyorsanız, genelde bu ortam değişkenleri Vercel’de eksik veya yanlıştır.

---

## 0. Ön koşullar

- [Supabase](https://supabase.com) hesabı  
- [Vercel](https://vercel.com) hesabı ve bu repoya bağlı bir Vercel projesi  
- Yerelde çalışıyorsa `.env.local` ile aynı isimlerde değişkenlerin ne olması gerektiğini bilmek (bkz. `.env.example`)

---

## 1. Supabase projesi oluştur

1. [Supabase Dashboard](https://supabase.com/dashboard) → **New project**.  
2. **Organization**, **Proje adı**, **Database password** (kaydedin), **Region** (Türkiye’ye yakın bir bölge seçebilirsiniz) seçin.  
3. Proje oluşana kadar bekleyin (birkaç dakika sürebilir).

---

## 2. Veritabanı şemasını uygula

Uygulama tabloları repodaki SQL ile tanımlıdır.

1. Supabase sol menü → **SQL Editor**.  
2. **New query** açın.  
3. Bu repodaki dosyayı açıp içeriğini kopyalayın: `supabase/migrations/001_initial.sql`  
4. Editöre yapıştırıp **Run** çalıştırın.  
5. Hata yoksa tablolar ve gerekli yapılar oluşmuştur.

> İleride şema değişirse yeni migration dosyalarını da aynı şekilde çalıştırmanız gerekir.

---

## 3. Supabase API anahtarlarını al

1. Supabase → **Project Settings** (dişli) → **API**.  
2. Şunları not edin:  
   - **Project URL** → Vercel’de `NEXT_PUBLIC_SUPABASE_URL`  
   - **Project API keys** altında:  
     - **anon** / **publishable** (isimlendirme arayüze göre değişebilir) → Vercel’de `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`  
     - **service_role** → Vercel’de `SUPABASE_SERVICE_ROLE_KEY`  

### Güvenlik

| Değişken | Nerede kullanılır | Dikkat |
|----------|-------------------|--------|
| `NEXT_PUBLIC_*` | Tarayıcıya gidebilir (Next.js bundler) | Sadece “anon/publishable” anahtar; **service_role asla `NEXT_PUBLIC` yapmayın.** |
| `SUPABASE_SERVICE_ROLE_KEY` | Sadece sunucu (API route’lar, SSR) | **RLS’yi bypass eder.** Git’e, istemciye veya log’lara vermeyin. |

---

## 4. Vercel ortam değişkenlerini ekle

1. [Vercel Dashboard](https://vercel.com/dashboard) → projenizi seçin.  
2. **Settings** → **Environment Variables**.  
3. Aşağıdaki değişkenleri ekleyin (değerleri Supabase’ten kopyaladıklarınızla doldurun):

| Name | Örnek kaynak |
|------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | anon / publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key |

4. Her değişken için **Environment** seçin:  
   - **Production** (canlı site)  
   - **Preview** (pull request önizlemeleri)  
   - **Development** (Vercel CLI ile `vercel dev` kullanıyorsanız)  

> Canlı site için en azından **Production**’da tanımlı olmalıdır. Preview branch’lerde de test edecekseniz **Preview**’ı da işaretleyin.

### Admin ve diğer zorunlu değişkenler

Uygulama admin ve oturum için ek değişkenler bekler. Bunlar da Vercel’de tanımlı olmalıdır (örnek isimler `.env.example` içinde):

- `ADMIN_PASSWORD`  
- `ADMIN_SESSION_SECRET` (en az 16 karakter güçlü bir gizli dize)  

Eksik olursa admin girişi veya yönlendirmelerde sorun çıkar.

---

## 5. Yeniden dağıtım (redeploy)

Ortam değişkenleri **yalnızca yeni deployment’larda** tam olarak uygulanır.

1. Vercel → **Deployments** → son deployment’ın yanındaki **⋯** → **Redeploy**  
   veya  
2. Repoya boş commit atıp push edin / main’e merge edin.

Deploy bittikten sonra canlı URL’yi tekrar açıp başvuru veya admin akışını deneyin.

---

## 6. Doğrulama (kısa kontrol listesi)

- [ ] `NEXT_PUBLIC_SUPABASE_URL` tarayıcıda olması normal; değer Supabase Project URL ile aynı mı?  
- [ ] `SUPABASE_SERVICE_ROLE_KEY` sadece Vercel **server** ortamında; istemci kodunda veya `NEXT_PUBLIC_` ile başlamıyor mu?  
- [ ] SQL migration hatasız çalıştı mı?  
- [ ] Başvuru formu / API artık “sunucu yapılandırılmamış” vermiyor mu?  
- [ ] `/admin` girişi için `ADMIN_PASSWORD` ve `ADMIN_SESSION_SECRET` set mi?

---

## 7. Sorun giderme

| Belirti | Olası neden |
|---------|----------------|
| “Başvuru sunucusu yapılandırılmamış” | `NEXT_PUBLIC_SUPABASE_URL` veya `SUPABASE_SERVICE_ROLE_KEY` eksik/typo; redeploy yapılmadı. |
| CORS / auth yönlendirme (Supabase Auth kullanıyorsanız) | Supabase → **Authentication** → **URL Configuration** içinde **Site URL** ve **Redirect URLs**’e Vercel domain’inizi ekleyin (örn. `https://proje-adiniz.vercel.app`). Bu proje öncelikle custom admin cookie kullanıyor olabilir; yine de Auth kullanılıyorsa bu adım gerekir. |
| Tablo bulunamadı | `001_initial.sql` çalıştırılmamış veya yanlış projeye bağlanıyorsunuz. |

---

## İlgili dosyalar

- Ortam şablonu: `.env.example`  
- Genel kurulum: `KURULUM.md`  
- Vercel özeti: `VERCEL.md`  
- Şema: `supabase/migrations/001_initial.sql`
