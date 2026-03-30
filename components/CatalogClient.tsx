"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DemandChatbot } from "@/components/DemandChatbot";
import { MemberHoverCard } from "@/components/MemberHoverCard";
import { FORM_URL, TAGLINE } from "@/lib/constants";
import { memberDedupeKey, type Member } from "@/lib/member";
import { ThemeToggle } from "@/components/ThemeToggle";

type Props = {
  members: Member[];
  logoSrc?: string;
};

function CatalogLogo({ src }: { src: string }) {
  const remote = src.startsWith("http://") || src.startsWith("https://");
  const cls =
    "h-28 w-28 shrink-0 object-contain drop-shadow-sm dark:drop-shadow-[0_0_20px_rgba(48,213,200,0.25)]";
  if (remote) {
    return <img src={src} alt="Türk Tudun" className={cls} referrerPolicy="no-referrer" />;
  }
  return <Image src={src} alt="Türk Tudun" width={120} height={120} className={cls} priority />;
}

export function CatalogClient({ members, logoSrc = "/logo.png" }: Props) {
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("tt_analytics_pv") === "1") return;
    sessionStorage.setItem("tt_analytics_pv", "1");
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "page_view" }),
    });
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (sector.trim().length < 2) return;
      void fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "sector", sector }),
      });
    }, 800);
    return () => window.clearTimeout(t);
  }, [sector]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      const q = query.trim();
      if (q.length < 2) return;
      void fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "search", query: q }),
      });
    }, 1200);
    return () => window.clearTimeout(t);
  }, [query]);

  const sectors = useMemo(() => {
    const set = new Set<string>();
    for (const m of members) {
      const s = m.sector.trim();
      if (s) set.add(s);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "tr"));
  }, [members]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      if (sector && m.sector.trim() !== sector) return false;
      if (!q) return true;
      const hay = [
        m.fullName,
        m.sector,
        m.brand,
        m.materials,
        m.location,
        m.contact,
        m.digitalContact ?? "",
        m.rank ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [members, query, sector]);

  const inputClass =
    "rounded-xl border border-[var(--card-border)] bg-[var(--input-bg)] px-4 py-3 text-base text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none ring-[var(--accent)] focus:border-[var(--accent)]/40 focus:ring-2";

  return (
    <div className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] transition-colors">
      <header className="border-b border-[var(--card-border)] bg-[var(--header-bg)] transition-colors">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            <CatalogLogo src={logoSrc} />
            <div className="text-center sm:text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Ticaret ve Hizmet
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
                Türk Tudun
              </h1>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--muted)]">{TAGLINE}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-end">
            <Link
              href="/giris"
              className="inline-flex h-10 items-center rounded-full border border-[var(--card-border)] px-4 text-sm font-medium text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--foreground)]"
            >
              Hoş geldin
            </Link>
            <ThemeToggle />
            <Link
              href="/kayit"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--accent)] px-8 text-sm font-semibold text-black shadow-sm transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] dark:text-black dark:hover:brightness-110"
              onClick={() => {
                void fetch("/api/analytics", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ type: "form_cta" }),
                });
              }}
            >
              Üyelik başvurusu
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 overflow-visible px-4 py-8">
        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-elevated)] p-5 transition-colors dark:bg-[var(--card)]">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
            Talep temelli eşleştirme
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Sağ alttaki <strong className="font-medium text-[var(--foreground)]">talep asistanı</strong> ile sohbet ederek ihtiyacınızı
            yazın; sistem uygun üyeleri ayrı bir sonuç sayfasında listeler. İsterseniz önce sektör seçimini yapıp
            talebinizi ileterek sonuçları daraltabilirsiniz. Kart üzerinde kısa özet görünür; tam iletişim ve faaliyet
            ayrıntıları için masaüstünde üzerine gelin veya mobilde &quot;Tam profili aç&quot; düğmesini kullanın.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-2 text-sm font-medium text-[var(--foreground)]">
            Katalog araması
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ad soyad, sektör, marka, konum…"
              className={inputClass}
            />
          </label>
          <label className="flex w-full flex-col gap-2 text-sm font-medium text-[var(--foreground)] sm:w-64">
            Sektör seçimi
            <select value={sector} onChange={(e) => setSector(e.target.value)} className={inputClass}>
              <option value="">Tüm sektörler</option>
              {sectors.map((s) => (
                <option key={s} value={s}>
                  {s.length > 60 ? `${s.slice(0, 57)}…` : s}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="text-sm text-[var(--muted)]">
          {filtered.length} kayıt listelenmektedir
          {members.length !== filtered.length && ` (yayında toplam ${members.length} kayıt)`}
        </p>

        <ul className="grid gap-4 overflow-visible sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m, i) => (
            <li className="min-h-0 overflow-visible" key={`${memberDedupeKey(m)}-${i}`}>
              <MemberHoverCard m={m} />
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-auto border-t border-[var(--card-border)] bg-[var(--footer-bg)] py-6 text-center text-sm text-[var(--muted)] transition-colors">
        © Türk Tudun. Bu sayfa üye bilgi platformu niteliğindedir. Başvurular web formu veya{" "}
        <a
          className="font-medium text-[var(--foreground)] underline decoration-[var(--accent)] underline-offset-4"
          href={FORM_URL}
        >
          resmî Google Form
        </a>{" "}
        üzerinden kabul edilir.{" "}
        <Link className="underline decoration-[var(--accent)] underline-offset-4" href="/kayit">
          Üyelik başvurusu
        </Link>
        {" · "}
        <Link className="underline decoration-[var(--accent)] underline-offset-4" href="/admin/login">
          Yönetim paneli
        </Link>
      </footer>

      <DemandChatbot sectorFilter={sector} />
    </div>
  );
}
