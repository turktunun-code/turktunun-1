/** Üye kaydı: ana sektör ve alt dallar (Türkçe) */

export type SectorBranch = {
  id: string;
  label: string;
  subsectors: { value: string; label: string }[];
};

export const SECTOR_BRANCHES: SectorBranch[] = [
  {
    id: "hizmet",
    label: "Hizmet",
    subsectors: [
      { value: "turizm-konaklama", label: "Turizm ve konaklama" },
      { value: "egitim", label: "Eğitim ve özel öğretim" },
      { value: "saglik", label: "Sağlık ve sosyal hizmetler" },
      { value: "finans-sigorta", label: "Finans, bankacılık ve sigorta" },
      { value: "hukuk-danismanlik", label: "Hukuk ve mesleki danışmanlık" },
      { value: "medya-iletisim", label: "Medya, reklam ve iletişim" },
      { value: "etkinlik", label: "Etkinlik ve organizasyon" },
      { value: "temizlik-bakim", label: "Temizlik ve bakım hizmetleri" },
      { value: "guvenlik", label: "Özel güvenlik ve koruma" },
      { value: "ik-is", label: "İnsan kaynakları ve işe alım" },
      { value: "diger-hizmet", label: "Diğer (hizmet)" },
    ],
  },
  {
    id: "teknoloji",
    label: "Teknoloji",
    subsectors: [
      { value: "yazilim-it", label: "Yazılım ve bilgi teknolojileri" },
      { value: "donanim-elektronik", label: "Donanım ve elektronik" },
      { value: "siber-guvenlik", label: "Siber güvenlik" },
      { value: "veri-yapay-zeka", label: "Veri bilimi ve yapay zeka" },
      { value: "telekom", label: "Telekomünikasyon" },
      { value: "e-ticaret-altyapi", label: "E-tic ve dijital pazar altyapısı" },
      { value: "oyun-ux", label: "Oyun, UX ve dijital ürün" },
      { value: "diger-teknoloji", label: "Diğer (teknoloji)" },
    ],
  },
  {
    id: "sanayi-uretim",
    label: "Sanayi ve üretim",
    subsectors: [
      { value: "otomotiv", label: "Otomotiv ve yan sanayi" },
      { value: "makine-metal", label: "Makine, metal ve işleme" },
      { value: "kimya", label: "Kimya, plastik ve petrokimya" },
      { value: "tekstil-moda", label: "Tekstil, hazır giyim ve moda" },
      { value: "gida-icecek", label: "Gıda ve içecek üretimi" },
      { value: "mobilya-ahsap", label: "Mobilya, ahşap ve dekorasyon" },
      { value: "enerji", label: "Enerji ve yenilenebilir kaynaklar" },
      { value: "savunma", label: "Savunma sanayi ve havacılık" },
      { value: "diger-sanayi", label: "Diğer (sanayi)" },
    ],
  },
  {
    id: "insaat-gayrimenkul",
    label: "İnşaat ve gayrimenkul",
    subsectors: [
      { value: "muteahhitlik", label: "İnşaat müteahhitlik" },
      { value: "mimarlik-muhendislik", label: "Mimarlık ve mühendislik" },
      { value: "elektrik-mekanik", label: "Elektrik, mekanik ve HVAC" },
      { value: "yapi-malzeme", label: "Yapı malzemeleri ve market" },
      { value: "emlak", label: "Gayrimenkul danışmanlığı ve emlak" },
      { value: "altyapi", label: "Altyapı ve üstyapı projeleri" },
      { value: "diger-insaat", label: "Diğer (inşaat)" },
    ],
  },
  {
    id: "ticaret-perakende",
    label: "Ticaret ve perakende",
    subsectors: [
      { value: "toptan", label: "Toptan ticaret" },
      { value: "perakende", label: "Perakende ve mağazacılık" },
      { value: "ithalat-ihracat", label: "İthalat, ihracat ve dış ticaret" },
      { value: "franchise", label: "Franchise ve dağıtım" },
      { value: "e-ticaret-isletme", label: "E-ticaret mağazası / pazaryeri satıcısı" },
      { value: "diger-ticaret", label: "Diğer (ticaret)" },
    ],
  },
  {
    id: "tarim-gida-zincir",
    label: "Tarım ve gıda zinciri",
    subsectors: [
      { value: "tarim-hayvancilik", label: "Tarım ve hayvancılık" },
      { value: "gida-isleme", label: "Gıda işleme ve paketleme" },
      { value: "su-urunleri", label: "Su ürünleri ve balıkçılık" },
      { value: "orman-ormancilik", label: "Orman ürünleri ve ahşap hammadde" },
      { value: "diger-tarim", label: "Diğer (tarım)" },
    ],
  },
  {
    id: "lojistik-ulasim",
    label: "Lojistik ve ulaştırma",
    subsectors: [
      { value: "karayolu", label: "Karayolu taşımacılığı" },
      { value: "deniz-hava", label: "Deniz ve hava kargo" },
      { value: "depo-antrepo", label: "Depolama, antrepo ve tedarik zinciri" },
      { value: "kurye-sehir", label: "Şehir içi dağıtım ve kurye" },
      { value: "diger-lojistik", label: "Diğer (lojistik)" },
    ],
  },
  {
    id: "sanat-kultur-medya",
    label: "Sanat, kültür ve yayıncılık",
    subsectors: [
      { value: "yayincilik", label: "Basılı ve dijital yayıncılık" },
      { value: "icerik-uretim", label: "İçerik üretimi ve prodüksiyon" },
      { value: "tasarim-yaratici", label: "Tasarım ve yaratıcı endüstriler" },
      { value: "muzik-sahne", label: "Müzik, sahne ve etkinlik sanatları" },
      { value: "diger-sanat", label: "Diğer (kültür / medya)" },
    ],
  },
  {
    id: "diger",
    label: "Diğer",
    subsectors: [
      { value: "cok-sektorlu", label: "Çok sektörlü / holding yapısı" },
      { value: "kamu-stk", label: "Kamu, STK ve sivil toplum" },
      { value: "cevre-surdurulebilirlik", label: "Çevre ve sürdürülebilirlik" },
      { value: "manuel-sektor", label: "Listede yer almıyor — metin ile tanımlanacak" },
    ],
  },
];

/** Sunucu ve katalogda saklanacak tek satırlık metin */
export function formatSectorSelection(branchLabel: string, subLabel: string): string {
  return `${branchLabel} › ${subLabel}`;
}

/**
 * İstemciden gelen seçimlerden `sector` alanı metnini üretir.
 * Geçersizse null döner.
 */
export function buildSectorField(
  branchId: string,
  subValue: string,
  manualNote: string,
): string | null {
  const branch = SECTOR_BRANCHES.find((b) => b.id === branchId);
  if (!branch) return null;
  const sub = branch.subsectors.find((s) => s.value === subValue);
  if (!sub) return null;
  if (subValue === "manuel-sektor") {
    const t = manualNote.trim();
    if (t.length < 3) return null;
    return `Diğer › ${t}`;
  }
  return formatSectorSelection(branch.label, sub.label);
}
