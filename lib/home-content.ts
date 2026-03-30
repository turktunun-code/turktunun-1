export type HomeNewsItem = {
  id: string;
  date: string;
  title: string;
  excerpt: string;
};

export type HomeBlogItem = {
  id: string;
  date: string;
  title: string;
  excerpt: string;
  readMinutes: number;
};

/** Düzenleme: içerikleri buradan güncelleyebilirsiniz. */
export const HOME_NEWS: HomeNewsItem[] = [
  {
    id: "n1",
    date: "2026-03-28",
    title: "Türk Tudun dijital kataloğu güncellendi",
    excerpt:
      "Üye yayımlama süreçleri ve katalog gezinmesi iyileştirildi. Onaylı kayıtlar kamuya açık listede yer almaya devam eder.",
  },
  {
    id: "n2",
    date: "2026-03-15",
    title: "Yeni üyelik başvuru formu",
    excerpt:
      "Başvurular tek form üzerinden toplanıyor; sektör, konum ve dijital görünürlük alanları netleştirildi.",
  },
  {
    id: "n3",
    date: "2026-03-01",
    title: "Sektör temelli arama",
    excerpt:
      "Katalogda sektör seçimi ve metin araması birlikte kullanılabilir; ihtiyaç yönelimi ayrı sonuç sayfasında da sunulur.",
  },
];

export const HOME_BLOG: HomeBlogItem[] = [
  {
    id: "b1",
    date: "2026-03-20",
    title: "Ticaret hanı geleneği ve dijital görünürlük",
    excerpt:
      "Kurumsal şeffaflık ve doğru iletişim kanallarının seçimi, güven oluşturmada kritik rol oynar.",
    readMinutes: 4,
  },
  {
    id: "b2",
    date: "2026-03-10",
    title: "Üye kataloğu nasıl kullanılır?",
    excerpt:
      "Anasayfadan duyuruları takip edebilir; katalogda isim, sektör veya konum ile arama yapabilirsiniz.",
    readMinutes: 3,
  },
];
