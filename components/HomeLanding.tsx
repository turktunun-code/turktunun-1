"use client";

import Link from "next/link";
import { useState } from "react";
import type { HomeBlogItem, HomeNewsItem } from "@/lib/home-content";
import { DemandChatbot } from "@/components/DemandChatbot";
import { TAGLINE } from "@/lib/constants";
import { ThemeToggle } from "@/components/ThemeToggle";

const HERO_SRC = "/welcome/hero.png";

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(iso + "T12:00:00"));
  } catch {
    return iso;
  }
}

type Props = {
  initialNews: HomeNewsItem[];
  initialBlog: HomeBlogItem[];
};

export function HomeLanding({ initialNews, initialBlog }: Props) {
  const [heroBroken, setHeroBroken] = useState(false);

  return (
    <div className="min-h-dvh flex flex-col bg-[var(--background)] text-[var(--foreground)] transition-colors">
      <header className="sticky top-0 z-20 border-b border-[var(--card-border)] bg-[var(--header-bg)]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
          <Link href="/" className="text-sm font-bold tracking-tight text-[var(--foreground)]" title="Giriş sayfası">
            Türk Tudun
          </Link>
          <span className="hidden text-[var(--muted)] sm:inline">·</span>
          <span className="hidden text-xs uppercase tracking-wider text-[var(--muted)] sm:inline">Anasayfa</span>
          <nav className="ml-auto flex flex-wrap items-center gap-2 sm:gap-3" aria-label="Ana gezinme">
            <Link
              href="/katalog"
              className="rounded-full border border-[var(--card-border)] px-4 py-2 text-xs font-semibold transition hover:border-[var(--accent)] sm:text-sm"
            >
              Katalog
            </Link>
            <Link
              href="/kayit"
              className="rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-black transition hover:brightness-95 sm:text-sm"
            >
              Üyelik başvurusu
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <section className="relative flex min-h-[min(58vh,560px)] flex-col overflow-hidden border-b border-[var(--card-border)] sm:min-h-[min(62vh,620px)]">
        <div className="absolute inset-0">
          {heroBroken ? (
            <div
              className="h-full w-full bg-gradient-to-br from-zinc-900 via-[#1a1a1c] to-black"
              aria-hidden
            />
          ) : (
            <img
              src={HERO_SRC}
              alt="Türk Tudun: tarihî ticaret hanı ve kurumsal mühür illüstrasyonu"
              decoding="async"
              fetchPriority="high"
              onError={() => setHeroBroken(true)}
              className="h-full w-full object-cover object-[50%_32%] sm:object-[50%_36%] md:object-[50%_38%]"
            />
          )}
          <div
            className="absolute inset-0 bg-gradient-to-t from-[var(--background)] from-25% via-[var(--background)]/80 to-transparent"
            aria-hidden
          />
        </div>
        <div className="relative z-10 mx-auto mt-auto flex w-full max-w-5xl flex-col justify-end px-4 pb-10 pt-28 sm:pb-12 sm:pt-36 md:pb-14 md:pt-44">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[var(--accent)] drop-shadow-[0_1px_12px_rgba(0,0,0,0.85)]">
            Ticaret &amp; hizmet
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--foreground)] drop-shadow-[0_1px_2px_rgba(255,255,255,0.6)] dark:drop-shadow-[0_2px_24px_rgba(0,0,0,0.9)] sm:text-4xl md:text-5xl">
            Türk Tudun
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-800 sm:text-lg dark:text-white/95 dark:[text-shadow:0_2px_20px_rgba(0,0,0,0.85)]">
            {TAGLINE}
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-700 dark:text-white/90 dark:[text-shadow:0_1px_16px_rgba(0,0,0,0.8)]">
            Platform; duyuru ve blog içerikleriyle güncel kalır, ardından üye bilgi kataloğuna geçiş yapılır. Katalogda
            yalnızca yayıma onaylı kayıtlar listelenir.
          </p>
        </div>
      </section>

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-16 px-4 py-14">
        <section aria-labelledby="haberler-title">
          <h2 id="haberler-title" className="text-lg font-semibold text-[var(--foreground)]">
            Haberler
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Platform ve süreçlerle ilgili kısa duyurular.</p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {initialNews.map((n) => (
              <li
                key={n.id}
                className="flex flex-col rounded-2xl border border-[var(--card-border)] bg-[var(--card-elevated)] p-5 transition-colors dark:bg-[var(--card)]"
              >
                <time className="text-xs font-mono text-[var(--muted)]" dateTime={n.date}>
                  {formatDate(n.date)}
                </time>
                <h3 className="mt-2 text-sm font-semibold leading-snug text-[var(--foreground)]">{n.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--muted)]">{n.excerpt}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="blog-title">
          <h2 id="blog-title" className="text-lg font-semibold text-[var(--foreground)]">
            Blog
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Okuma önerileri; tam metinler ileride bağlantıyla genişletilebilir.
          </p>
          <ul className="mt-6 space-y-4">
            {initialBlog.map((b) => (
              <li
                key={b.id}
                className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-elevated)] p-6 transition-colors dark:bg-[var(--card)]"
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <time className="text-xs font-mono text-[var(--muted)]" dateTime={b.date}>
                    {formatDate(b.date)}
                  </time>
                  <span className="text-xs text-[var(--muted)]">· {b.readMinutes} dk okuma</span>
                </div>
                <h3 className="mt-2 text-base font-semibold text-[var(--foreground)]">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{b.excerpt}</p>
              </li>
            ))}
          </ul>
        </section>

        <section
          className="rounded-2xl border border-[var(--accent)]/30 bg-[var(--card-elevated)] p-8 text-center dark:bg-[var(--card)]"
          aria-label="Katalog çağrısı"
        >
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Üye kataloğu</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-[var(--muted)]">
            Onaylı üyeleri sektör ve arama ile listeleyin. Önce bu bölümleri inceledikten sonra kataloga geçmeniz
            önerilir.
          </p>
          <Link
            href="/katalog"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-10 py-3.5 text-sm font-semibold text-black shadow-sm transition hover:brightness-95"
          >
            Katalogu görüntüle
          </Link>
        </section>
      </main>

      <DemandChatbot />

      <footer className="border-t border-[var(--card-border)] bg-[var(--footer-bg)] py-8 text-center text-xs text-[var(--muted)]">
        <p>© Türk Tudun · Ticaret ve hizmet platformu</p>
      </footer>
    </div>
  );
}
