"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { AdminStats } from "@/lib/analytics";
import type { ApprovalStatus } from "@/lib/approvals";
import { AdminBlogEditor } from "@/components/AdminBlogEditor";
import { AdminNewsEditor } from "@/components/AdminNewsEditor";
import { DemandChatbot } from "@/components/DemandChatbot";
import { MemberEditModal, type MemberEditFields } from "@/components/MemberEditModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DEFAULT_CATALOG_LOGO } from "@/lib/constants";
import type { HomeBlogItem, HomeNewsItem } from "@/lib/home-content";

type MemberRow = {
  key: string;
  fullName: string;
  sector: string;
  brand: string;
  materials: string;
  location: string;
  contact: string;
  digitalContact: string;
  reference: string;
  rank: string;
  approval: ApprovalStatus;
};

type AdminNavTab = "haber" | "blog" | "uyeler" | "sistem";

const ADMIN_TABS: { id: AdminNavTab; label: string }[] = [
  { id: "haber", label: "Haber" },
  { id: "blog", label: "Blog" },
  { id: "uyeler", label: "Üyeler" },
  { id: "sistem", label: "Sistem" },
];

export function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [storageOk, setStorageOk] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [logoSaved, setLogoSaved] = useState<string | null>(null);
  const [memberFilter, setMemberFilter] = useState("");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [editMemberKey, setEditMemberKey] = useState<string | null>(null);
  const [editMemberInitial, setEditMemberInitial] = useState<MemberEditFields | null>(null);
  const [loadError, setLoadError] = useState("");
  const [activeTab, setActiveTab] = useState<AdminNavTab>("uyeler");
  const [homeNews, setHomeNews] = useState<HomeNewsItem[]>([]);
  const [homeBlog, setHomeBlog] = useState<HomeBlogItem[]>([]);
  const [homeNewsOverridden, setHomeNewsOverridden] = useState(false);
  const [homeBlogOverridden, setHomeBlogOverridden] = useState(false);
  const [homeContentCanSave, setHomeContentCanSave] = useState(false);
  const [membersFetchError, setMembersFetchError] = useState("");
  const [siteApplications, setSiteApplications] = useState<unknown[]>([]);
  const [siteApplicationsOk, setSiteApplicationsOk] = useState(false);

  const load = useCallback(async () => {
    setLoadError("");
    setMembersFetchError("");
    try {
      const [st, memRes, logoRes, hcRes, regRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/members"),
        fetch("/api/admin/settings/logo"),
        fetch("/api/admin/home-content"),
        fetch("/api/admin/registrations"),
      ]);

      if (st.status === 401) {
        router.replace("/admin/login");
        return;
      }

      if (hcRes.ok) {
        try {
          const hc = (await hcRes.json()) as {
            news: HomeNewsItem[];
            blog: HomeBlogItem[];
            newsOverridden?: boolean;
            blogOverridden?: boolean;
            canSave?: boolean;
          };
          setHomeNews(hc.news ?? []);
          setHomeBlog(hc.blog ?? []);
          setHomeNewsOverridden(!!hc.newsOverridden);
          setHomeBlogOverridden(!!hc.blogOverridden);
          setHomeContentCanSave(!!hc.canSave);
        } catch {
          setLoadError("Haber ve blog verisi okunamadı. Sayfayı yenileyin.");
        }
      }

      if (st.ok) {
        try {
          setStats(await st.json());
        } catch {
          setLoadError((prev) => prev || "İstatistikler okunamadı.");
        }
      }

      if (memRes.ok) {
        try {
          const m = (await memRes.json()) as { members: MemberRow[]; supabase?: boolean };
          setMembers(
            (m.members ?? []).map((row) => ({
              ...row,
              materials: row.materials ?? "",
              location: row.location ?? "",
              digitalContact: row.digitalContact ?? "",
              reference: row.reference ?? "",
              rank: row.rank ?? "",
            })),
          );
          setStorageOk(!!m.supabase);
        } catch {
          setMembersFetchError("Üye listesi yanıtı çözümlenemedi. Sayfayı yenileyin.");
        }
      } else {
        let detail = "";
        try {
          const errBody = (await memRes.json()) as { error?: string };
          if (errBody.error?.trim()) detail = ` ${errBody.error.trim()}`;
        } catch {
          /* yanıt gövdesi yok */
        }
        setMembersFetchError(
          memRes.status === 500
            ? `Üye listesi sunucuda oluşturulamadı.${detail || " Supabase bağlantısını kontrol edin."}`
            : `Üye listesi alınamadı (HTTP ${memRes.status}).${detail}`,
        );
      }

      if (logoRes.ok) {
        try {
          const l = (await logoRes.json()) as { url: string | null };
          setLogoUrl(l.url ?? "");
          setLogoSaved(l.url);
        } catch {
          /* logo yanıtı atlandı */
        }
      }

      if (regRes.ok) {
        try {
          const reg = (await regRes.json()) as { items?: unknown[]; supabase?: boolean };
          setSiteApplications(reg.items ?? []);
          setSiteApplicationsOk(!!reg.supabase);
        } catch {
          setSiteApplications([]);
        }
      } else {
        setSiteApplications([]);
      }
    } catch {
      setLoadError("Panel verileri yüklenemedi. Bağlantınızı kontrol ediniz.");
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  async function resetMemberOverlay() {
    if (
      !confirm(
        "Tüm üyeler «onaylı» ve «listedeki gizlilik» sıfırlanacak (Supabase’teki veri satırları silinmez). Devam?",
      )
    ) {
      return;
    }
    if (!confirm("Son kez onaylıyor musunuz?")) return;
    try {
      const res = await fetch("/api/admin/member-overlay-reset", { method: "POST" });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) {
        alert(j.error ?? "Sıfırlama başarısız.");
        return;
      }
      alert("Üye onay ve gizleme durumu sıfırlandı. Sayfa yenileniyor.");
      await load();
    } catch {
      alert("İstek başarısız.");
    }
  }

  async function saveLogo() {
    const res = await fetch("/api/admin/settings/logo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: logoUrl.trim() || null }),
    });
    if (!res.ok) {
      const j = (await res.json()) as { error?: string };
      alert(j.error ?? "Kayıt işlemi tamamlanamadı.");
      return;
    }
    const j = (await res.json()) as { url: string | null };
    setLogoSaved(j.url);
    setLogoUrl(j.url ?? "");
    alert("Kurumsal logo adresi kaydedildi. Katalog sayfası bu HTTPS adresinden görseli yükler.");
  }

  async function setApproval(key: string, status: ApprovalStatus) {
    setBusyKey(key);
    try {
      const res = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, status }),
      });
      let message: string | undefined;
      try {
        const j = (await res.json()) as { error?: string; ok?: boolean };
        message = j.error;
      } catch {
        message = res.statusText || undefined;
      }
      if (!res.ok) {
        alert(message ?? "İşlem tamamlanamadı.");
        return;
      }
      setMembers((prev) => prev.map((m) => (m.key === key ? { ...m, approval: status } : m)));
    } catch {
      alert("Sunucuya bağlanılamadı. Ağınızı veya oturumunuzu kontrol ediniz.");
    } finally {
      setBusyKey(null);
    }
  }

  async function removeMemberFromSite(key: string, displayLabel: string) {
    const label = displayLabel.trim() || "Bu kayıt";
    if (
      !confirm(
        `«${label}» bu sitede ve katalogda listelenmeyecek.\n\nVeritabanı satırı silinmez; yalnızca gizlenir. Onaylıyor musunuz?`,
      )
    ) {
      return;
    }
    setBusyKey(key);
    try {
      const res = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "exclude", key }),
      });
      let message: string | undefined;
      try {
        const j = (await res.json()) as { error?: string };
        message = j.error;
      } catch {
        message = res.statusText || undefined;
      }
      if (!res.ok) {
        alert(message ?? "İşlem tamamlanamadı.");
        return;
      }
      setMembers((prev) => prev.filter((m) => m.key !== key));
      setEditMemberKey((k) => (k === key ? null : k));
    } catch {
      alert("Sunucuya bağlanılamadı. Ağınızı veya oturumunuzu kontrol ediniz.");
    } finally {
      setBusyKey(null);
    }
  }

  const maxPv = Math.max(1, ...(stats?.dailyPv.map((d) => d.count) ?? [1]));

  const filteredMembers = members.filter((m) => {
    const q = memberFilter.trim().toLowerCase();
    if (!q) return true;
    return (
      m.fullName.toLowerCase().includes(q) ||
      m.sector.toLowerCase().includes(q) ||
      m.brand.toLowerCase().includes(q) ||
      m.contact.toLowerCase().includes(q) ||
      m.materials.toLowerCase().includes(q) ||
      m.location.toLowerCase().includes(q) ||
      m.digitalContact.toLowerCase().includes(q) ||
      m.rank.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
      <DemandChatbot />
      <header className="sticky top-0 z-10 border-b border-[var(--card-border)] bg-[var(--header-bg)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={DEFAULT_CATALOG_LOGO}
              alt=""
              width={44}
              height={44}
              className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-[var(--accent)]/40"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Yönetim konsolu</p>
              <h1 className="text-xl font-bold tracking-tight">Türk Tudun · Kontrol paneli</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ThemeToggle />
            <Link
              href="/anasayfa"
              className="rounded-full border border-[var(--card-border)] px-4 py-2 text-sm font-medium transition hover:border-[var(--accent)]"
            >
              Kamuya açık site
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-black"
            >
              Oturumu kapat
            </button>
          </div>
        </div>
      </header>

      <nav
        className="border-b border-[var(--card-border)] bg-[var(--header-bg)]/90"
        aria-label="Yönetim bölümleri"
      >
        <div className="mx-auto max-w-6xl px-4">
          <ul className="flex flex-wrap gap-1 py-2">
            {ADMIN_TABS.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    activeTab === t.id
                      ? "bg-[var(--accent)] text-black"
                      : "text-[var(--muted)] hover:bg-[var(--card-border)]/40 hover:text-[var(--foreground)]"
                  }`}
                >
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl space-y-10 px-4 py-10">
        {loadError ? (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm">{loadError}</p>
        ) : null}

        {activeTab === "sistem" && !stats?.supabaseConfigured ? (
          <div
            className="rounded-2xl border border-amber-500/35 bg-amber-500/10 px-5 py-4 text-sm text-[var(--foreground)]"
            role="status"
          >
            <strong className="font-semibold">Supabase bağlantısı bulunmamaktadır.</strong> Üye verisi, analitik,
            logo ve içerik kaydı için{" "}
            <code className="rounded bg-black/10 px-1 font-mono text-xs dark:bg-white/10">
              NEXT_PUBLIC_SUPABASE_URL
            </code>{" "}
            ve sunucu ortamında{" "}
            <code className="rounded bg-black/10 px-1 font-mono text-xs dark:bg-white/10">
              SUPABASE_SERVICE_ROLE_KEY
            </code>{" "}
            tanımlanmalıdır.
          </div>
        ) : null}

        {activeTab === "uyeler" && !stats?.supabaseConfigured ? (
          <div
            className="rounded-2xl border border-amber-500/35 bg-amber-500/10 px-5 py-4 text-sm text-[var(--foreground)]"
            role="status"
          >
            <strong className="font-semibold">Supabase yapılandırılmadı.</strong> Üye listesi ve yayımlama
            durumunu kaydetmek için ortam değişkenlerini kontrol edin.
          </div>
        ) : null}

        {activeTab === "haber" && !homeContentCanSave ? (
          <div
            className="rounded-2xl border border-amber-500/35 bg-amber-500/10 px-5 py-4 text-sm text-[var(--foreground)]"
            role="status"
          >
            <strong className="font-semibold">İçerik kaydı gerekli.</strong> Haberleri kaydetmek için Supabase
            bağlantısı tanımlayın veya yerel geliştirmede{" "}
            <code className="rounded bg-black/10 px-1 font-mono text-xs dark:bg-white/10">HOME_CONTENT_FILE=true</code>{" "}
            ile <code className="font-mono text-xs">data/home-content.json</code> kullanın. Aksi halde anasayfa{" "}
            <code className="font-mono text-xs">lib/home-content.ts</code> varsayılanını gösterir.
          </div>
        ) : null}

        {activeTab === "haber" && homeContentCanSave ? (
          <AdminNewsEditor
            initialItems={homeNews}
            canSave={homeContentCanSave}
            hasPersistedOverride={homeNewsOverridden}
            onSaved={() => void load()}
          />
        ) : null}

        {activeTab === "blog" && !homeContentCanSave ? (
          <div
            className="rounded-2xl border border-amber-500/35 bg-amber-500/10 px-5 py-4 text-sm text-[var(--foreground)]"
            role="status"
          >
            <strong className="font-semibold">İçerik kaydı gerekli.</strong> Blog yazılarını kaydetmek için Supabase
            veya{" "}
            <code className="rounded bg-black/10 px-1 font-mono text-xs dark:bg-white/10">HOME_CONTENT_FILE=true</code>.
          </div>
        ) : null}

        {activeTab === "blog" && homeContentCanSave ? (
          <AdminBlogEditor
            initialItems={homeBlog}
            canSave={homeContentCanSave}
            hasPersistedOverride={homeBlogOverridden}
            onSaved={() => void load()}
          />
        ) : null}

        {activeTab === "uyeler" && membersFetchError ? (
          <div
            className="rounded-2xl border border-red-500/35 bg-red-500/10 px-5 py-4 text-sm text-[var(--foreground)]"
            role="alert"
          >
            <strong className="font-semibold">Üye listesi.</strong> {membersFetchError}
          </div>
        ) : null}

        {activeTab === "uyeler" ? (
          <>
            <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h2 className="text-lg font-semibold">Web sitesi üyelik başvuruları</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                <code className="rounded bg-black/10 px-1 font-mono text-xs dark:bg-white/10">/kayit</code> formundan
                gelen başvurular Supabase&apos;te <strong>membership_applications</strong> tablosuna ve uygun
                kayıtlarda <strong>members</strong> tablosuna (incelemede) yazılır.
              </p>
              {!siteApplicationsOk ? (
                <p className="mt-3 text-sm text-amber-700 dark:text-amber-400">
                  Supabase yapılandırılmadıysa başvurular kaydedilmez.
                </p>
              ) : siteApplications.length === 0 ? (
                <p className="mt-3 text-sm text-[var(--muted)]">Henüz kuyrukta başvuru yok (veya liste boş).</p>
              ) : (
                <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto text-sm">
                  {siteApplications.map((item, idx) => {
                    if (!item || typeof item !== "object" || "_parseError" in (item as object)) {
                      return (
                        <li
                          key={`bad-${idx}`}
                          className="rounded-lg border border-[var(--card-border)] bg-[var(--card-elevated)] px-3 py-2 text-[var(--muted)]"
                        >
                          Okunamayan kayıt
                        </li>
                      );
                    }
                    const o = item as Record<string, unknown>;
                    const fullName = typeof o.fullName === "string" ? o.fullName : "—";
                    const email = typeof o.email === "string" ? o.email : "";
                    const sector = typeof o.sector === "string" ? o.sector : "";
                    const submittedAt = typeof o.submittedAt === "string" ? o.submittedAt : "";
                    return (
                      <li
                        key={`${submittedAt}-${idx}`}
                        className="rounded-lg border border-[var(--card-border)] bg-[var(--card-elevated)] px-3 py-2"
                      >
                        <div className="font-medium text-[var(--foreground)]">{fullName}</div>
                        <div className="mt-0.5 text-xs text-[var(--muted)]">
                          {submittedAt ? new Date(submittedAt).toLocaleString("tr-TR") : "—"}
                          {email ? ` · ${email}` : null}
                        </div>
                        {sector ? <div className="mt-1 line-clamp-2 text-xs text-[var(--muted)]">{sector}</div> : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h2 className="text-lg font-semibold">Üye yayımlama durumu</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                <strong>Onaylı</strong> kayıtlar kamuya açık katalogda listelenir. <strong>İncelemede</strong> ve{" "}
                <strong>Reddedildi</strong> yayındadır. <strong>Düzenle</strong> alanları veritabanında günceller.{" "}
                <strong>Sil</strong> kaydı siteden gizler (satır silinmez).
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                <input
                  type="search"
                  value={memberFilter}
                  onChange={(e) => setMemberFilter(e.target.value)}
                  placeholder="Ad, sektör veya marka ara…"
                  className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--input-bg)] px-4 py-3 text-sm outline-none ring-[var(--accent)] focus:ring-2 sm:max-w-md"
                  aria-label="Üye ara"
                />
                {memberFilter.trim() ? (
                  <button
                    type="button"
                    onClick={() => setMemberFilter("")}
                    className="shrink-0 rounded-full border border-[var(--card-border)] px-4 py-2 text-xs font-medium text-[var(--foreground)] hover:border-[var(--accent)]"
                  >
                    Aramayı temizle
                  </button>
                ) : null}
              </div>
              <p className="mt-2 text-xs text-[var(--muted)]">
                <span className="font-medium text-[var(--foreground)]">{filteredMembers.length}</span> kayıt
                gösteriliyor
                {memberFilter.trim() ? (
                  <>
                    {" "}
                    (filtre nedeniyle; toplam <span className="text-[var(--foreground)]">{members.length}</span>{" "}
                    kayıt)
                  </>
                ) : (
                  <>
                    {" "}
                    (toplam <span className="text-[var(--foreground)]">{members.length}</span>)
                  </>
                )}
                .
                {memberFilter.trim() && filteredMembers.length < members.length ? (
                  <span className="ml-1 text-amber-600 dark:text-amber-400">
                    Tüm üyeleri görmek için aramayı boşaltın.
                  </span>
                ) : null}
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--card-border)] text-[var(--muted)]">
                      <th className="py-2 pr-4 font-semibold">Üye</th>
                      <th className="py-2 pr-4 font-semibold">Sektör</th>
                      <th className="py-2 pr-4 font-semibold">Yayımlama statüsü</th>
                      <th className="py-2 font-semibold">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.slice(0, 200).map((m, rowIndex) => (
                      <tr key={`${m.key}#${rowIndex}`} className="border-b border-[var(--card-border)]/70">
                        <td className="max-w-[200px] py-2 pr-4">
                          <div className="font-medium">{m.fullName}</div>
                          <div className="truncate text-xs text-[var(--muted)]">{m.brand}</div>
                        </td>
                        <td className="max-w-[240px] py-2 pr-4 align-top text-[var(--muted)]">
                          <span className="line-clamp-2">{m.sector}</span>
                        </td>
                        <td className="py-2 pr-4 align-top">
                          <span
                            className={
                              m.approval === "approved"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : m.approval === "pending"
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-red-600 dark:text-red-400"
                            }
                          >
                            {m.approval === "approved"
                              ? "Onaylı"
                              : m.approval === "pending"
                                ? "İncelemede"
                                : "Reddedildi"}
                          </span>
                        </td>
                        <td className="py-2 align-top">
                          <div className="flex flex-wrap gap-1">
                            <button
                              type="button"
                              disabled={!storageOk}
                              onClick={() => {
                                setEditMemberKey(m.key);
                                setEditMemberInitial({
                                  fullName: m.fullName,
                                  sector: m.sector,
                                  brand: m.brand,
                                  materials: m.materials,
                                  location: m.location,
                                  contact: m.contact,
                                  digitalContact: m.digitalContact,
                                  reference: m.reference,
                                  rank: m.rank,
                                });
                              }}
                              className="rounded-lg border border-[var(--accent)]/50 bg-[var(--accent)]/10 px-2 py-1 text-xs font-medium text-[var(--foreground)] transition hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-45"
                              title="Katalogda görünen alanları düzenle"
                            >
                              Düzenle
                            </button>
                            {(["approved", "pending", "rejected"] as const).map((s) => (
                              <button
                                key={s}
                                type="button"
                                disabled={busyKey === m.key || !storageOk || m.approval === s}
                                onClick={() => void setApproval(m.key, s)}
                                className="rounded-lg border border-[var(--card-border)] px-2 py-1 text-xs font-medium transition hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-45"
                                title={m.approval === s ? "Bu statü zaten atanmış" : undefined}
                              >
                                {s === "approved" ? "Onayla" : s === "pending" ? "İncelemeye al" : "Reddet"}
                              </button>
                            ))}
                            <button
                              type="button"
                              disabled={busyKey === m.key || !storageOk}
                              onClick={() =>
                                void removeMemberFromSite(
                                  m.key,
                                  m.fullName.trim() || m.brand.trim() || m.sector.trim() || m.contact.trim(),
                                )
                              }
                              className="rounded-lg border border-red-500/40 bg-red-500/5 px-2 py-1 text-xs font-medium text-red-700 transition hover:border-red-500/70 dark:text-red-400 dark:hover:border-red-400 disabled:cursor-not-allowed disabled:opacity-45"
                              title="Listeden ve katalogdan kaldırır; veritabanı satırı silinmez"
                            >
                              Sil
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredMembers.length > 200 ? (
                <p className="mt-2 text-xs text-[var(--muted)]">
                  Performans nedeniyle ilk iki yüz kayıt listelenmektedir; sonuçları daraltmak için arama kullanınız.
                </p>
              ) : null}
            </section>

            <MemberEditModal
              open={editMemberKey !== null}
              lineageKey={editMemberKey}
              initial={editMemberInitial}
              storageReady={storageOk}
              onClose={() => {
                setEditMemberKey(null);
                setEditMemberInitial(null);
              }}
              onSaved={() => void load()}
            />

            {stats?.supabaseConfigured ? (
              <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <h2 className="text-lg font-semibold">Üyelik başvurusu — günlük tıklama</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Kamuya açık sitede «Üyelik başvurusu» çağrı öğesine yapılan tıklamalar.
                </p>
                <div className="mt-4 space-y-2">
                  {stats.dailyCta.map((d) => (
                    <div key={d.date} className="flex justify-between text-sm font-mono">
                      <span className="text-[var(--muted)]">{d.date}</span>
                      <span className="tabular-nums">{d.count}</span>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        ) : null}

        {activeTab === "sistem" && stats ? (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Kümülatif sayfa görüntülenmesi
                </p>
                <p className="mt-2 text-3xl font-bold tabular-nums">{stats.totalPv}</p>
              </div>
              <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Bugün (UTC) görüntülenme
                </p>
                <p className="mt-2 text-3xl font-bold tabular-nums">
                  {stats.dailyPv.find((d) => d.date === new Date().toISOString().slice(0, 10))?.count ?? 0}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Sektör filtresi çeşitliliği
                </p>
                <p className="mt-2 text-3xl font-bold tabular-nums">{stats.topSectors.length}</p>
                <p className="text-xs text-[var(--muted)]">Özet listesinde yer alan kalem sayısı</p>
              </div>
              <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Arama terimi çeşitliliği
                </p>
                <p className="mt-2 text-3xl font-bold tabular-nums">{stats.topSearches.length}</p>
                <p className="text-xs text-[var(--muted)]">Özet listesinde yer alan kalem sayısı</p>
              </div>
            </section>

            {stats.supabaseConfigured ? (
              <>
                <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                  <h2 className="text-lg font-semibold">Günlük sayfa görüntülenmesi (on dört gün, UTC)</h2>
                  <div className="mt-6 space-y-2">
                    {stats.dailyPv.map((d) => (
                      <div key={d.date} className="flex items-center gap-3 text-sm">
                        <span className="w-28 shrink-0 font-mono text-[var(--muted)]">{d.date}</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--card-border)]">
                          <div
                            className="h-full rounded-full bg-[var(--accent)] transition-all"
                            style={{ width: `${Math.min(100, (d.count / maxPv) * 100)}%` }}
                          />
                        </div>
                        <span className="w-12 shrink-0 text-right tabular-nums">{d.count}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                    <h2 className="text-lg font-semibold">Sık seçilen sektörler</h2>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      Katalog sektör filtresinde en çok işaretlenen değerler.
                    </p>
                    <ol className="mt-4 space-y-2">
                      {stats.topSectors.length === 0 ? (
                        <li className="text-sm text-[var(--muted)]">Henüz kayıt bulunmamaktadır.</li>
                      ) : (
                        stats.topSectors.map((s, i) => (
                          <li
                            key={s.name}
                            className="flex justify-between gap-2 border-b border-[var(--card-border)] pb-2 text-sm last:border-0"
                          >
                            <span className="text-[var(--muted)]">{i + 1}.</span>
                            <span className="min-w-0 flex-1 truncate" title={s.name}>
                              {s.name}
                            </span>
                            <span className="shrink-0 tabular-nums font-medium">{s.count}</span>
                          </li>
                        ))
                      )}
                    </ol>
                  </div>

                  <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                    <h2 className="text-lg font-semibold">Sık kullanılan arama terimleri</h2>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      Katalog tarama alanına girilen, normalize edilmiş ifadeler.
                    </p>
                    <ol className="mt-4 space-y-2">
                      {stats.topSearches.length === 0 ? (
                        <li className="text-sm text-[var(--muted)]">Henüz kayıt bulunmamaktadır.</li>
                      ) : (
                        stats.topSearches.map((s, i) => (
                          <li
                            key={s.term}
                            className="flex justify-between gap-2 border-b border-[var(--card-border)] pb-2 text-sm last:border-0"
                          >
                            <span className="text-[var(--muted)]">{i + 1}.</span>
                            <span className="min-w-0 flex-1 truncate" title={s.term}>
                              {s.term}
                            </span>
                            <span className="shrink-0 tabular-nums font-medium">{s.count}</span>
                          </li>
                        ))
                      )}
                    </ol>
                  </div>
                </section>
              </>
            ) : null}
          </>
        ) : null}

        {activeTab === "sistem" ? (
          <>
            <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h2 className="text-lg font-semibold">Supabase — veri kaynağı</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Üyeler, başvurular, logo URL&apos;si, anasayfa haber/blog içeriği ve özet analitik{" "}
                <strong>Postgres</strong> üzerinden tutulur. Şema için
                projedeki <code className="font-mono text-xs">supabase/migrations/001_initial.sql</code> dosyasını
                Supabase SQL düzenleyicide çalıştırın.
              </p>
            </section>

            <section className="rounded-2xl border border-red-500/25 bg-red-500/[0.06] p-6 dark:bg-red-500/5">
              <h2 className="text-lg font-semibold">Üye onay ve gizleme durumunu sıfırla</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Tüm kayıtlar <strong>onaylı</strong> yapılır ve <strong>gizlenen</strong> işaretleri kaldırılır. Alan
                metinleri değişmez.
              </p>
              <button
                type="button"
                disabled={!storageOk}
                onClick={() => void resetMemberOverlay()}
                className="mt-4 rounded-full border border-red-500/50 bg-red-500/10 px-6 py-3 text-sm font-semibold text-red-800 transition hover:bg-red-500/20 disabled:opacity-50 dark:text-red-300"
              >
                Onay ve gizlemeyi sıfırla
              </button>
            </section>

            <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h2 className="text-lg font-semibold">Kurumsal logo (URL)</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                <strong className="text-[var(--foreground)]">Üye kataloğu</strong> üstündeki logo bu HTTPS adresinden
                yüklenir. Boş bırakırsanız yerel varsayılan (
                <code className="font-mono text-xs">/turk-tudun-logo.png</code>) kullanılır.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="flex flex-1 flex-col gap-2 text-sm font-medium">
                  Görsel adresi (HTTPS)
                  <input
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://…"
                    className="rounded-xl border border-[var(--card-border)] bg-[var(--input-bg)] px-4 py-3 font-normal text-[var(--foreground)] outline-none ring-[var(--accent)] focus:ring-2"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => void saveLogo()}
                  disabled={!storageOk}
                  className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-black disabled:opacity-50"
                >
                  Uygula
                </button>
              </div>
              {logoSaved ? (
                <p className="mt-2 text-xs text-[var(--muted)]">
                  Geçerli özel adres: <span className="break-all font-mono">{logoSaved}</span>
                </p>
              ) : (
                <p className="mt-2 text-xs text-[var(--muted)]">
                  Kayıtlı adres yok — katalogda yerleşik logo kullanılır.
                </p>
              )}
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}
