"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TAGLINE } from "@/lib/constants";

const HERO_SRC = "/welcome/hero.png";
const DEVELOPER_SITE = "https://www.dogukankardas.com";

export function WelcomeEntry() {
  return (
    <div className="relative min-h-dvh min-h-screen w-full overflow-hidden bg-[#0a1210] text-[var(--foreground)]">
      {/* Tam çözünürlük: orijinal PNG, build sırasında yeniden örneklenmez */}
      <div className="absolute inset-0">
        <img
          src={HERO_SRC}
          alt="Türk Tudun: tarihî ticaret hanı ve kurumsal mühür illüstrasyonu"
          decoding="async"
          fetchPriority="high"
          className="h-full w-full object-cover object-center"
        />
      </div>

      {/* Okunabilirlik ve tema uyumu */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0b1210]/55 via-[#0b1210]/15 to-[#061015]/92 dark:from-black/65 dark:via-black/25 dark:to-black/90"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_0%,transparent_20%,rgba(6,16,21,0.75)_100%)] dark:bg-[radial-gradient(ellipse_100%_70%_at_50%_0%,transparent_15%,rgba(0,0,0,0.55)_100%)]"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-dvh min-h-screen flex-col">
        <header className="flex items-center justify-end gap-3 px-4 py-4 sm:px-8">
          <span className="mr-auto text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
            Hoş geldiniz
          </span>
          <ThemeToggle className="border-white/35 bg-white/12 text-white backdrop-blur-md hover:border-[var(--accent)] hover:text-[var(--accent)]" />
        </header>

        <main className="flex flex-1 flex-col items-center justify-end px-4 pb-10 pt-4 sm:justify-center sm:pb-16 sm:pt-0 lg:items-end lg:pr-12 lg:pb-24">
          <div
            className="w-full max-w-md rounded-[1.75rem] border border-white/25 bg-white/12 p-8 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.45)] backdrop-blur-2xl dark:border-white/10 dark:bg-black/35 dark:shadow-[0_24px_80px_-12px_rgba(0,0,0,0.6)] sm:p-10"
            role="region"
            aria-label="Türk Tudun giriş seçenekleri"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[var(--accent)]">
              Ticaret &amp; hizmet
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">Türk Tudun</h1>
            <p className="mt-4 text-sm leading-relaxed text-white/85">{TAGLINE}</p>

            <nav className="mt-8 flex flex-col gap-3" aria-label="Site giriş bağlantıları">
              <Link
                href="/katalog"
                className="flex items-center justify-center rounded-2xl bg-[var(--accent)] py-3.5 text-center text-sm font-semibold text-black shadow-lg shadow-black/20 transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              >
                Üye kataloğuna geç
              </Link>
              <Link
                href="/kayit"
                className="flex items-center justify-center rounded-2xl border border-white/35 bg-white/10 py-3.5 text-center text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/18 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
              >
                Üyelik başvurusu
              </Link>
            </nav>

            <p className="mt-8 border-t border-white/10 pt-6 text-center text-[11px] leading-relaxed text-white/55">
              Bu çevrimiçi platformun geliştirilmesi{" "}
              <a
                href={DEVELOPER_SITE}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-white/85 underline decoration-[var(--accent)]/50 underline-offset-2 transition hover:text-[var(--accent)]"
              >
                Doğukan Kardaş
              </a>{" "}
              tarafından yapılmıştır.
            </p>
          </div>
        </main>

        <footer className="relative z-10 space-y-2 px-4 py-4 text-center sm:px-8">
          <p className="text-[11px] sm:text-xs">
            <span className="font-medium text-[var(--accent)]">© Türk Tudun</span>
            <span className="text-white/50"> · Ticaret ve hizmet platformu</span>
          </p>
          <p className="text-[10px] text-white/45 sm:text-[11px]">
            Dijital geliştirme:{" "}
            <a
              href={DEVELOPER_SITE}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-white/65 underline decoration-white/25 underline-offset-2 transition hover:text-[var(--accent)]"
            >
              Doğukan Kardaş
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
