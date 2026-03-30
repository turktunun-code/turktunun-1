# Türk Tudun — Sıfırdan tam kurulum kılavuzu

Bu belge, **web geliştirme veya sunucu yönetimi bilmeyen** biri için yazılmıştır. Bilgisayarınızda hangi programların kurulu olduğunu varsaymıyoruz; her adımda **ne yaptığınız** ve **neden** kısaca açıklanır.

**Nasıl kullanmalısınız?** Yukarıdan aşağıya okuyun. Bir bölüm sizin için gerekmiyorsa (örneğin “sadece Vercel’de canlı site”) ilgili bölümleri atlayabilirsiniz; atladığınız yerde hangi ortam değişkenlerinin şart olduğuna dikkat edin.

---

## İçindekiler

1. [Kavramlar sözlüğü](#1-kavramlar-sözlüğü)
2. [Bu proje ne işe yarar?](#2-bu-proje-ne-işe-yarar)
3. [Bilgisayarınıza hazırlık (Windows)](#3-bilgisayarınıza-hazırlık-windows)
4. [Projeyi bilgisayara alma ve çalıştırma](#4-projeyi-bilgisayara-alma-ve-çalıştırma)
5. [Ortam değişkeni (.env) nedir?](#5-ortam-değişkeni-env-nedir)
6. [Google: Hesap, Drive, Form ve tablo](#6-google-hesap-drive-form-ve-tablo)
7. [Google Cloud: Proje, Sheets API, servis hesabı](#7-google-cloud-proje-sheets-api-servis-hesabı)
8. [Tabloyu servis hesabı ile paylaşma](#8-tabloyu-servis-hesabı-ile-paylaşma)
9. [Alternatif: Tabloyu herkese açık yayınlama (basit ama riskli)](#9-alternatif-tabloyu-herkese-açık-yayınlama-basit-ama-riskli)
10. [Upstash Redis kurulumu](#10-upstash-redis-kurulumu)
11. [Admin paneli (şifre ve oturum)](#11-admin-paneli-şifre-ve-oturum)
12. [Vercel ile canlıya alma](#12-vercel-ile-canlıya-alma)
13. [Alan adı (domain) bağlama](#13-alan-adı-domain-bağlama)
14. [Önbelleği elle yenileme (isteğe bağlı)](#14-önbelleği-elle-yenileme-i̇steğe-bağlı)
15. [Tüm ortam değişkenleri tablosu](#15-tüm-ortam-değişkenleri-tablosu)
16. [Kurulum bitti mi? Kontrol listesi](#16-kurulum-bitti-mi-kontrol-listesi)
17. [Sorun çıkarsa](#17-sorun-çıkarsa)
18. [Güvenlik — mutlaka okuyun](#18-güvenlik--mutlaka-okuyun)

---

## 1. Kavramlar sözlüğü

| Terim | Basit anlamı |
|--------|----------------|
| **Git** | Kodun versiyonlarını saklayan sistem. GitHub, GitLab gibi siteler Git kullanır. |
| **Depo (repository / repo)** | Proje dosyalarının bulunduğu paket; genelde GitHub’da durur. |
| **Node.js** | Sunucu tarafında JavaScript çalıştıran program. Bu site Next.js ile yazıldı; Node gerektirir. |
| **npm** | Node ile gelen paket yöneticisi; `npm install` ile kütüphaneleri indirir. |
| **Terminal / komut satırı** | Windows’ta “Komut İstemi” veya **PowerShell**; yazdığınız komutları çalıştırır. |
| **Ortam değişkeni (environment variable)** | Programa “şifreleri ve adresleri buradan oku” demenin yolu. Bu projede `GOOGLE_SHEET_ID` gibi isimler kullanılır. |
| **.env.local** | Geliştirme sırasında ortam değişkenlerini saklayan **yerel** dosya. Git’e **yüklenmez** (gizli kalması için). |
| **Vercel** | Web sitelerini internete açan bir barındırma hizmeti; Next.js ile çok uyumludur. |
| **Deploy (dağıtım)** | Kodunuzu Vercel’e yükleyip dünyanın erişebileceği adrese çıkarma işlemi. |
| **Google Drive** | Google’ın dosya saklama alanı. Google **E-Tablo** dosyalarınız da burada durur. |
| **Google E-Tablo (Sheets)** | Excel benzeri çevrimiçi tablo; üye listesi buradan okunur. |
| **Google Cloud Console** | Google’ın geliştirici paneli; “API aç”, “servis hesabı oluştur” işleri burada. |
| **Servis hesabı** | İnsan kullanıcısı değil, **program** için oluşturulan Google hesabı. Robot kullanıcı gibi düşünün; tabloya bu e-posta ile paylaşım verirsiniz. |
| **JSON** | `{}` ve `[]` kullanan veri yazım biçimi. Servis hesabı anahtarı bir JSON dosyasıdır. |
| **Redis** | Çok hızlı bir veri tabanı; bu projede ayarlar, onaylar, istatistik için kullanılır. **Upstash**, Redis’i internet üzerinden kullanmanın kolay yoludur. |
| **API** | Programların birbiriyle konuşma yolu (ör. “tablo verisini getir” isteği). |
| **ISR / önbellek** | Sayfanın bir süre aynı kalması; tablo güncellenince biraz gecikmeyle yansıyabilir. |
| **DNS** | Alan adınızın (`site.com`) hangi sunucuya gideceğini söyleyen kayıtlar. |

---

## 2. Bu proje ne işe yarar?

- Ziyaretçilere **anasayfa** (haber/blog özetleri), **üye kataloğu** ve **üyelik başvurusu** sayfalarını gösterir.
- Üyeler genelde bir **Google E-Tablodan** okunur (tablo Google Drive’ınızdadır).
- **Yönetim paneli** (`/admin`) ile üyeleri onaylama/ reddetme, Google tablo ayarı, logo, haber/blog düzenleme (Redis ile) yapılabilir.

Bu site “tek başına” Google Drive’daki Word/PDF dosyalarını okumaz; **veri kaynağı elektronik tablodur**.

---

## 3. Bilgisayarınıza hazırlık (Windows)

### 3.1. Node.js kurulumu

1. [https://nodejs.org](https://nodejs.org) adresine gidin.
2. **LTS** (uzun süre desteklenen) sürümünü indirin.
3. İndirilen kurulum dosyasını çalıştırın; varsayılanları kabul edebilirsiniz.
4. Kurulum bitince **bilgisayarı yeniden başlatmak** bazen gerekir; takılırsa yeniden başlatın.

**Kuruldu mu kontrol:** Başlat menüsünden **PowerShell** açın ve sırayla yazın (Enter’a basın):

```powershell
node -v
npm -v
```

Her ikisi de bir sürüm numarası göstermeli (ör. `v22.x.x` ve `10.x.x`). Hata alırsanız Node kurulumunu tekrar edin.

### 3.2. Git kurulumu (GitHub kullanacaksanız)

1. [https://git-scm.com/download/win](https://git-scm.com/download/win) adresinden Git for Windows indirin.
2. Kurulumda çoğu varsayılan ayar uygundur.

Kontrol:

```powershell
git --version
```

Git kullanmayacaksanız projeyi ZIP olarak indirip klasöre çıkarabilirsiniz; ancak Vercel ile otomatik deploy için GitHub’a yüklemek pratiktir.

### 3.3. Kod düzenleyici (isteğe bağlı ama önerilir)

**Visual Studio Code** ücretsizdir: [https://code.visualstudio.com](https://code.visualstudio.com)

---

## 4. Projeyi bilgisayara alma ve çalıştırma

### 4.1. Klasör yolu

Projeyi örneğin `C:\Users\SizinAdiniz\Desktop\turktudun` gibi bir yerde tutun. **Türkçe karakter ve boşluksuz** bir yol kullanmak bazen sorun çıkarmaz; sorun yaşarsanız İngilizce kısa yol deneyin.

### 4.2. Git ile klonlama (GitHub’da repo varsa)

PowerShell’de:

```powershell
cd $HOME\Desktop
git clone https://github.com/KULLANICI_ADI/turktudun.git
cd turktudun
```

`KULLANICI_ADI` ve repo adresini kendi deponuzla değiştirin.

### 4.3. Bağımlılıkları yükleme

Proje klasöründeyken:

```powershell
npm install
```

İnternetten paketler indirilir; birkaç dakika sürebilir.

### 4.4. Geliştirme sunucusunu başlatma

```powershell
npm run dev
```

Çıktıda genelde şunu görürsünüz: `http://localhost:3000`

Tarayıcıda bu adresi açın.

**Durdurmak için:** PowerShell penceresinde `Ctrl + C` tuşlarına basın.

### 4.5. Önemli sayfa adresleri (yerel)

| Adres | Ne var? |
|--------|---------|
| `http://localhost:3000` | Giriş / kök sayfa (projeye göre yönlendirme olabilir) |
| `http://localhost:3000/anasayfa` | Anasayfa |
| `http://localhost:3000/katalog` | Üye kataloğu |
| `http://localhost:3000/admin/login` | Yönetim girişi |
| `http://localhost:3000/admin` | Panel (giriş gerekir) |

Henüz tablo ayarlamadıysanız katalog boş veya örnek veriyle görünebilir; bu normaldir.

---

## 5. Ortam değişkeni (.env) nedir?

Gizli bilgileri (şifre, API anahtarı) kodun içine yazmak **yanlıştır**; çünkü kod GitHub’a giderse herkes görür.

Bu projede gizliler **ortam değişkenleri** ile verilir.

### 5.1. `.env.local` oluşturma (sadece sizin bilgisayar)

1. Proje kök klasörünü açın (içinde `package.json` olan dosya).
2. **Yeni metin dosyası** oluşturun, adını tam olarak `.env.local` yapın.  
   - Windows bazen `.env.local.txt` yapar; dosya Gezgini’nde **Dosya adı uzantıları** açıksa kontrol edin. Uzantı `.local` olmalı, sonunda `.txt` kalmamalı.
3. İçine satır satır yazacaksınız; format:

```env
DEGISKEN_ADI=değer
```

Boşluksuz `=` kullanın (çoğu değişken için). Örnek (kendi şifrenizi yazın):

```env
ADMIN_PASSWORD=GucluBirSifre123!
ADMIN_SESSION_SECRET=en_az_on_alti_karakter_rastgele
```

4. Kaydedin. **Bu dosyayı asla WhatsApp, e-posta ile paylaşmayın; GitHub’a yüklemeyin.**

### 5.2. Örnek şablon

Repoda `.env.example` vardır: İçindeki satırları kopyalayıp `.env.local` içine yapıştırabilir, boş bıraktığınız yerleri doldurabilirsiniz.

---

## 6. Google: Hesap, Drive, Form ve tablo

### 6.1. İhtiyacınız olan

- Ücretsiz bir **Google hesabı** (Gmail).

### 6.2. Tablo nerede?

- **Google Drive**’da yeni bir **Google E-Tablolar** dosyası oluşturabilirsiniz;  
  **veya** bir **Google Form** kullanıyorsanız form ayarlarından yanıtların **e-tabloya kaydedilmesini** seçersiniz; Google size otomatik bir tablo oluşturur — o tablo da Drive’da görünür.

### 6.3. `GOOGLE_SHEET_ID` nasıl bulunur?

1. E-tabloyu tarayıcıda açın.
2. Adres çubuğuna bakın. Örnek:

   `https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/edit#gid=0`

3. `/d/` ile `/edit` arasındaki uzun kod **Sheet ID**’dir. Örnekte: `1AbCdEfGhIjKlMnOpQrStUvWxYz`
4. Bu değeri `.env.local` içine yazın:

```env
GOOGLE_SHEET_ID=1AbCdEfGhIjKlMnOpQrStUvWxYz
```

### 6.4. `GOOGLE_SHEET_GID` nedir?

- Tablonun **altındaki sekmeler** vardır (Sayfa1, Sayfa2…). Hangi sekmedeki verinin okunacağını belirler.
- Adres satırında `gid=0` veya `gid=123456789` görürsünüz. Bu sayı **GID**’dir.
- İlk sekme çoğu zaman `gid=0`dır. `.env.local`:

```env
GOOGLE_SHEET_GID=0
```

Başka sekme kullanıyorsanız o sekmenin URL’sindeki `gid` değerini yazın.

### 6.5. Tablo içeriği (sütun başlıkları)

İlk satır **başlık** satırı olmalı. Program, başlık metnine bakarak sütunu tanır (Türkçe karakterler sadeleştirilir). Tanınan örnekler:

| Katalog alanı | Başlıkta geçmesi beklenen kelimeler (örnek) |
|----------------|----------------------------------------------|
| Tam ad | `Tam Ad`, `Ad-Soyad`, `Ad Soyad` |
| Sektör | `Meslek`, `Endüstri`, `Sanayinin`, `Uzmanlık` |
| Marka | `Marka` |
| Konum | `Konum`, `Lokasyon`, `İl - İlçe` |
| İletişim | `İletişim`, `Telefon`, `Numara` |
| Dijital iletişim | `E-posta`, `Telegram`, `Elektronik` |
| Rütbe / kıdem | `Kıdem`, `Rütbe` |
| Hammadde / ihtiyaç | `Hammadde`, `İhtiyaç` |
| Referans | `Referans` |

**Zorunlu:** En azından **tam ad** sütunu dolu olan satırlar katalogda görünür; tam ad boş satırlar atlanır.  
Formdan gelen “zaman damgası” gibi sütunlar otomatik yok sayılabilir.

Excel veya başka yerden kopyalarken ilk satırın gerçekten başlık olduğundan emin olun.

---

## 7. Google Cloud: Proje, Sheets API, servis hesabı

Bu bölüm, tablonuzu **herkese açmadan** okumak isteyenler içindir. Adımlar fazla görünebilir; sırayla yapın.

### 7.1. Google Cloud’a giriş

1. [https://console.cloud.google.com](https://console.cloud.google.com) adresine gidin.
2. Google hesabınızla oturum açın.
3. Üstte **proje seçici** vardır. **Yeni proje oluştur** deyin:
   - **Proje adı:** örn. `turktudun-uye-listesi`
   - Oluşturduktan sonra bu projeyi **seçili** bırakın.

### 7.2. Faturalandırma (Billing)

Bazı API’ler için Google “faturalandırma hesabı” ister. Çoğu küçük kullanımda **ücretsiz kredi** veya çok düşük ücret söz konusudur; yine de Cloud Console faturalandırma adımını tamamlamanız gerekebilir. Kurumsal hesaplarda yöneticiniz ekleyebilir.

### 7.3. Google Sheets API’yi açma

1. Sol menüden **API’ler ve Hizmetler** → **Kitaplık** (İngilizce arayüzde: **APIs & Services** → **Library**).
2. Arama kutusuna **Google Sheets API** yazın.
3. **Etkinleştir** (Enable) düğmesine basın.

### 7.4. Servis hesabı oluşturma

1. **API’ler ve Hizmetler** → **Kimlik bilgileri** (Credentials).
2. Üstte **+ Kimlik bilgisi oluştur** → **Hizmet hesabı** (Service account).
3. **Hizmet hesabı adı** verin (ör. `vercel-sheet-reader`), **Oluştur ve devam et** diyebilirsiniz.
4. Rol ekranında bu proje için çoğu zaman **Viewer** veya daha sonra tablo paylaşımı yeterli olur; zorunlu rol atamalarını atlayıp **Bitti** ile kapatabilirsiniz (proje politikasına göre değişir).

### 7.5. JSON anahtarı indirme

1. **API’ler ve Hizmetler** → **Kimlik bilgileri**.
2. **Hizmet hesapları** bölümünde oluşturduğunuz e-postayı bulun (ör. `...@....iam.gserviceaccount.com`).
3. Hizmet hesabına tıklayın → **Anahtarlar** (Keys) sekmesi.
4. **Anahtar ekle** → **Yeni anahtar oluştur** → tür: **JSON** → İndirilecek dosyayı bilgisayarınıza kaydedin.

**Bu JSON dosyası bir şifredir.** Güvende tutun, paylaşmayın.

### 7.6. JSON içinden e-postayı kopyalama

İndirilen `.json` dosyasını not defteriyle açın. İçinde şuna benzer bir alan var:

```json
"client_email": "ad@proje-id.iam.gserviceaccount.com",
```

Bu e-postayı bir yere kopyalayın; bir sonraki bölümde tabloya **paylaşım** ekleyeceksiniz.

### 7.7. Ortam değişkenine JSON verme (`GOOGLE_SERVICE_ACCOUNT_JSON`)

Uygulama tek bir metin değişkeninde tüm JSON’u bekler.

**Yöntem A — Tek satır (Vercel için pratik)**  
JSON dosyasındaki satır sonlarını kaldırıp tek satıra getirin (dikkatli olun, virgül ve tırnaklar bozulmasın). Bu metni Vercel’de veya `.env.local` içinde tırnak **kullanmadan** değer olarak yapıştırmak en temiz yöntem olabilir; ancak bazı özel karakterler sorun çıkarırsa Vercel’in “çok satırlı” secret alanını kullanın.

**Yöntem B — PowerShell ile tek satıra çevirme (dosya yolunu kendinize göre değiştirin)**

```powershell
(Get-Content -Raw "C:\Yol\indirilen-anahtar.json") -replace "`r?`n", "" | Set-Clipboard
```

Sonra panoyu `.env.local` içinde `GOOGLE_SERVICE_ACCOUNT_JSON=` satırına yapıştırın.

Örnek (tek satır, kısaltılmış):

```env
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..." ... }
```

Yerel dosyada tırnak içine almak bazen kaçış karakteri gerektirir; en kolayı Vercel ve yerelde **tırnaksız** ham JSON satırı kullanmaktır (Next.js ortam dosyası kurallarına dikkat: değer içinde boşluk vb. varsa dokümantasyonu kontrol edin).

---

## 8. Tabloyu servis hesabı ile paylaşma

Servis hesabının tabloyu **görebilmesi** için tabloda ona izin vermelisiniz.

1. Google E-Tabloyu açın.
2. Sağ üst **Paylaş** (Share).
3. Kopyaladığınız `client_email` adresini yapıştırın.
4. Yetki: **Görüntüleyici** (Viewer) yeterli — uygulama tabloyu okur.
5. **Gönder** / **Paylaş**.

Birkaç saniye içinde yetki yayılır. Sonra siteniz tabloyu API ile okumayı dener.

---

## 9. Alternatif: Tabloyu herkese açık yayınlama (basit ama riskli)

Servis hesabı kurmak istemezseniz, uygulama herkese açık **CSV dışa aktarım** yolunu dener.

1. E-Tabloda **Dosya** → **Paylaş** → **Web’de yayınla** (Publish to the web) benzeri seçenekleri kullanarak tabloyu internete açık hale getirmeniz gerekebilir (Google arayüzü zamanla değişir; “herkes linkle erişsin” anlamına gelen seçenek arayın).

**Uyarı:** Tablodaki **tüm satırlar** teoride linki bilen herkesçe okunabilir. Kişisel veri (telefon, e-posta) varsa **bu yöntemi kullanmayın**; Bölüm 7–8 ile özel okuma yapın.

---

## 10. Upstash Redis kurulumu

Redis olmadan yerelde bazı şeyleri sınırlı kullanırsınız; **canlı sitede panel özellikleri** için Redis önerilir.

### 10.1. Hesap ve veritabanı

1. [https://upstash.com](https://upstash.com) → kaydolun.
2. **Create database** → **Redis**.
3. **Bölge (region):** Vercel’de seçtiğiniz bölgeye yakın olsun (ör. `eu-west-1` Avrupa).
4. Oluşturunca veritabanı sayfasında **REST API** bölümü görünür.

### 10.2. İki değeri kopyalayın

- **UPSTASH_REDIS_REST_URL** — `https://....upstash.io` ile başlayan adres  
- **UPSTASH_REDIS_REST_TOKEN** — uzun token metni

`.env.local` örneği:

```env
UPSTASH_REDIS_REST_URL=https://xxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AYNI_TOKEN_BURAYA
```

### 10.3. Ücretsiz limitler

Upstash’in ücretsiz kotası vardır; trafiğiniz büyürse ücretli plan gerekir — Upstash fiyat sayfasından güncel bilgi alın.

---

## 11. Admin paneli (şifre ve oturum)

### 11.1. Zorunlu iki değişken

`lib/admin-auth.ts` dosyasına göre:

- **`ADMIN_PASSWORD`** — girişte yazacağınız şifre.
- **`ADMIN_SESSION_SECRET`** — en az **16 karakter**; rastgele harf ve rakamdan oluşan bir **dize** seçin (şifre değil, imzalama anahtarı gibi düşünün). Bu değer “oturum çerezini imzalamak” için kullanılır; `ADMIN_PASSWORD` ile karıştırmayın.

Örnek `.env.local`:

```env
ADMIN_PASSWORD=UzunVeGucluBirSifre2026!
ADMIN_SESSION_SECRET=ornek_rastgele_en_az_16_karakter
```

### 11.2. Giriş

1. `http://localhost:3000/admin/login` (veya canlı sitede `/admin/login`)
2. Şifreyi girin.
3. Panelden **Üyeler**, **Haber/Blog**, **Sistem** sekmelerine gidebilirsiniz.

**Redis yoksa:** Üye onayını kaydetmek, logo kaydetmek, Google ayarını panelden saklamak çalışmaz. Yerelde haber/blog için `HOME_CONTENT_FILE=true` kullanılabilir (dosya: `data/home-content.json`).

---

## 12. Vercel ile canlıya alma

### 12.1. Kodun GitHub’da olması

Vercel en kolay şekilde **GitHub** ile bağlanır.

1. [https://github.com](https://github.com) hesabı açın.
2. Yeni **repository** oluşturun.
3. Yerelde proje klasöründe (ilk kez):

```powershell
git init
git add .
git commit -m "Ilk commit"
git branch -M main
git remote add origin https://github.com/KULLANICI/REPO.git
git push -u origin main
```

(`.env.local` **asla** commit edilmemelidir; `.gitignore` içinde `.env*` vardır.)

### 12.2. Vercel projesi oluşturma

1. [https://vercel.com](https://vercel.com) → kaydolun (GitHub ile giriş önerilir).
2. **Add New…** → **Project**.
3. GitHub’daki **turktudun** deposunu **Import** edin.
4. **Framework Preset:** Next.js (otomatik seçilir).
5. **Root Directory:** boş (tek proje köküyse).
6. **Deploy** deyin.

İlk deploy birkaç dakika sürer. Bitince size `https://proje-adi.vercel.app` gibi bir adres verilir.

### 12.3. Ortam değişkenlerini Vercel’e ekleme

1. Vercel’de projenize girin.
2. **Settings** → **Environment Variables**.
3. Her satırı ekleyin:
   - **Key:** `GOOGLE_SHEET_ID`  
   - **Value:** tablo ID’niz  
   - **Environment:** Production (ve isterseniz Preview) işaretli olsun.
4. `GOOGLE_SERVICE_ACCOUNT_JSON`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` vb. aynı şekilde.

5. Kaydettikten sonra yeni bir deploy gerekir:
   - **Deployments** sekmesi → son deployment sağ üst **⋯** → **Redeploy**  
   veya boş bir commit atın.

### 12.4. Build hatası olursa

- Vercel’de ilgili deployment’a tıklayın → **Building** loglarını okuyun.
- Genelde eksik ortam değişkeni veya Node sürüm uyumsuzluğu yazılır.

---

## 13. Alan adı (domain) bağlama

1. Alan adınızı satın aldığınız yerde (GoDaddy, Natro, Cloudflare vb.) DNS ayarlarına girin.
2. Vercel’de **Settings** → **Domains** → alan adınızı yazın (ör. `turktudun.com`).
3. Vercel size **CNAME** veya **A** kaydı gösterir; bunları alan sağlayıcınızda aynen oluşturun.
4. Yayılım 5 dakika – 48 saat sürebilir.

HTTPS sertifikası Vercel tarafından otomatik üretilir.

---

## 14. Önbelleği elle yenileme (isteğe bağlı)

Tablo sık güncelleniyorsa, sitenin belirli sayfalarını programla yeniletebilirsiniz.

1. `.env.local` ve Vercel’de tanımlayın:

```env
REVALIDATE_SECRET=uzun_rastgele_gizli_kelime
```

2. Tablo her güncellendiğinde şu isteği **güvenli bir yerden** gönderin (secret’ı kimseyle paylaşmayın):

```text
POST https://SIZIN-ALAN-ADINIZ/api/revalidate?secret=REVALIDATE_SECRET_DEGERI
```

**PowerShell örneği:**

```powershell
Invoke-WebRequest -Uri "https://ornek.vercel.app/api/revalidate?secret=BURAYA_GIZLI" -Method POST
```

Yanıt başarılıysa önbellek temizlenmiş demektir. `REVALIDATE_SECRET` tanımlı değilse veya yanlışsa **401** döner.

---

## 15. Tüm ortam değişkenleri tablosu

| Değişken | Genelde gerekli mi? | Ne işe yarar? |
|----------|----------------------|---------------|
| `GOOGLE_SHEET_ID` | Canlıda evet | Üye tablosunun kimliği |
| `GOOGLE_SHEET_GID` | Çoğu zaman `0` | Hangi sekme okunacak |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Özel tablo için şiddetle önerilir | Sheets API ile güvenli okuma |
| `UPSTASH_REDIS_REST_URL` | Panel + üretim için önerilir | Redis REST adresi |
| `UPSTASH_REDIS_REST_TOKEN` | Panel + üretim için önerilir | Redis token |
| `ADMIN_PASSWORD` | Panel kullanacaksanız | Giriş şifresi |
| `ADMIN_SESSION_SECRET` | Panel kullanacaksanız | ≥16 karakter, oturum imzası |
| `REVALIDATE_SECRET` | Hayır | Elle önbellek temizleme |
| `CACHE_REVALIDATE_SECONDS` | Hayır | Sayfa yenileme aralığı (saniye) |
| `USE_STORED_SITE_LOGO` | Hayır | `true` ise paneldeki logo URL’si kullanılır |
| `HOME_CONTENT_FILE` | Sadece yerel deneme | `true` → haber/blog `data/home-content.json`; **Vercel’de kalıcı değil** |

Tam yorum satırlı şablon: **`/.env.example`**

---

## 16. Kurulum bitti mi? Kontrol listesi

**Yerel bilgisayar**

- [ ] `node -v` ve `npm -v` çalışıyor
- [ ] `npm install` ve `npm run dev` sorunsuz
- [ ] `.env.local` oluşturuldu (veya en azından test şifresi ile admin denendi)
- [ ] Google tablo ID doğru; gerekirse GID doğru
- [ ] Mümkünse servis hesabı + paylaşım tamam
- [ ] İsterseniz Upstash değişkenleri yerelde de tanımlı

**Vercel üretim**

- [ ] GitHub’a kod itildi (gizli dosyalar gitmeden)
- [ ] Tüm gerekli ortam değişkenleri Production’a eklendi
- [ ] Redeploy yapıldı
- [ ] Canlı sitede `/katalog` tabloyu yansıtıyor
- [ ] `/admin/login` ile panel açılıyor
- [ ] Kişisel veriler herkese açık tablo ile paylaşılmıyor (tercihen API modu)

---

## 17. Sorun çıkarsa

| Belirti | Olası neden | Ne yapın? |
|---------|-------------|-----------|
| Katalog boş | Sheet ID yanlış; tabloda veri yok; ilk satır başlık uyumsuz | ID/GID’yi kontrol edin; `lib` içi parse beklentisine bakın |
| Katalog eski | ISR önbelleği | Bekleyin veya `/api/revalidate` kullanın |
| API / 403 | Servis hesabına paylaşım verilmemiş | Tabloda `client_email` var mı |
| Yerelde “Redis gerekli” | Upstash tanımlı değil | `.env.local`’e ekleyin veya özelliği Redis gerektirmeyecek şekilde sadece okuyun |
| Admin açılmıyor | `ADMIN_PASSWORD` / `ADMIN_SESSION_SECRET` eksik veya secret kısa | Secret ≥16 karakter |
| Vercel build kırık | Eksik env; TypeScript hatası | Build logunu okuyun |
| JSON env bozuk | Tırnak / satır sonu | Tek satır JSON; Vercel’de yeniden yapıştırın |

**Yardım için log:** Vercel → Deployment → **Functions** / **Logs** bölümünden sunucu hatalarına bakın.

---

## 18. Güvenlik — mutlaka okuyun

- `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `GOOGLE_SERVICE_ACCOUNT_JSON`, `UPSTASH_REDIS_REST_TOKEN`, `REVALIDATE_SECRET` **kimseyle paylaşılmaz**.
- Bu değerleri **ekran görüntüsü** ile WhatsApp’ta göndermeyin.
- GitHub’a yüklemeden önce repoda `.env` dosyası olmadığını kontrol edin.
- Üretim şifreleri ile geliştirme şifreleri **aynı olmasın**.
- `REVALIDATE_SECRET` bilinirse biri sitenizin önbelleğini sürekli boşaltabilir; uzun ve rastgele tutun.

---

## Son not

Bu kılavuz, **bu repodaki kod** ile uyumludur. Güncelleme yaptıkça (ör. yeni ortam değişkeni) burayı da güncellemeniz iyi olur. Teknik destek alırken: Vercel build logu, kullandığınız ortam değişkeni **isimleri** (değerleri değil!) ve hata mesajının tam metni çok işe yarar.
