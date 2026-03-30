"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { AdminStats } from "@/lib/analytics";
import type { ApprovalStatus } from "@/lib/approvals";
import { ThemeToggle } from "@/components/ThemeToggle";

type MemberRow = {
  key: string;
  fullName: string;
  sector: string;
  brand: string;
  contact: string;
  approval: ApprovalStatus;
};

export function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [redis, setRedis] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [logoSaved, setLogoSaved] = useState<string | null>(null);
  const [memberFilter, setMemberFilter] = useState("");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [loadError, setLoadError] = useState("");

  const load = useCallback(async () => {
    setLoadError("");
    try {
      const [st, memRes, logoRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/members"),
        fetch("/api/admin/settings/logo"),
      ]);

      if (st.status === 401) {
        router.replace("/admin/login");
        return;
      }

      if (st.ok) {
        setStats(await st.json());
      }

      if (memRes.ok) {
        const m = (await memRes.json()) as { members: MemberRow[]; redis: boolean };
        setMembers(m.members);
        setRedis(m.redis);
      }

      if (logoRes.ok) {
        const l = (await logoRes.json()) as { url: string | null };
        setLogoUrl(l.url ?? "");
        setLogoSaved(l.url);
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
    alert("Kurumsal logo adresi güncellendi. Ana sayfada değişiklik, önbellek süresi sonunda yansıyacaktır.");
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

  const maxPv = Math.max(1, ...(stats?.dailyPv.map((d) => d.count) ?? [1]));

  const filteredMembers = members.filter((m) => {
    const q = memberFilter.trim().toLowerCase();
    if (!q) return true;
    return (
      m.fullName.toLowerCase().includes(q) ||
      m.sector.toLowerCase().includes(q) ||
      m.brand.toLowerCase().includes(q) ||
      m.contact.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
      <header className="sticky top-0 z-10 border-b border-[var(--card-border)] bg-[var(--header-bg)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Yönetim konsolu</p>
            <h1 className="text-xl font-bold">Kontrol paneli</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ThemeToggle />
            <Link
              href="/"
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

      <main className="mx-auto max-w-6xl space-y-10 px-4 py-10">
        {loadError ? (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm">{loadError}</p>
        ) : null}

        {!stats?.redisConfigured ? (
          <div
            className="rounded-2xl border border-amber-500/35 bg-amber-500/10 px-5 py-4 text-sm text-[var(--foreground)]"
            role="status"
          >
            <strong className="font-semibold">Redis (Upstash) bağlantısı bulunmamaktadır.</strong> Günlük
            görüntülenme, arama ve sektör analitikleri, logo adresi ile üye onay durumları kalıcı olarak
            saklanamaz.{" "}
            <code className="rounded bg-black/10 px-1 font-mono text-xs dark:bg-white/10">
              UPSTASH_REDIS_REST_URL
            </code>{" "}
            ve{" "}
            <code className="rounded bg-black/10 px-1 font-mono text-xs dark:bg-white/10">
              UPSTASH_REDIS_REST_TOKEN
            </code>{" "}
            değişkenlerinin tanımlanması gerekmektedir.
          </div>
        ) : null}

        {stats ? (
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
        ) : null}

        {stats?.redisConfigured ? (
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
          </>
        ) : null}

        <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-semibold">Kurumsal logo (URL)</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Yayındaki sitede varsayılan görsel{" "}
            <code className="font-mono text-xs">/logo.png</code> dosyasıdır. Özel adres kullanımı için barındırıcı
            ortamında{" "}
            <code className="font-mono text-xs">USE_STORED_SITE_LOGO=true</code> tanımlanmalıdır. Alanın
            boşaltılması Redis kaydını siler.
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
              disabled={!redis}
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
            <p className="mt-2 text-xs text-[var(--muted)]">Geçerli görsel: varsayılan /logo.png</p>
          )}
        </section>

        <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-semibold">Üye yayımlama durumu</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            <strong>Onaylı</strong> kayıtlar kamuya açık üye kataloğunda listelenir. <strong>İncelemede</strong> ve{" "}
            <strong>Reddedildi</strong> statülerindeki kayıtlar yayından alınır. Kaynak elektronik tablo
            güncellendikten sonra kayıtlar için uygun statüyü atayınız.
          </p>
          <input
            type="search"
            value={memberFilter}
            onChange={(e) => setMemberFilter(e.target.value)}
            placeholder="Ad, sektör veya marka ara…"
            className="mt-4 w-full rounded-xl border border-[var(--card-border)] bg-[var(--input-bg)] px-4 py-3 text-sm outline-none ring-[var(--accent)] focus:ring-2 sm:max-w-md"
          />
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--card-border)] text-[var(--muted)]">
                  <th className="py-2 pr-4 font-semibold">Üye</th>
                  <th className="py-2 pr-4 font-semibold">Sektör</th>
                  <th className="py-2 pr-4 font-semibold">Yayımlama statüsü</th>
                  <th className="py-2 font-semibold">Statü işlemleri</th>
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
                        {(["approved", "pending", "rejected"] as const).map((s) => (
                          <button
                            key={s}
                            type="button"
                            disabled={busyKey === m.key || !redis || m.approval === s}
                            onClick={() => void setApproval(m.key, s)}
                            className="rounded-lg border border-[var(--card-border)] px-2 py-1 text-xs font-medium transition hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-45"
                            title={m.approval === s ? "Bu statü zaten atanmış" : undefined}
                          >
                            {s === "approved" ? "Onayla" : s === "pending" ? "İncelemeye al" : "Reddet"}
                          </button>
                        ))}
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
      </main>
    </div>
  );
}
