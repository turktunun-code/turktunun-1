"use client";

import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Member } from "@/lib/member";

function useIsDesktopLayout(): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setOk(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return ok;
}

const linkClass =
  "font-medium text-[var(--accent)] underline-offset-2 outline-none transition hover:underline focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card-elevated)] rounded-sm";

/** Telefon / harita gibi birincil eylemler — metin linkinden ayrı, tıklanabilir düğüm gibi görünür. */
const actionChipClass =
  "inline-flex items-center gap-1.5 rounded-xl border border-[var(--accent)]/45 bg-[var(--accent)]/12 px-3 py-2 text-[13px] font-semibold text-[var(--accent)] shadow-sm outline-none transition hover:bg-[var(--accent)]/20 hover:border-[var(--accent)]/65 focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card-elevated)] active:scale-[0.98]";

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

/** Türkiye biçimi numaralar için tel: öneki (0 / +90). */
function toTelHref(segment: string): string | null {
  const digits = segment.replace(/\D/g, "");
  if (digits.length < 10) return null;
  if (digits.startsWith("90") && digits.length >= 12) return `tel:+${digits}`;
  if (digits.startsWith("0") && digits.length >= 11) return `tel:+90${digits.slice(1)}`;
  if (digits.length === 10 && digits.startsWith("5")) return `tel:+90${digits}`;
  return `tel:+${digits}`;
}

function splitContactSegments(value: string): string[] {
  return value
    .split(/\s*[,;|/]\s*|\n+|\s+·\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function ContactLinks({ raw }: { raw: string }) {
  const segments = splitContactSegments(raw);
  if (segments.length === 0) return <span>—</span>;

  return (
    <span className="flex flex-wrap gap-2">
      {segments.map((seg, i) => {
        const tel = toTelHref(seg);
        return (
          <span key={`${i}-${seg.slice(0, 12)}`} className="inline-flex flex-col gap-1">
            {tel ? (
              <a href={tel} className={actionChipClass}>
                Ara · {seg}
              </a>
            ) : (
              <span className="text-[var(--foreground)]/90">{seg}</span>
            )}
          </span>
        );
      })}
    </span>
  );
}

function mapsSearchUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.trim())}`;
}

function linkifyText(text: string): ReactNode {
  const pattern = /(https?:\/\/[^\s<]+)|(www\.[^\s<]+)|([^\s<]+@[^\s<]+\.[^\s<]+)/gi;
  const nodes: ReactNode[] = [];
  let last = 0;
  const re = new RegExp(pattern.source, "gi");
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }
    const raw = match[0];
    let href = raw;
    let external = true;
    if (match[3]) {
      href = `mailto:${raw}`;
      external = false;
    } else if (match[2]) {
      href = `https://${raw}`;
    }
    nodes.push(
      <a
        key={`lnk-${key++}`}
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className={`${linkClass} break-all`}
      >
        {raw}
      </a>,
    );
    last = match.index + raw.length;
  }
  if (last < text.length) {
    nodes.push(text.slice(last));
  }
  return nodes.length > 0 ? <>{nodes}</> : text;
}

function formatDigitalLabel(raw: string): string {
  const k = raw.toLowerCase().replace(/\./g, "").replace(/\s+/g, " ").trim();
  const map: Record<string, string> = {
    "e-posta": "E-posta",
    eposta: "E-posta",
    email: "E-posta",
    mail: "E-posta",
    tercih: "Tercih",
    wa: "WhatsApp",
    whatsapp: "WhatsApp",
    ig: "Instagram",
    instagram: "Instagram",
    linkedin: "LinkedIn",
    linkedincom: "LinkedIn",
    web: "Web",
    site: "Web sitesi",
    website: "Web sitesi",
    twitter: "X (Twitter)",
    x: "X (Twitter)",
  };
  return map[k] ?? raw;
}

