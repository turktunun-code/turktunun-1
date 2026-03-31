"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DemandChatbot } from "@/components/DemandChatbot";
import { MemberHoverCard } from "@/components/MemberHoverCard";
import { TAGLINE } from "@/lib/constants";
import { memberDedupeKey, type Member } from "@/lib/member";
import { recommendByDemand, tokenizeDemand } from "@/lib/recommendations";
import { ThemeToggle } from "@/components/ThemeToggle";

type Props = {
  members: Member[];
  initialDemand: string;
  initialSector: string;
};

export function OnerilerClient({ members, initialDemand, initialSector }: Props) {
  const router = useRouter();
  const [demand, setDemand] = useState(initialDemand);
  const [sector, setSector] = useState(initialSector);

  const sectors = useMemo(() => {
    const set = new Set<string>();
    for (const m of members) {
      const s = m.sector.trim();
      if (s) set.add(s);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "tr"));
  }, [members]);

  const pool = useMemo(() => {
    return members.filter((m) => !sector.trim() || m.sector.trim() === sector.trim());
  }, [members, sector]);

  const tokens = useMemo(() => tokenizeDemand(demand), [demand]);

  const ranked = useMemo(() => recommendByDemand(pool, demand, 80), [pool, demand]);

  function applyFilters() {
    const q = new URLSearchParams();
    if (demand.trim()) q.set("demand", demand.trim());
    if (sector.trim()) q.set("sector", sector.trim());
    router.push(`/oneriler?${q.toString()}`);
  }

  const inputClass =
    "rounded-xl border border-[var(--card-border)] bg-[var(--input-bg)] px-4 py-3 text-base text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none ring-[var(--accent)] focus:border-[var(--accent)]/40 focus:ring-2";

  return (
    <div className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] transition-colors">
      <header className="border-b border-[var(--card-border)] bg-[var(--header-bg)] transition-colors">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6">
          <div className="min-w-0">
            <Link href="/anasayfa" className="text-sm font-medium text-[var(--accent)] hover:underline">
              Ana sayfaya dönüş
            </Link>
            <h1 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">Talep temelli sonuçlar</h1>
            <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">{TAGLINE}</p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 overflow-visible px-4 py-8">
        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-elevated)] p-5 dark:bg-[var(--card)]">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
            Talep ve sektör daraltması
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Aynı talebi farklı sektörle daraltabilir veya metni güncelleyerek yeniden arayabilirsiniz. Sohbet
            asistanını da kullanabilirsiniz.
          </p>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end">
            <label className="flex min-w-0 flex-1 flex-col gap-2 text-sm font-medium text-[var(--foreground)]">
              Talep metni
              <textarea
                value={demand}
                onChange={(e) => setDemand(e.target.value)}
                rows={3}
                className={`${inputClass} min-h-[88px] resize-y`}
                placeholder="Örn: gümrükleme danışmanlığı, KOBİ için marka patent…"
              />
            </label>
            <label className="flex w-full flex-col gap-2 text-sm font-medium text-[var(--foreground)] lg:w-72">
              Sektör
              <select value={sector} onChange={(e) => setSector(e.target.value)} className={inputClass}>
                <option value="">Tüm sektörler ({members.length} kayıt)</option>
                {sectors.map((s) => (
                  <option key={s} value={s}>
                    {s.length > 55 ? `${s.slice(0, 52)}…` : s}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => applyFilters()}
              className="h-12 shrink-0 rounded-full bg-[var(--accent)] px-8 text-sm font-semibold text-black transition hover:brightness-95"
            >
              Listeyi güncelle
            </button>
          </div>
          {tokens.length > 0 ? (
            <p className="mt-3 text-xs text-[var(--muted)]">
              Ayrıştırılan anahtar ifadeler:{" "}
              <span className="font-medium text-[var(--foreground)]">{tokens.join(", ")}</span>
            </p>
          ) : demand.trim().length >= 2 ? (
            <p className="mt-3 text-sm text-amber-700 dark:text-amber-400">
              Anlamlı anahtar kelime bulunamadı. Talep metnini somut ürün, hizmet veya konum içerecek şekilde
              zenginleştiriniz.
            </p>
          ) : null}
        </div>

        {ranked.length > 0 ? (
          <>
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                Eşleşen üye kayıtları ({ranked.length})
              </h2>
              <span className="text-xs text-[var(--muted)]">
                Havuz: {pool.length} kayıt — uyumluluk skoruna göre sıralı
              </span>
            </div>
            <ul className="grid items-start gap-4 overflow-visible sm:grid-cols-2 lg:grid-cols-3">
              {ranked.map(({ member: m, score }, i) => (
                <li className="min-h-0 overflow-visible" key={`${memberDedupeKey(m)}-${i}`}>
                  <MemberHoverCard
                    m={m}
                    badge={
                      <span className="rounded-full border border-[var(--accent)]/50 bg-[var(--accent)]/15 px-2 py-0.5 text-[11px] font-bold tabular-nums text-[var(--foreground)]">
                        Uyum {score}
                      </span>
                    }
                  />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--card-border)] bg-[var(--card)]/50 px-6 py-12 text-center">
            <p className="text-[var(--foreground)]">
              Bu talep ve filtrelerle eşleşen üye bulunamadı. Anahtar kelimeleri değiştirmeyi veya sektör
              seçimini kaldırmayı deneyiniz.
            </p>
            <Link
              href="/anasayfa"
              className="mt-6 inline-flex rounded-full border border-[var(--card-border)] px-6 py-2.5 text-sm font-medium hover:border-[var(--accent)]"
            >
              Katalogda gezin
            </Link>
          </div>
        )}
      </section>

      <footer className="mt-auto border-t border-[var(--card-border)] bg-[var(--footer-bg)] py-6 text-center text-sm text-[var(--muted)] transition-colors">
        © Türk Tudun. Bu sayfa üye bilgi platformu niteliğindedir. Başvurular web formu üzerinden kabul edilir.
      </footer>

      <DemandChatbot sectorFilter={sector} />
    </div>
  );
}
