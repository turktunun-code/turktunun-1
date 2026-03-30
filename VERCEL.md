# Vercel dağıtımı — Türk Tudun kataloğu

## Gerekenler

1. **Google Form → E-Tablo**: Form sahibi olarak [Yanıtlar] → **E-Tabloda görüntüle** ile yanıtları bir Google E-Tabloya bağlayın.
2. **Okuma erişimi**: Uygulama tabloyu CSV olarak indirir. Tabloyu en az **Bağlantısı olan herkes görüntüleyebilir** (veya herkese açık görüntüleme) yapın; aksi halde Vercel ortamında `fetch` boş veya hata döner ve site yalnızca `data/seed-members.json` içeriğini gösterir.
3. **Kimlikleri kopyalayın**: E-tablo URL’sindeki `.../d/<SHEET_ID>/...` değerini `GOOGLE_SHEET_ID` olarak kullanın. Başka bir sayfa sekmesiyse URL’deki `gid=...` değerini `GOOGLE_SHEET_GID` olarak ayarlayın.

## Vercel ortam değişkenleri

Projeyi içe aktarın; **Settings → Environment Variables** altında örnek için [.env.example](.env.example) dosyasına bakın:

| Değişken | Zorunlu | Açıklama |
|----------|---------|----------|
| `GOOGLE_SHEET_ID` | Hayır* | Boşsa yalnızca seed JSON listelenir. |
| `GOOGLE_SHEET_GID` | Hayır | Varsayılan `0`. |
| `CACHE_REVALIDATE_SECONDS` | Hayır | CSV önbelleği (ISR), varsayılan 120. |
| `REVALIDATE_SECRET` | Hayır | Anında yenileme endpoint’i için. |

## Anında sayfa yenileme (isteğe bağlı)

Google Apps Script veya benzeri ile form gönderiminde şunu çağırabilirsiniz:

```http
POST https://<proje>.vercel.app/api/revalidate?secret=<REVALIDATE_SECRET>
```

`REVALIDATE_SECRET` ile aynı değeri Vercel’de tanımlayın.

## Yönetim paneli (`/admin`)

1. **Şifre ve oturum**: `ADMIN_PASSWORD` ve en az 16 karakter `ADMIN_SESSION_SECRET` tanımlayın.
2. **Giriş**: `/admin/login` — başarılı girişten sonra `/admin` kontrol paneli.
3. **Analitik, logo URL ve üye onayları** kalıcı olması için **Upstash Redis** önerilir: `UPSTASH_REDIS_REST_URL` ve `UPSTASH_REDIS_REST_TOKEN`. Redis yoksa giriş yine çalışır; sayaçlar ve ayarlar tutulmaz.
4. **Logo**: Ana sayfa varsayılan olarak `public/logo.png` kullanır. Paneldeki URL ancak `USE_STORED_SITE_LOGO=true` iken geçerlidir (aksi halde Redis’teki eski dış adres yüzünden parşömen kare görünebilir).

## Yerel geliştirme

`.env.local` oluşturup `.env.example` içeriğini kopyalayın; `GOOGLE_SHEET_ID` doldurun. `npm run dev` ile çalıştırın.