function parseDigitalSegment(seg: string): { label: string; value: string } {
  const trimmed = seg.trim();
  const known = trimmed.match(
    /^(e-posta|e\s*posta|eposta|email|mail|tercih|wa|whatsapp|ig|instagram|linkedin|web|site|website|twitter|x)\s*:\s*(.+)$/i,
  );
  if (known) {
    return { label: formatDigitalLabel(known[1]), value: known[2].trim() };
  }
  const scheme = trimmed.indexOf("://");
  const colonIdx = trimmed.indexOf(":");
  if (colonIdx > 0 && (scheme === -1 || colonIdx < scheme)) {
    const maybeLabel = trimmed.slice(0, colonIdx).trim();
    const rest = trimmed.slice(colonIdx + 1).trim();
    if (maybeLabel.length <= 36 && rest.length > 0) {
      return { label: formatDigitalLabel(maybeLabel), value: rest };
    }
  }
  return { label: "", value: trimmed };
}

function splitDigitalRaw(raw: string): string[] {
  const t = raw.trim();
  if (t.includes("|")) {
    return t
      .split(/\s*\|\s*/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (/\n/.test(t)) {
    return t
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [t];
}

function shortUrlDisplayText(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "wa.me" || host.endsWith(".whatsapp.com")) {
      return "WhatsApp’ta aç";
    }
    if (host.includes("instagram.com")) {
      const handle = u.pathname.split("/").filter(Boolean)[0];
      return handle ? `Instagram · @${handle}` : "Instagram profili";
    }
    if (host.includes("linkedin.com")) {
      return "LinkedIn profili";
    }
    if (host === "x.com" || host.includes("twitter.com")) {
      return "X (Twitter)";
    }
    if (host.includes("facebook.com")) {
      return "Facebook";
    }
    if (host.includes("youtube.com") || host === "youtu.be") {
      return "YouTube";
    }
    return host.length > 28 ? `${host.slice(0, 25)}…` : host;
  } catch {
    return "Bağlantıyı aç";
  }
}

function digitalValueContent(label: string, value: string): ReactNode {
  const v = value.trim();
  if (!v) return "—";

  const labelKey = label.toLowerCase();
  const emailOnly = /^[^\s@]+@[^\s@\s.]+\.[^\s@]+$/i.test(v);
  if (emailOnly || (labelKey.includes("posta") && v.includes("@"))) {
    const mail = v.match(/[^\s<]+@[^\s<]+\.[^\s<>]+/i)?.[0] ?? v;
    return (
      <a href={`mailto:${mail}`} className={linkClass}>
        {mail}
      </a>
    );
  }

  if (labelKey === "tercih" && !/^https?:\/\//i.test(v)) {
    return <span className="text-[var(--foreground)]/90">{v}</span>;
  }

  let url = v;
  if (!/^https?:\/\//i.test(url)) {
    if (/^www\./i.test(url)) url = `https://${url}`;
    else {
      if (/https?:\/\//i.test(v) || v.includes("@")) {
        return <div className="break-words leading-relaxed">{linkifyText(v)}</div>;
      }
      return <span className="text-[var(--foreground)]/90">{v}</span>;
    }
  }

  let validated: URL;
  try {
    validated = new URL(url);
  } catch {
    return <span className="break-words">{v}</span>;
  }

  const text = shortUrlDisplayText(validated.href);
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={`${linkClass} inline-flex`}>
      {text}
    </a>
  );
}

