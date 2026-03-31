"use client";

import { useEffect, useRef, useState } from "react";

const CLIPS = {
  greet: "/bot/selamlama.mp4",
  search: "/bot/arama.mp4",
  found: "/bot/bulma.mp4",
} as const;

/** Alfa kanallı WebM (npm run bot-webm → public/bot/*.webm). Ağ isteği ile tespit edilmez — 404 log üretmemek için yalnızca env ile açılır. */
const WEBM_CLIPS = {
  greet: "/bot/selamlama.webm",
  search: "/bot/arama.webm",
  found: "/bot/bulma.webm",
} as const;

function envFlag(name: string): boolean {
  const v = process.env[name]?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

/**
 * `public/bot/` altına webm/mp4 koyduysanız .env'de açın (yoksa ağda /bot/* isteği yapılmaz).
 * npm run bot-webm + dosyaları commit / deploy sonrası: NEXT_PUBLIC_BOT_WEBM=1
 */
const BOT_VIDEO_ASSETS_ENABLED = envFlag("NEXT_PUBLIC_BOT_WEBM");

export type ChatbotAvatarPhase = keyof typeof CLIPS;

function canPlayVp9Webm(): boolean {
  if (typeof document === "undefined") return false;
  const v = document.createElement("video");
  const t = v.canPlayType("video/webm; codecs=vp9");
  return t === "probably" || t === "maybe";
}

type Props = {
  phase: ChatbotAvatarPhase;
  className?: string;
};

function BotFallback({ className }: { className: string }) {
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[var(--accent)]/35 to-[var(--accent)]/15 ring-2 ring-inset ring-[var(--accent)]/55 ${className}`}
      aria-hidden
    >
      <svg viewBox="0 0 64 64" className="h-[55%] w-[55%] text-[var(--accent)]" fill="currentColor">
        <circle cx="32" cy="30" r="18" opacity="0.9" />
        <circle cx="26" cy="28" r="4" className="fill-[var(--card)]" />
        <circle cx="38" cy="28" r="4" className="fill-[var(--card)]" />
        <rect x="24" y="38" width="16" height="6" rx="2" className="fill-[var(--card)]" />
      </svg>
    </div>
  );
}

export function ChatbotAvatar({ phase, className = "" }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mp4 = CLIPS[phase];
  const webm = WEBM_CLIPS[phase];
  const [videoFailed, setVideoFailed] = useState(false);
  const usesRealAlpha = BOT_VIDEO_ASSETS_ENABLED && canPlayVp9Webm();
  const useMultiplyFallback = !usesRealAlpha;

  useEffect(() => {
    setVideoFailed(false);
  }, [phase]);

  useEffect(() => {
    if (!BOT_VIDEO_ASSETS_ENABLED || videoFailed) return;
    const el = videoRef.current;
    if (!el) return;
    el.load();
    void el.play().catch(() => {});
  }, [phase, mp4, usesRealAlpha, videoFailed]);

  if (!BOT_VIDEO_ASSETS_ENABLED || videoFailed) {
    return <BotFallback className={className} />;
  }

  return (
    <div
      className={`relative isolate flex shrink-0 items-center justify-center overflow-hidden rounded-full ${className}`}
    >
      {/*
        Açık tema + yalnız MP4: multiply beyaz zemini yumuşatır.
        Koyu temada multiply karakteri arka planla birleştirip görünmez yapar → dark:mix-blend-normal.
      */}
      {useMultiplyFallback ? (
        <div
          className="pointer-events-none absolute inset-0 z-0 rounded-full bg-[var(--background)] dark:hidden"
          aria-hidden
        />
      ) : null}
      <div
        className="pointer-events-none absolute inset-0 z-[2] rounded-full ring-2 ring-inset ring-[var(--accent)]/55"
        aria-hidden
      />
      <video
        ref={videoRef}
        key={`${phase}-${usesRealAlpha ? "a" : "b"}`}
        className={`relative z-[1] h-full w-full scale-[1.08] object-contain ${
          useMultiplyFallback ? "mix-blend-multiply dark:mix-blend-normal" : ""
        } ${
          useMultiplyFallback
            ? "dark:brightness-110 dark:contrast-105 dark:drop-shadow-[0_0_16px_rgba(48,213,200,0.55)]"
            : ""
        }`}
        muted
        playsInline
        loop
        autoPlay
        aria-hidden
        onError={() => setVideoFailed(true)}
      >
        {usesRealAlpha ? <source src={webm} type="video/webm; codecs=vp9" /> : null}
        <source src={mp4} type="video/mp4" />
      </video>
    </div>
  );
}
