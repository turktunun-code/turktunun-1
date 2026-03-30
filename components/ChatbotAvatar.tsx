"use client";

import { useEffect, useRef, useState } from "react";

const CLIPS = {
  greet: "/bot/selamlama.mp4",
  search: "/bot/arama.mp4",
  found: "/bot/bulma.mp4",
} as const;

/** Alfa kanallı WebM varsa (npm run bot-webm) tarayıcı bunu kullanır; gerçek şeffaflık. */
const WEBM_CLIPS = {
  greet: "/bot/selamlama.webm",
  search: "/bot/arama.webm",
  found: "/bot/bulma.webm",
} as const;

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

export function ChatbotAvatar({ phase, className = "" }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mp4 = CLIPS[phase];
  const webm = WEBM_CLIPS[phase];
  /** Sunucuda .webm dosyası var mı */
  const [webmOnServer, setWebmOnServer] = useState(false);
  const usesRealAlpha = webmOnServer && canPlayVp9Webm();
  const useMultiplyFallback = !usesRealAlpha;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(webm, { method: "HEAD" });
        if (!cancelled && r.ok) setWebmOnServer(true);
      } catch {
        if (!cancelled) setWebmOnServer(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [webm]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.load();
    void el.play().catch(() => {});
  }, [phase, mp4, usesRealAlpha]);

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
      >
        <source src={webm} type="video/webm; codecs=vp9" />
        <source src={mp4} type="video/mp4" />
      </video>
    </div>
  );
}