function DigitalContactBlock({ raw }: { raw: string }) {
  const segments = splitDigitalRaw(raw);
  const rows = segments.map(parseDigitalSegment).filter((r) => r.value.length > 0);

  if (rows.length === 0) {
    return <p className="text-[var(--muted)]">—</p>;
  }

  const looksStructured = rows.length > 1 || rows.some((r) => Boolean(r.label));
  if (!looksStructured && rows[0]) {
    const only = rows[0];
    if (!only.label && (only.value.includes("|") === false)) {
      return <div className="break-words leading-relaxed">{linkifyText(only.value)}</div>;
    }
  }

  return (
    <ul className="m-0 list-none divide-y divide-[var(--card-border)]/55 p-0">
      {rows.map((row, i) => {
        const heading = row.label.trim() || "Bilgi";
        return (
          <li key={`${i}-${heading}-${row.value.slice(0, 24)}`} className="py-2.5 first:pt-0 last:pb-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">{heading}</div>
            <div className="mt-1.5 min-w-0">{digitalValueContent(row.label || heading, row.value)}</div>
          </li>
        );
      })}
    </ul>
  );
}

function normalizeReferenceFieldLabel(key: string): string {
  const k = key.trim().toLowerCase().replace(/ı/g, "i");
  const map: Record<string, string> = {
    kaynak: "Kaynak",
    yapi: "Yapı",
    "yapı": "Yapı",
    unvan: "Unvan",
    pozisyon: "Pozisyon",
    firma: "Firma",
    kurum: "Kurum",
    iletisim: "İletişim",
    "iletişim": "İletişim",
    gorev: "Görev",
    "görev": "Görev",
  };
  const nk = k.normalize("NFD").replace(/\p{M}/gu, "");
  return map[k] ?? map[nk] ?? key.trim();
}

function parseReferenceRows(raw: string): { label: string; value: string }[] {
  const t = raw.trim();
  if (!t) return [];
  const parts = t.split(/\s*\|\s*/).map((s) => s.trim()).filter(Boolean);
  const out: { label: string; value: string }[] = [];
  for (const part of parts) {
    const kv = /^([^:|]{1,56}):\s*([\s\S]+)$/.exec(part);
    if (kv) {
      out.push({
        label: normalizeReferenceFieldLabel(kv[1]),
        value: kv[2].trim(),
      });
      continue;
    }
    out.push({ label: "Ad / kurum", value: part });
  }
  return out;
}

function ReferenceBlock({ raw }: { raw: string }) {
  const rows = parseReferenceRows(raw);
  if (rows.length === 0) {
    return <p className="text-[var(--muted)]">—</p>;
  }
  return (
    <ul className="m-0 list-none divide-y divide-[var(--card-border)]/55 p-0">
      {rows.map((row, i) => (
        <li key={`${i}-${row.label}-${row.value.slice(0, 20)}`} className="py-2.5 first:pt-0 last:pb-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">{row.label}</div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--foreground)]/90">{row.value}</p>
        </li>
      ))}
    </ul>
  );
}

function DetailRow({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <h3 className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.09em] text-[var(--muted)]">{title}</h3>
      <div className="text-[13px] leading-relaxed text-[var(--foreground)]/92">{children}</div>
    </div>
  );
}

/** Kaynak metinde kaybolan boşlukları düzeltir (örn. AlanlarıButik, ).Konsept). */
function normalizeNarrativeText(raw: string): string {
  let s = raw.trim().replace(/\s+/g, " ");
  s = s.replace(/\)\.([A-ZĞÜŞÖÇİ])/g, "). $1");
  s = s.replace(/\)([A-ZĞÜŞÖÇİ])/g, ") $1");
  s = s.replace(/([a-zığüşöçiİ])([A-ZĞÜŞÖÇİ])/g, "$1 $2");
  return s.replace(/\s+/g, " ").trim();
}

