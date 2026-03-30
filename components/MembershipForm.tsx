"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { TAGLINE } from "@/lib/constants";
import { EXTRA_SOCIAL_PLATFORM_OPTIONS } from "@/lib/extra-social-platforms";
import { buildSectorField, SECTOR_BRANCHES } from "@/lib/sector-options";
import { ILLER, ilcelerFor } from "@/lib/turkiye-il-ilce";
import { ThemeToggle } from "@/components/ThemeToggle";

const inputClass =
  "rounded-xl border border-[var(--card-border)] bg-[var(--input-bg)] px-4 py-3 text-base text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none ring-[var(--accent)] focus:border-[var(--accent)]/40 focus:ring-2";

const selectClass = `${inputClass} cursor-pointer bg-[var(--input-bg)]`;

const LEGAL_FORMS = [
  { value: "", label: "Seçiniz (opsiyonel)" },
  { value: "sahis", label: "Şahıs işletmesi" },
  { value: "ltd", label: "Limited şirket (Ltd.)" },
  { value: "as", label: "Anonim şirket (A.Ş.)" },
  { value: "koop", label: "Kooperatif" },
  { value: "stk", label: "Dernek, vakıf veya STK" },
  { value: "sube", label: "Şube / irtibat bürosu" },
  { value: "yabanci", label: "Yabancı kuruluş temsilciliği" },
  { value: "bagimsiz", label: "Bağımsız uzman / freelancer" },
  { value: "diger", label: "Diğer (ek notlarda açıklayınız)" },
] as const;

const PREFERRED_CONTACT = [
  { value: "", label: "Belirtmek istemiyorum" },
  { value: "telefon", label: "Telefon (GSM / sabit)" },
  { value: "email", label: "E-posta" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "linkedin", label: "LinkedIn mesajı" },
  { value: "diger", label: "Diğer (notlarda belirtiniz)" },
] as const;

const EMPLOYEE_RANGES = [
  { value: "", label: "Belirtmek istemiyorum" },
  { value: "1", label: "1 kişi" },
  { value: "2-9", label: "2 – 9 kişi" },
  { value: "10-49", label: "10 – 49 kişi" },
  { value: "50-249", label: "50 – 249 kişi" },
  { value: "250+", label: "250 ve üzeri" },
] as const;

