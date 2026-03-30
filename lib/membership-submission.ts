export type MembershipFormPayload = {
  fullName: string;
  jobTitle: string;
  email: string;
  sector: string;
  brand: string;
  legalForm: string;
  materials: string;
  companySummary: string;
  location: string;
  fullAddress: string;
  contact: string;
  preferredContact: string;
  website: string;
  whatsappUrl: string;
  linkedInUrl: string;
  xUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  tiktokUrl: string;
  socialOther: string;
  employeeCount: string;
  yearsInBusiness: string;
  howHeard: string;
  referenceContact: string;
  notes: string;
  kvkkAccepted: boolean;
};

const limits = {
  fullName: 200,
  jobTitle: 120,
  email: 254,
  sector: 1000,
  brand: 200,
  legalForm: 80,
  materials: 2000,
  companySummary: 4000,
  location: 300,
  fullAddress: 500,
  contact: 80,
  preferredContact: 40,
  website: 500,
  whatsappUrl: 500,
  linkedInUrl: 500,
  xUrl: 500,
  instagramUrl: 500,
  facebookUrl: 500,
  youtubeUrl: 500,
  tiktokUrl: 500,
  socialOther: 2000,
  employeeCount: 40,
  yearsInBusiness: 40,
  howHeard: 500,
  referenceContact: 500,
  notes: 4000,
} as const;

const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clip(s: string, max: number): string {
  return s.trim().slice(0, max);
}

function optionalUrlHint(value: string, label: string): string | null {
  const v = value.trim();
  if (!v) return null;
  const ok =
    /^https?:\/\//i.test(v) ||
    (/^[\w.-]+\.[a-z]{2,}([\w./?#&=%+~,-]*)?$/i.test(v) && !/\s/.test(v));
  if (!ok) return `${label} geçerli bir adres biçiminde olmalıdır (ör. https://… veya ornek.com).`;
  return null;
}

/** Eski istemciler «digitalContact» gönderiyorsa WhatsApp alanına taşınır. */
function readLegacyString(raw: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = raw[k];
    if (typeof v === "string" && v.trim()) return v;
  }
  return "";
}

export function parseMembershipBody(raw: unknown):
  | { ok: true; data: MembershipFormPayload }
  | { ok: false; issues: string[] } {
  if (!raw || typeof raw !== "object") {
    return { ok: false, issues: ["İstek verisi geçersiz biçimdedir."] };
  }

  const o = raw as Record<string, unknown>;
  const str = (k: string) => (typeof o[k] === "string" ? o[k] : typeof o[k] === "number" ? String(o[k]) : "");

  const fullName = clip(str("fullName"), limits.fullName);
  const jobTitle = clip(str("jobTitle"), limits.jobTitle);
  const email = clip(str("email"), limits.email).toLowerCase();
  const sector = clip(str("sector"), limits.sector);
  const brand = clip(str("brand"), limits.brand);
  const legalForm = clip(str("legalForm"), limits.legalForm);
  const materials = clip(str("materials"), limits.materials);
  const companySummary = clip(str("companySummary"), limits.companySummary);
  const location = clip(str("location"), limits.location);
  const fullAddress = clip(str("fullAddress"), limits.fullAddress);
  const contact = clip(str("contact"), limits.contact);
  const preferredContact = clip(str("preferredContact"), limits.preferredContact);
  const website = clip(str("website"), limits.website);
  const whatsappUrl = clip(
    str("whatsappUrl") || readLegacyString(o, ["digitalContact"]),
    limits.whatsappUrl,
  );
  const linkedInUrl = clip(str("linkedInUrl"), limits.linkedInUrl);
  const xUrl = clip(str("xUrl"), limits.xUrl);
  const instagramUrl = clip(str("instagramUrl"), limits.instagramUrl);
  const facebookUrl = clip(str("facebookUrl"), limits.facebookUrl);
  const youtubeUrl = clip(str("youtubeUrl"), limits.youtubeUrl);
  const tiktokUrl = clip(str("tiktokUrl"), limits.tiktokUrl);
  const socialOther = clip(str("socialOther"), limits.socialOther);
  const employeeCount = clip(str("employeeCount"), limits.employeeCount);
  const yearsInBusiness = clip(str("yearsInBusiness"), limits.yearsInBusiness);
  const howHeard = clip(str("howHeard"), limits.howHeard);
  const referenceContact = clip(str("referenceContact"), limits.referenceContact);
  const notes = clip(str("notes"), limits.notes);
  const kvkkAccepted = o.kvkkAccepted === true;

  const issues: string[] = [];
  if (fullName.length < 2) issues.push("Ad ve soyad en az iki karakter olmalıdır.");
  if (jobTitle.length < 2) issues.push("Görev veya ünvan bilgisi en az iki karakter olmalıdır.");
  if (!emailRx.test(email)) issues.push("Geçerli bir kurumsal veya kişisel e-posta adresi girilmelidir.");
  if (sector.length < 3) issues.push("Sektör veya faaliyet alanı bilgisi zorunludur.");
  if (brand.length < 1) issues.push("Marka veya ticari unvan alanı zorunludur.");
  if (materials.length < 3) issues.push("Hammadde Ve ihtiyaç alanları açıklanmalıdır.");
  if (companySummary.length < 20) {
    issues.push("Kurum ve faaliyet özeti en az yirmi karakter olmalıdır.");
  }
  if (location.length < 2) issues.push("İl ve ilçe bilgisi zorunludur.");
  if (contact.length < 5) issues.push("Geçerli bir iletişim telefonu girilmelidir.");
  if (!kvkkAccepted) {
    issues.push("Kişisel verilerin işlenmesine ilişkin açık rıza onayı işaretlenmelidir.");
  }

  const wErr = optionalUrlHint(website, "Kurumsal web sitesi");
  if (wErr) issues.push(wErr);
  const waErr = optionalUrlHint(whatsappUrl, "WhatsApp bağlantısı");
  if (waErr) issues.push(waErr);
  for (const [val, lab] of [
    [linkedInUrl, "LinkedIn"],
    [xUrl, "X (Twitter)"],
    [instagramUrl, "Instagram"],
    [facebookUrl, "Facebook"],
    [youtubeUrl, "YouTube"],
    [tiktokUrl, "TikTok"],
  ] as const) {
    const e = optionalUrlHint(val, lab);
    if (e) issues.push(e);
  }

  if (socialOther) {
    for (const line of socialOther.split("\n")) {
      const t = line.trim();
      if (!t) continue;
      const urlPart = t.includes(": ") ? t.split(": ").slice(1).join(": ").trim() : t;
      const e = optionalUrlHint(urlPart, "Ek sosyal profil bağlantısı");
      if (e) issues.push(e);
    }
  }

  if (issues.length) return { ok: false, issues };

  return {
    ok: true,
    data: {
      fullName,
      jobTitle,
      email,
      sector,
      brand,
      legalForm,
      materials,
      companySummary,
      location,
      fullAddress,
      contact,
      preferredContact,
      website: website.trim(),
      whatsappUrl: whatsappUrl.trim(),
      linkedInUrl: linkedInUrl.trim(),
      xUrl: xUrl.trim(),
      instagramUrl: instagramUrl.trim(),
      facebookUrl: facebookUrl.trim(),
      youtubeUrl: youtubeUrl.trim(),
      tiktokUrl: tiktokUrl.trim(),
      socialOther,
      employeeCount,
      yearsInBusiness,
      howHeard,
      referenceContact,
      notes,
      kvkkAccepted,
    },
  };
}