/** Cümle sonu, parantez + nokta kapanışı veya satır sonu sonrası böl. */
const MATERIAL_SENTENCE_SPLIT = /(?<=[.!?])\s+(?=[A-ZĞÜŞÖÇİ"(])|\)\.\s+(?=[A-ZĞÜŞÖÇİ])/g;

function splitMaterialParagraphs(block: string): string[] {
  const chunks = block
    .split(/\n+/)
    .map((x) => x.trim())
    .filter(Boolean);
  const out: string[] = [];
  for (const chunk of chunks) {
    const sentences = chunk
      .split(MATERIAL_SENTENCE_SPLIT)
      .map((x) => x.trim())
      .filter(Boolean);
    out.push(...(sentences.length > 0 ? sentences : [chunk]));
  }
  return out.length > 0 ? out : [block];
}

function formatMaterialParagraph(para: string): ReactNode {
  const m = /^([^:]+):\s+(.+)$/u.exec(para);
  if (m && m[1].trim().length >= 3 && m[1].trim().length <= 88) {
    return (
      <>
        <span className="font-semibold tracking-tight text-[var(--foreground)]">{m[1].trim()}:</span>
        <span className="text-[var(--foreground)]/88"> {m[2].trim()}</span>
      </>
    );
  }
  return <span className="text-[var(--foreground)]/88">{para}</span>;
}

function MaterialsBody({ raw }: { raw: string }) {
  const normalized = normalizeNarrativeText(raw);
  const paras = splitMaterialParagraphs(normalized);

  return (
    <div
      className="max-h-[12.5rem] space-y-3 overflow-y-auto pr-1 [scrollbar-width:thin]"
      style={{ scrollbarColor: "var(--card-border) transparent" } as CSSProperties}
    >
      {paras.map((para, i) => (
        <p key={`${i}-${para.slice(0, 24)}`} className="text-[13px] leading-[1.65]">
          {formatMaterialParagraph(para)}
        </p>
      ))}
    </div>
  );
}

/**
 * Başvuru formunda hammadde/ihtiyaç tek alanda; «Yok» ile başlayan kayıtlarda
 * önce ihtiyaç yok denir, devamı hizmet anlatımıdır (örn. «Yok Yazılım…»).
 */
function splitHizmetIhtiyac(raw: string): { hizmet: string; ihtiyaçEtiket: string | null } {
  const t = (raw ?? "").trim();
  if (!t) return { hizmet: "", ihtiyaçEtiket: null };
  const yok = /^yok(?:\s+|[.:;,]+|\s*$)(.*)$/i.exec(t);
  if (yok) {
    const rest = (yok[1] ?? "").trim();
    return { ihtiyaçEtiket: "Yok", hizmet: rest };
  }
  return { hizmet: t, ihtiyaçEtiket: null };
}

function MemberDetails({ m }: { m: Member }) {
  const sector = displayOrDash(m.sector);
  const brand = displayOrDash(m.brand);
  const materials = displayOrDash(m.materials);
  const materialsRaw = (m.materials ?? "").trim();
  const { hizmet, ihtiyaçEtiket } = splitHizmetIhtiyac(materialsRaw);
  const location = displayOrDash(m.location);
  const contact = displayOrDash(m.contact);
  const locRaw = (m.location ?? "").trim();
  const hasContact = contact !== "—" && (m.contact ?? "").trim().length > 0;
  const hasRef = Boolean(m.reference?.trim() && m.reference.trim() !== "( - )");
  const hasDigital = Boolean(m.digitalContact?.trim());
  const hasBlocks =
    sector !== "—" ||
    brand !== "—" ||
    materials !== "—" ||
    (location !== "—" && Boolean(locRaw)) ||
    hasContact ||
    hasDigital ||
    hasRef;

  return (
    <div className="rounded-2xl bg-[var(--foreground)]/[0.025] px-3.5 py-3 dark:bg-[var(--foreground)]/[0.05]">
      {!hasBlocks ? (
        <p className="px-1 py-6 text-center text-sm text-[var(--muted)]">Bu kayıt için ayrıntı girilmemiş.</p>
      ) : (
        <div className="divide-y divide-[var(--card-border)]/55">
          {sector !== "—" ? (
            <DetailRow title="Sektör">
              <p className="text-[var(--foreground)]/90">{sector}</p>
            </DetailRow>
          ) : null}

          {brand !== "—" ? (
            <DetailRow title="Marka / unvan">
              <p className="font-medium text-[var(--foreground)]">{brand}</p>
            </DetailRow>
          ) : null}

          {materials !== "—" ? (
            <>
              <DetailRow title="Hizmet">
                {hizmet.length > 0 ? <MaterialsBody raw={hizmet} /> : <p className="text-[var(--muted)]">—</p>}
              </DetailRow>
              <DetailRow title="İhtiyaç">
                {ihtiyaçEtiket !== null ? (
                  <p className="text-[var(--foreground)]/90">{ihtiyaçEtiket}</p>
                ) : (
                  <p className="text-[var(--muted)]">—</p>
                )}
              </DetailRow>
            </>
          ) : null}

          {location !== "—" && locRaw ? (
            <DetailRow title="Konum">
              <p className="mb-2.5 text-[var(--foreground)]/88">{location}</p>
              <a
                href={mapsSearchUrl(locRaw)}
                target="_blank"
                rel="noopener noreferrer"
                className={`${actionChipClass} w-fit`}
              >
                Haritada aç
              </a>
            </DetailRow>
          ) : null}

          {contact !== "—" && (m.contact ?? "").trim() ? (
            <DetailRow title="İletişim">
              <ContactLinks raw={(m.contact ?? "").trim()} />
            </DetailRow>
          ) : null}

          {m.digitalContact?.trim() ? (
            <DetailRow title="Dijital iletişim">
              <DigitalContactBlock raw={m.digitalContact.trim()} />
            </DetailRow>
          ) : null}

          {m.reference?.trim() && m.reference.trim() !== "( - )" ? (
            <DetailRow title="Referans">
              <ReferenceBlock raw={m.reference.trim()} />
            </DetailRow>
          ) : null}
        </div>
      )}
    </div>
  );
}

type Props = {
  m: Member;
  badge?: ReactNode;
};

const popupScrollbarStyle = { scrollbarColor: "var(--card-border) transparent" } as CSSProperties;

export function MemberHoverCard({ m, badge }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopPopupOpen, setDesktopPopupOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const id = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const isDesktopLayout = useIsDesktopLayout();

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const closeDesktopPopup = useCallback(() => setDesktopPopupOpen(false), []);

  useEffect(() => setPortalReady(true), []);

  useEffect(() => {
    if (!isDesktopLayout) setDesktopPopupOpen(false);
  }, [isDesktopLayout]);

  useEffect(() => {
    if (!desktopPopupOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDesktopPopupOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [desktopPopupOpen]);

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

  const openDesktopPopup = useCallback(() => {
    if (!isDesktopLayout) return;
    setDesktopPopupOpen(true);
  }, [isDesktopLayout]);

  const onArticleClick = useCallback(() => {
    openDesktopPopup();
  }, [openDesktopPopup]);

  const onArticleKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLElement>) => {
      if (!isDesktopLayout) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openDesktopPopup();
      }
    },
    [isDesktopLayout, openDesktopPopup],
  );

  const desktopPopup =
    portalReady &&
    desktopPopupOpen &&
    typeof document !== "undefined" &&
    createPortal(
      <>
        <button
          type="button"
          className="fixed inset-0 z-[9998] cursor-default border-0 bg-black/35 backdrop-blur-[2px] dark:bg-black/50 md:block max-md:hidden"
          aria-label="Profili kapat"
          onClick={closeDesktopPopup}
        />
        <div
          id={`${id}-desktop-dialog`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${id}-popup-title`}
          className="fixed left-1/2 top-1/2 z-[9999] flex max-h-[min(85vh,38rem)] w-[min(28rem,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card-elevated)] shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_28px_90px_-20px_rgba(0,0,0,0.55)] dark:bg-[var(--card)] max-md:!hidden"
        >
          <header className="relative shrink-0 border-b border-[var(--card-border)] bg-[var(--foreground)]/[0.04] px-4 py-3 pr-12 dark:bg-[var(--foreground)]/[0.06]">
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border border-transparent p-2 text-lg leading-none text-[var(--muted)] transition hover:border-[var(--card-border)] hover:bg-[var(--foreground)]/10 hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50"
              aria-label="Kapat"
              onClick={closeDesktopPopup}
            >
              ×
            </button>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">Üye profili</p>
            <p id={`${id}-popup-title`} className="mt-1 truncate pr-1 text-base font-semibold leading-snug text-[var(--foreground)]">
              {displayOrDash(m.fullName)}
            </p>
          </header>
          <div
            className="min-h-0 flex-1 overflow-y-auto p-4 [scrollbar-width:thin]"
            style={popupScrollbarStyle}
          >
            <MemberDetails m={m} />
          </div>
        </div>
      </>,
      document.body,
    );

  return (
    <div ref={wrapRef} className="relative z-0 min-h-[132px] h-auto md:h-full overflow-visible">
      <article
        role={isDesktopLayout ? "button" : undefined}
        tabIndex={isDesktopLayout ? 0 : -1}
        aria-expanded={isDesktopLayout ? desktopPopupOpen : undefined}
        aria-haspopup={isDesktopLayout ? "dialog" : undefined}
        aria-controls={isDesktopLayout ? `${id}-desktop-dialog` : undefined}
        className="flex h-auto min-h-0 flex-col rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-sm transition-[box-shadow] hover:shadow-md dark:shadow-none max-md:border-[color-mix(in_srgb,var(--card-border)_70%,transparent)] max-md:bg-[color-mix(in_srgb,var(--card)_72%,transparent)] max-md:backdrop-blur-lg max-md:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.35)] md:h-full md:cursor-pointer md:border-[var(--card-border)] md:bg-[var(--card)] md:backdrop-blur-none md:shadow-sm md:focus-visible:outline-none md:focus-visible:ring-2 md:focus-visible:ring-[var(--accent)]/45 md:focus-visible:ring-offset-2 md:focus-visible:ring-offset-[var(--card)]"
        onClick={onArticleClick}
        onKeyDown={onArticleKeyDown}
      >
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
        <div className="flex max-md:flex-none flex-col gap-1.5 text-sm text-[var(--muted)] md:flex-1">
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
          tabIndex={isDesktopLayout ? -1 : 0}
          aria-expanded={mobileOpen}
          aria-controls={`${id}-details`}
          className="mt-3 w-full rounded-lg border border-[var(--card-border)] bg-[color-mix(in_srgb,var(--card)_45%,transparent)] py-2 text-center text-xs font-medium text-[var(--foreground)] backdrop-blur-sm transition hover:border-[var(--accent)]/50 hover:bg-[color-mix(in_srgb,var(--card)_55%,transparent)] md:hidden"
          onClick={(e) => {
            e.stopPropagation();
            setMobileOpen((v) => !v);
          }}
        >
          {mobileOpen ? "Özeti göster" : "Tam profili aç"}
        </button>

        <p className="mt-2 hidden text-[10px] uppercase tracking-wide text-[var(--muted)] md:block">
          Ayrıntılar: kutuya tıklayın
        </p>
      </article>

      {desktopPopup}

      {/* Mobil: kartın altında genişleyen panel */}
      <div
        id={`${id}-details`}
        className={`overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[color-mix(in_srgb,var(--card-elevated)_70%,transparent)] shadow-md backdrop-blur-lg transition-all duration-200 md:hidden ${
          mobileOpen ? "mt-2 max-h-[min(85vh,480px)] opacity-100" : "mt-0 max-h-0 border-transparent opacity-0 shadow-none"
        }`}
      >
        <div
          className="max-h-[min(85vh,480px)] overflow-x-hidden overflow-y-auto p-4 [scrollbar-width:thin]"
          style={{ scrollbarColor: "var(--card-border) transparent" } as CSSProperties}
        >
          <MemberDetails m={m} />
        </div>
      </div>
    </div>
  );
}