function FormSection({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card-elevated)] p-6 dark:bg-[var(--card)]">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">{title}</h2>
        {hint ? <p className="mt-1 text-xs text-[var(--muted)]">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

const initialFormState = () => ({
  fullName: "",
  jobTitle: "",
  email: "",
  branchId: "",
  subValue: "",
  sectorManual: "",
  brand: "",
  legalForm: "",
  materials: "",
  companySummary: "",
  selectedIl: "",
  selectedIlce: "",
  fullAddress: "",
  contact: "",
  preferredContact: "",
  website: "",
  whatsappUrl: "",
  linkedInUrl: "",
  xUrl: "",
  instagramUrl: "",
  facebookUrl: "",
  youtubeUrl: "",
  tiktokUrl: "",
  employeeCount: "",
  yearsInBusiness: "",
  howHeard: "",
  referenceContact: "",
  notes: "",
  kvkkAccepted: false,
});

export function MembershipForm() {
  const [fullName, setFullName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [email, setEmail] = useState("");
  const [branchId, setBranchId] = useState("");
  const [subValue, setSubValue] = useState("");
  const [sectorManual, setSectorManual] = useState("");
  const [brand, setBrand] = useState("");
  const [legalForm, setLegalForm] = useState("");
  const [materials, setMaterials] = useState("");
  const [materialsNone, setMaterialsNone] = useState(false);
  const [companySummary, setCompanySummary] = useState("");
  const [selectedIl, setSelectedIl] = useState("");
  const [selectedIlce, setSelectedIlce] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [contact, setContact] = useState("");
  const [preferredContact, setPreferredContact] = useState("");
  const [website, setWebsite] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [xUrl, setXUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [extraSocialPairs, setExtraSocialPairs] = useState<{ platform: string; url: string }[]>([]);
  const [extraPlatformPick, setExtraPlatformPick] = useState("");
  const [extraUrlDraft, setExtraUrlDraft] = useState("");
  const [extraSocialHint, setExtraSocialHint] = useState<string | null>(null);
  const [employeeCount, setEmployeeCount] = useState("");
  const [yearsInBusiness, setYearsInBusiness] = useState("");
  const [howHeard, setHowHeard] = useState("");
  const [referenceContact, setReferenceContact] = useState("");
  const [notes, setNotes] = useState("");
  const [kvkkAccepted, setKvkkAccepted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [issues, setIssues] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);

  const subOptions = useMemo(
    () => SECTOR_BRANCHES.find((b) => b.id === branchId)?.subsectors ?? [],
    [branchId],
  );

  const ilceOptions = useMemo(() => ilcelerFor(selectedIl), [selectedIl]);

  function applyInitialState() {
    const s = initialFormState();
    setFullName(s.fullName);
    setJobTitle(s.jobTitle);
    setEmail(s.email);
    setBranchId(s.branchId);
    setSubValue(s.subValue);
    setSectorManual(s.sectorManual);
    setBrand(s.brand);
    setLegalForm(s.legalForm);
    setMaterials(s.materials);
    setMaterialsNone(false);
    setCompanySummary(s.companySummary);
    setSelectedIl(s.selectedIl);
    setSelectedIlce(s.selectedIlce);
    setFullAddress(s.fullAddress);
    setContact(s.contact);
    setPreferredContact(s.preferredContact);
    setWebsite(s.website);
    setWhatsappUrl(s.whatsappUrl);
    setLinkedInUrl(s.linkedInUrl);
    setXUrl(s.xUrl);
    setInstagramUrl(s.instagramUrl);
    setFacebookUrl(s.facebookUrl);
    setYoutubeUrl(s.youtubeUrl);
    setTiktokUrl(s.tiktokUrl);
    setExtraSocialPairs([]);
    setExtraPlatformPick("");
    setExtraUrlDraft("");
    setExtraSocialHint(null);
    setEmployeeCount(s.employeeCount);
    setYearsInBusiness(s.yearsInBusiness);
    setHowHeard(s.howHeard);
    setReferenceContact(s.referenceContact);
    setNotes(s.notes);
    setKvkkAccepted(s.kvkkAccepted);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIssues([]);
    setFallbackUrl(null);

    const sectorStr = buildSectorField(branchId, subValue, sectorManual);
    if (!sectorStr) {
      if (!branchId || !subValue) {
        setIssues(["Ana sektör ve alt dal alanlarının doldurulması zorunludur."]);
      } else if (subValue === "manuel-sektor") {
        setIssues([
          "«Listede yer almıyor — metin ile belirtilecek» seçeneği işaretlendiğinde, faaliyet alanınızı açıklama kutusuna en az üç karakter olacak şekilde yazınız.",
        ]);
      } else {
        setIssues(["Sektör seçimi geçersizdir; lütfen formu yeniden kontrol ediniz."]);
      }
      return;
    }

    if (!materialsNone && materials.trim().length < 3) {
      setIssues([
        "Hammadde ve ihtiyaç alanları metin olarak açıklanmalı veya «İlgili girdi bildirilmeyecek (Yok)» seçeneği işaretlenmelidir.",
      ]);
      return;
    }

    const materialsPayload = materialsNone ? "Yok" : materials.trim();
    const location =
      selectedIl && selectedIlce ? `${selectedIl} — ${selectedIlce}` : "";
    const socialOtherPayload = extraSocialPairs.map((p) => `${p.platform}: ${p.url}`).join("\n");

    setLoading(true);
    try {
      const legalEntry = LEGAL_FORMS.find((x) => x.value === legalForm);
      const legalFormPayload = legalForm && legalEntry ? legalEntry.label : "";
      const res = await fetch("/api/kayit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          jobTitle,
          email,
          sector: sectorStr,
          brand,
          legalForm: legalFormPayload,
          materials: materialsPayload,
          companySummary,
          location,
          fullAddress,
          contact,
          preferredContact,
          website,
          whatsappUrl,
          linkedInUrl,
          xUrl,
          instagramUrl,
          facebookUrl,
          youtubeUrl,
          tiktokUrl,
          socialOther: socialOtherPayload,
          employeeCount,
          yearsInBusiness,
          howHeard,
          referenceContact,
          notes,
          kvkkAccepted,
        }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        issues?: string[];
        formUrl?: string;
        message?: string;
      };

      if (res.status === 400 && data.issues?.length) {
        setIssues(data.issues);
        return;
      }

      if (res.status === 503 && data.formUrl) {
        setIssues([data.message ?? "Başvuru sunucuya iletilemedi."]);
        setFallbackUrl(data.formUrl);
        return;
      }

      if (!res.ok || !data.ok) {
        setIssues(["İşlem tamamlanamadı. Lütfen daha sonra yeniden deneyiniz veya destek kanallarına başvurunuz."]);
        return;
      }

      setDone(true);
      applyInitialState();
    } catch {
      setIssues(["Sunucu ile iletişim kurulamadı. Ağ bağlantınızı kontrol ediniz."]);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center shadow-sm">
        <p className="text-lg font-semibold text-[var(--foreground)]">Başvurunuz kayıt altına alınmıştır</p>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Verileriniz güvenli şekilde işlenmektedir. İnceleme ve onay süreçleri tamamlandığında, bilgileriniz üye
          kataloğunda yayımlanabilir hale gelir.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-[var(--accent)] px-8 py-3 text-sm font-semibold text-black"
        >
          Ana sayfaya dönüş
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-8">
      <FormSection
        title="Başvuru sahibi"
        hint="Üyelik başvurusunu yürüten kişi ve öncelikli iletişim bilgileri."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--foreground)]">
            Adı ve soyadı <span className="text-red-600 dark:text-red-400">*</span>
            <input
              className={inputClass}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              required
              placeholder="Ad ve soyad"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--foreground)]">
            Görev, ünvan veya rol <span className="text-red-600 dark:text-red-400">*</span>
            <input
              className={inputClass}
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              autoComplete="organization-title"
              required
              placeholder="Örnek: Genel müdür, proje yöneticisi, kurucu ortak"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--foreground)] sm:col-span-2">
            Kurumsal veya kişisel e-posta <span className="text-red-600 dark:text-red-400">*</span>
            <input
              className={inputClass}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              placeholder="ornek@alanadi.com"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--foreground)]">
            İletişim telefonu <span className="text-red-600 dark:text-red-400">*</span>
            <input
              className={inputClass}
              type="tel"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              autoComplete="tel"
              required
              placeholder="Ülke / alan kodu ile birlikte"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--foreground)]">
            Öncelikli iletişim kanalı
            <select
              className={selectClass}
              value={preferredContact}
              onChange={(e) => setPreferredContact(e.target.value)}
            >
              {PREFERRED_CONTACT.map((p) => (
                <option key={p.value || "empty"} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </FormSection>

      <FormSection title="Kurum ve faaliyet" hint="Şirket veya markanızın tanımı ve sınıflaması.">
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--foreground)] sm:col-span-2">
            Marka veya ticari unvan <span className="text-red-600 dark:text-red-400">*</span>
            <input
              className={inputClass}
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder='Tüzel kişilik yoksa "Bağımsız" olarak belirtebilirsiniz'
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--foreground)] sm:col-span-2">
            Hukuki statü
            <select className={selectClass} value={legalForm} onChange={(e) => setLegalForm(e.target.value)}>
              {LEGAL_FORMS.map((l) => (
                <option key={l.value || "empty"} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-4 sm:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-[var(--foreground)]">
                Üst sektör grubu <span className="text-red-600 dark:text-red-400">*</span>
                <select
                  className={selectClass}
                  value={branchId}
                  onChange={(e) => {
                    setBranchId(e.target.value);
                    setSubValue("");
                    setSectorManual("");
                  }}
                  required
                >
                  <option value="">Seçiniz</option>
                  {SECTOR_BRANCHES.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-[var(--foreground)]">
                Alt faaliyet alanı <span className="text-red-600 dark:text-red-400">*</span>
                <select
                  className={selectClass}
                  value={subValue}
                  onChange={(e) => {
                    setSubValue(e.target.value);
                    if (e.target.value !== "manuel-sektor") setSectorManual("");
                  }}
                  required
                  disabled={!branchId}
                >
                  <option value="">
                    {branchId ? "Alt faaliyet alanını seçiniz" : "Önce üst sektör grubunu seçiniz"}
                  </option>
                  {subOptions.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="text-xs text-[var(--muted)]">
              Faaliyetinizin bağlı olduğu endüstri veya sanayi sınıflaması: önce üst grup, ardından ilgili alt alan
              seçilmelidir.
            </p>
            {subValue === "manuel-sektor" ? (
              <label className="flex flex-col gap-2 text-sm font-medium text-[var(--foreground)]">
                Faaliyet alanı (metin) <span className="text-red-600 dark:text-red-400">*</span>
                <textarea
                  className={`${inputClass} min-h-[88px] resize-y`}
                  value={sectorManual}
                  onChange={(e) => setSectorManual(e.target.value)}
                  placeholder="Örnek: endüstriyel robotik servisi, özel öğretim ve koçluk hizmetleri…"
                />
              </label>
            ) : null}
          </div>

          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--foreground)] sm:col-span-2">
            Kurum ve faaliyet özeti <span className="text-red-600 dark:text-red-400">*</span>
            <textarea
              className={`${inputClass} min-h-[100px] resize-y`}
              value={companySummary}
              onChange={(e) => setCompanySummary(e.target.value)}
              required
              placeholder="Kuruluşunuzun ne yaptığını, hedef kitlenizi ve temel değer önerinizi kısaca anlatınız (en az birkaç tam cümle)."
            />
          </label>
          <div className="flex flex-col gap-3 sm:col-span-2">
            <span className="text-sm font-medium text-[var(--foreground)]">
              Hammadde ve ihtiyaç duyulan alanlar <span className="text-red-600 dark:text-red-400">*</span>
            </span>
            <label className="flex cursor-pointer items-start gap-3 rounded-md border border-[var(--card-border)] bg-[var(--input-bg)]/80 px-4 py-3 text-sm text-[var(--foreground)] transition hover:border-[var(--accent)]/35">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--card-border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                checked={materialsNone}
                onChange={(e) => {
                  const on = e.target.checked;
                  setMaterialsNone(on);
                  if (on) setMaterials("");
                }}
              />
              <span>
                İlgili girdi veya hammadde <strong className="font-semibold">bildirilmeyecek</strong>{" "}
                <span className="text-[var(--muted)]">(Yok)</span>
              </span>
            </label>
            {!materialsNone ? (
              <textarea
                className={`${inputClass} min-h-[100px] resize-y`}
                value={materials}
                onChange={(e) => setMaterials(e.target.value)}
                required
                placeholder="Faaliyetinizi sürdürmek için ihtiyaç duyduğunuz girdiler, hizmetler veya tamamlayıcı sektörler"
              />
            ) : (
              <p className="text-xs text-[var(--muted)]">
                Bu seçenek işaretliyken alan kataloğa <span className="font-medium text-[var(--foreground)]/80">Yok</span>{" "}
                olarak iletilir; ayrıntılı metin girmeniz gerekmez.
              </p>
            )}
          </div>

          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--foreground)]">
            Tahmini çalışan sayısı
            <select className={selectClass} value={employeeCount} onChange={(e) => setEmployeeCount(e.target.value)}>
              {EMPLOYEE_RANGES.map((r) => (
                <option key={r.value || "empty"} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--foreground)]">
            Faaliyet süresi
            <input
              className={inputClass}
              value={yearsInBusiness}
              onChange={(e) => setYearsInBusiness(e.target.value)}
              placeholder="Örnek: 3 yıl, 2019’dan beri"
            />
          </label>
        </div>
      </FormSection>

      <FormSection title="Konum ve adres" hint="Yayımlandığında katalogda gösterilecek coğrafi bilgi.">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2 sm:max-w-2xl">
            <label className="flex flex-col gap-2 text-sm font-medium text-[var(--foreground)]">
              İl <span className="text-red-600 dark:text-red-400">*</span>
              <select
                className={selectClass}
                value={selectedIl}
                required
                onChange={(e) => {
                  setSelectedIl(e.target.value);
                  setSelectedIlce("");
                }}
              >
                <option value="">İl seçiniz</option>
                {ILLER.map((il) => (
                  <option key={il} value={il}>
                    {il}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-[var(--foreground)]">
              İlçe <span className="text-red-600 dark:text-red-400">*</span>
              <select
                className={selectClass}
                value={selectedIlce}
                required
                disabled={!selectedIl}
                onChange={(e) => setSelectedIlce(e.target.value)}
              >
                <option value="">{selectedIl ? "İlçe seçiniz" : "Önce il seçiniz"}</option>
                {ilceOptions.map((ilce) => (
                  <option key={ilce} value={ilce}>
                    {ilce}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="text-xs text-[var(--muted)] sm:col-span-2">
            Konum metni katalogda «İl — İlçe» biçiminde gösterilir (Türkiye il ve ilçe listesi).
          </p>
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--foreground)] sm:col-span-2">
            Açık adres <span className="font-normal text-[var(--muted)]">(opsiyonel)</span>
            <textarea
              className={`${inputClass} min-h-[88px] resize-y`}
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
              placeholder="Mahalle, sokak, bina no; yalnızca gönüllü paylaşım için"
            />
          </label>
        </div>
      </FormSection>

      <FormSection
        title="Dijital görünürlük"
        hint="Web sitesi, WhatsApp ve sosyal medya profillerinizin tam URL’lerini giriniz."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--foreground)] sm:col-span-2">
            Kurumsal web sitesi <span className="font-normal text-[var(--muted)]">(opsiyonel)</span>
            <input
              className={inputClass}
              type="url"
              inputMode="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://www.ornek.com"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--foreground)]">
            LinkedIn
            <input
              className={inputClass}
              type="url"
              inputMode="url"
              value={linkedInUrl}
              onChange={(e) => setLinkedInUrl(e.target.value)}
              placeholder="https://www.linkedin.com/in/… veya /company/…"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--foreground)]">
            X (Twitter)
            <input
              className={inputClass}
              type="url"
              inputMode="url"
              value={xUrl}
              onChange={(e) => setXUrl(e.target.value)}
              placeholder="https://x.com/…"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--foreground)]">
            Instagram
            <input
              className={inputClass}
              type="url"
              inputMode="url"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://www.instagram.com/…"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--foreground)]">
            Facebook
            <input
              className={inputClass}
              type="url"
              inputMode="url"
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
              placeholder="https://www.facebook.com/…"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--foreground)]">
            YouTube
            <input
              className={inputClass}
              type="url"
              inputMode="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/@…"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--foreground)]">
            TikTok
            <input
              className={inputClass}
              type="url"
              inputMode="url"
              value={tiktokUrl}
              onChange={(e) => setTiktokUrl(e.target.value)}
              placeholder="https://www.tiktok.com/@…"
            />
          </label>
          <div className="flex flex-col gap-3 sm:col-span-2">
            <span className="text-sm font-medium text-[var(--foreground)]">
              Diğer sosyal veya sektörel profiller{" "}
              <span className="font-normal text-[var(--muted)]">(opsiyonel)</span>
            </span>
            <p className="text-xs text-[var(--muted)]">
              Platform seçin, bağlantıyı girin ve «Ekle» ile listeye ekleyin.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="flex min-w-0 flex-1 flex-col gap-2 text-sm font-medium text-[var(--foreground)]">
                Platform
                <select
                  className={selectClass}
                  value={extraPlatformPick}
                  onChange={(e) => {
                    setExtraPlatformPick(e.target.value);
                    setExtraSocialHint(null);
                  }}
                >
                  {EXTRA_SOCIAL_PLATFORM_OPTIONS.map((o) => (
                    <option key={o.value || "placeholder"} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex min-w-0 flex-[2] flex-col gap-2 text-sm font-medium text-[var(--foreground)]">
                Profil bağlantısı
                <input
                  className={inputClass}
                  type="url"
                  inputMode="url"
                  value={extraUrlDraft}
                  onChange={(e) => {
                    setExtraUrlDraft(e.target.value);
                    setExtraSocialHint(null);
                  }}
                  placeholder="https://…"
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  setExtraSocialHint(null);
                  if (!extraPlatformPick) {
                    setExtraSocialHint("Önce platform seçiniz.");
                    return;
                  }
                  const u = extraUrlDraft.trim();
                  const ok =
                    /^https?:\/\//i.test(u) ||
                    (/^[\w.-]+\.[a-z]{2,}([\w./?#&=%+~,-]*)?$/i.test(u) && !/\s/.test(u));
                  if (!ok) {
                    setExtraSocialHint("Geçerli bir bağlantı giriniz (ör. https://… veya ornek.com).");
                    return;
                  }
                  if (extraSocialPairs.length >= 20) {
                    setExtraSocialHint("En fazla 20 ek profil eklenebilir.");
                    return;
                  }
                  const platformLabel =
                    EXTRA_SOCIAL_PLATFORM_OPTIONS.find((o) => o.value === extraPlatformPick)?.label ??
                    extraPlatformPick;
                  setExtraSocialPairs((prev) => [...prev, { platform: platformLabel, url: u }]);
                  setExtraUrlDraft("");
                }}
                className="shrink-0 rounded-xl border border-[var(--card-border)] bg-[var(--input-bg)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
              >
                Ekle
              </button>
            </div>
            {extraSocialHint ? (
              <p className="text-xs text-amber-700 dark:text-amber-300" role="status">
                {extraSocialHint}
              </p>
            ) : null}
            {extraSocialPairs.length > 0 ? (
              <ul className="space-y-2 rounded-xl border border-[var(--card-border)] bg-[var(--input-bg)]/60 p-3">
                {extraSocialPairs.map((row, i) => (
                  <li
                    key={`${row.platform}-${i}-${row.url}`}
                    className="flex flex-wrap items-center justify-between gap-2 text-sm"
                  >
                    <span className="text-[var(--muted)]">{row.platform}</span>
                    <span className="min-w-0 flex-1 truncate font-medium text-[var(--foreground)]" title={row.url}>
                      {row.url}
                    </span>
                    <button
                      type="button"
                      className="shrink-0 text-xs font-semibold text-red-600 hover:underline dark:text-red-400"
                      onClick={() => setExtraSocialPairs((prev) => prev.filter((_, j) => j !== i))}
                    >
                      Kaldır
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--foreground)] sm:col-span-2">
            WhatsApp bağlantısı <span className="font-normal text-[var(--muted)]">(opsiyonel)</span>
            <input
              className={inputClass}
              type="url"
              inputMode="url"
              value={whatsappUrl}
              onChange={(e) => setWhatsappUrl(e.target.value)}
              placeholder="https://wa.me/905XXXXXXXXXX"
            />
          </label>
        </div>
      </FormSection>

      <FormSection title="Ek bilgiler" hint="Üyelik değerlendirmesine yardımcı olacak isteğe bağlı alanlar.">
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--foreground)] sm:col-span-2">
            Türk Tudun’u nereden duydunuz? <span className="font-normal text-[var(--muted)]">(opsiyonel)</span>
            <input
              className={inputClass}
              value={howHeard}
              onChange={(e) => setHowHeard(e.target.value)}
              placeholder="Örnek: referans üye, etkinlik, sosyal medya, arama motoru"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--foreground)] sm:col-span-2">
            Gösterebileceğiniz referans (kişi veya kurum){" "}
            <span className="font-normal text-[var(--muted)]">(opsiyonel)</span>
            <input
              className={inputClass}
              value={referenceContact}
              onChange={(e) => setReferenceContact(e.target.value)}
              placeholder="İsim, kurum ve iletişim — yalnızca onayınızla paylaşılır"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--foreground)] sm:col-span-2">
            Ek notlar ve özel durumlar <span className="font-normal text-[var(--muted)]">(opsiyonel)</span>
            <textarea
              className={`${inputClass} min-h-[100px] resize-y`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Birden fazla şube, ortaklık yapısı, yaklaşan lansman vb."
            />
          </label>
        </div>
      </FormSection>

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[var(--card-border)] bg-[var(--card-elevated)] p-4 text-sm dark:bg-[var(--card)]">
        <input
          type="checkbox"
          checked={kvkkAccepted}
          onChange={(e) => setKvkkAccepted(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 rounded border-[var(--card-border)] text-[var(--accent)] focus:ring-[var(--accent)]"
        />
        <span className="text-[var(--foreground)]">
          <span className="text-red-600 dark:text-red-400">*</span> Kişisel verilerimin, üyelik başvurusunun
          değerlendirilmesi ve iletişim amaçlarıyla; KVKK ve kurum politikaları çerçevesinde işlenmesine{" "}
          <strong>açık rıza gösteriyorum.</strong>
        </span>
      </label>

      {issues.length > 0 ? (
        <div
          className="rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-800 dark:text-red-200"
          role="alert"
        >
          <ul className="list-inside list-disc space-y-1">
            {issues.map((msg, i) => (
              <li key={`${i}-${msg}`}>{msg}</li>
            ))}
          </ul>
          {fallbackUrl ? (
            <p className="mt-3">
              Yedek başvuru kanalı:{" "}
              <a className="font-semibold underline" href={fallbackUrl} target="_blank" rel="noopener noreferrer">
                Google Form aracılığıyla iletiniz
              </a>
              .
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-[var(--accent)] px-8 py-3 text-sm font-semibold text-black shadow-sm transition hover:brightness-95 disabled:opacity-60"
        >
          {loading ? "İletiliyor…" : "Başvuruyu ilet"}
        </button>
        <Link
          href="/"
          className="rounded-full border border-[var(--card-border)] px-6 py-3 text-sm font-medium hover:border-[var(--accent)]"
        >
          İptal
        </Link>
      </div>

      <p className="text-xs text-[var(--muted)]">
        <span className="text-red-600 dark:text-red-400">*</span> ile işaretli alanların doldurulması zorunludur.
        Çevrimiçi başvurunun alınabilmesi için altyapıda Redis (Upstash) tanımlı olmalıdır; aksi halde yedek Google
        Form kullanılmalıdır.
      </p>
    </form>
  );
}

export function MembershipPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full bg-[var(--background)] text-[var(--foreground)] transition-colors">
      <header className="border-b border-[var(--card-border)] bg-[var(--header-bg)]">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-4 py-6">
          <div>
            <Link href="/" className="text-sm font-medium text-[var(--accent)] hover:underline">
              Ana sayfaya dönüş
            </Link>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">Üyelik başvuru formu</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">{TAGLINE}</p>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-10">{children}</main>
    </div>
  );
}
