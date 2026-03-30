"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { Member } from "@/lib/member";

function displayOrDash(value: string | undefined): string {
  const v = (value ?? "").trim();
  if (!v || v === "( - )" || v === "(VERİ BEK.)") return "—";
  return v;
}

function truncate(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function MemberDetails({ m }: { m: Member }) {
  return (
    <dl className="flex flex-col gap-2.5 text-sm">
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Sektör</dt>
        <dd className="text-[var(--foreground)]/92">{displayOrDash(m.sector)}</dd>
      </div>
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Marka / unvan</dt>
        <dd className="text-[var(--foreground)]/92">{displayOrDash(m.brand)}</dd>
      </div>
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Hammadde ve ihtiyaç</dt>
        <dd className="text-[var(--foreground)]/92">{displayOrDash(m.materials)}</dd>
      </div>
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Konum</dt>
        <dd className="text-[var(--foreground)]/92">{displayOrDash(m.location)}</dd>
      </div>
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">İletişim</dt>
        <dd className="text-[var(--foreground)]/92">{displayOrDash(m.contact)}</dd>
      </div>
      {m.digitalContact?.trim() ? (
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Dijital iletişim</dt>
          <dd className="break-words text-[var(--foreground)]/92">{m.digitalContact}</dd>
        </div>
      ) : null}
      {m.reference?.trim() && m.reference.trim() !== "( - )" ? (
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Referans</dt>
          <dd className="text-[var(--foreground)]/92">{m.reference}</dd>
        </div>
      ) : null}
    </dl>
  );
}

type Props = {
  m: Member;
  badge?: ReactNode;
};

export function MemberHoverCard({ m, badge }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const id = useId();
  const wrapRef = useRef<HTMLDivElement>(null);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) closeMobile();
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [mobileOpen, closeMobile]);

  const sectorShort = truncate(displayOrDash(m.sector), 72);
  const locShort = truncate(displayOrDash(m.location), 48);

  return (
    <div
      ref={wrapRef}
      className="group relative z-0 h-full min-h-[132px] overflow-visible md:hover:z-[100]"
    >
      <article className="flex h-full flex-col rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-sm transition-[box-shadow] hover:shadow-md dark:shadow-none md:group-hover:shadow-md">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h2 className="text-base font-semibold leading-snug text-[var(--foreground)]">
            {displayOrDash(m.fullName)}
          </h2>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {badge}
            {m.rank ? (
              <span className="rounded-full bg-[var(--accent)]/25 px-2.5 py-0.5 text-[11px] font-medium text-[var(--foreground)] dark:bg-[var(--accent)]/20">
                {m.rank}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-1.5 text-sm text-[var(--muted)]">
          <p>
            <span className="font-medium text-[var(--foreground)]/88">{sectorShort}</span>
          </p>
          <p className="text-xs leading-relaxed">
            <span className="text-[var(--foreground)]/80">{truncate(displayOrDash(m.brand), 56)}</span>
            {locShort !== "—" ? (
              <>
                {" · "}
                <span>{locShort}</span>
              </>
            ) : null}
          </p>
        </div>

        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-controls={`${id}-details`}
          className="mt-3 w-full rounded-lg border border-[var(--card-border)] py-2 text-center text-xs font-medium text-[var(--foreground)] transition hover:border-[var(--accent)]/50 md:hidden"
          onClick={(e) => {
            e.stopPropagation();
            setMobileOpen((v) => !v);
          }}
        >
          {mobileOpen ? "Özeti göster" : "Tam profili aç"}
        </button>

        <p className="mt-2 hidden text-[10px] uppercase tracking-wide text-[var(--muted)] md:block">
          Profil için yüzeyin üzerine gelin
        </p>
      </article>

      {/* Masaüstü: HoverCard */}
      <div
        id={`${id}-details`}
        role="region"
        aria-label="Üye profili ayrıntıları"
        className="pointer-events-none invisible absolute left-0 right-0 top-[calc(100%-1px)] z-[2] mt-0 max-h-[min(70vh,340px)] origin-top scale-[0.99] overflow-y-auto rounded-b-2xl border border-[var(--card-border)] bg-[var(--card-elevated)] p-4 opacity-0 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.45)] transition duration-150 ease-out dark:bg-[var(--card)] max-md:hidden md:pointer-events-none md:group-hover:pointer-events-auto md:group-hover:visible md:group-hover:scale-100 md:group-hover:opacity-100"
      >
        <MemberDetails m={m} />
      </div>

      {/* Mobil: genişleyen panel */}
      <div
        className={`overflow-hidden rounded-b-2xl border border-[var(--card-border)] border-t-0 bg-[var(--card-elevated)] transition-all duration-200 dark:bg-[var(--card)] md:hidden ${
          mobileOpen ? "max-h-[min(70vh,360px)] opacity-100" : "max-h-0 border-transparent opacity-0"
        }`}
      >
        <div className="max-h-[min(70vh,360px)] overflow-y-auto p-4">
          <MemberDetails m={m} />
        </div>
      </div>
    </div>
  );
}
