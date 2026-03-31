"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChatbotAvatar, type ChatbotAvatarPhase } from "@/components/ChatbotAvatar";

type Msg = { role: "bot" | "user"; text: string };

type Props = {
  /** Katalog / öneriler sayfasındaki sektör süzgeci; anasayfada genelde boş bırakılır */
  sectorFilter?: string;
};

export function DemandChatbot({ sectorFilter = "" }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  /** Gönderim sonrası: önce arama (işleniyor), bot yanıtından sonra bulma (liste hazır) */
  const [postSubmitPhase, setPostSubmitPhase] = useState<null | "search" | "found">(null);
  const panelScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setPostSubmitPhase(null);
      setMessages([
        {
          role: "bot",
          text: "Merhaba. Aradığınız hizmeti, ürünü veya iş birliği alanını birkaç cümleyle yazın; talebinize uygun üyeleri ayrı bir sonuç sayfasında sıralayayım.",
        },
      ]);
    } else {
      setMessages([]);
      setInput("");
      setBusy(false);
      setPostSubmitPhase(null);
    }
  }, [open]);

  useEffect(() => {
    const el = panelScrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  const avatarPhase: ChatbotAvatarPhase = useMemo(() => {
    if (!open) return "greet";
    if (postSubmitPhase === "found") return "found";
    if (postSubmitPhase === "search" || busy) return "search";
    if (input.trim().length > 0) return "search";
    return "greet";
  }, [open, postSubmitPhase, busy, input]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || busy) return;

    setInput("");
    setBusy(true);
    setPostSubmitPhase("search");
    setMessages((m) => [...m, { role: "user", text }]);

    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "search", query: text.slice(0, 200) }),
    });

    await new Promise((r) => setTimeout(r, 450));

    setMessages((m) => [
      ...m,
      {
        role: "bot",
        text: "Talebinizi işledim. Uyumlu üye kayıtlarını sonuç sayfasında listeliyorum.",
      },
    ]);
    setPostSubmitPhase("found");

    await new Promise((r) => setTimeout(r, 520));

    const q = new URLSearchParams();
    q.set("demand", text);
    const sec = sectorFilter.trim();
    if (sec) q.set("sector", sec);
    router.push(`/oneriler?${q.toString()}`);
    setOpen(false);
    setBusy(false);
    setPostSubmitPhase(null);
  }, [busy, input, router, sectorFilter]);

  const fabSize = "h-[5.25rem] w-[5.25rem] sm:h-24 sm:w-24 md:h-[6.5rem] md:w-[6.5rem]";
  const panelAvatarSize = "h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]";

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Talep asistanını kapat" : "Talep asistanını aç"}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-[200] flex items-center justify-center rounded-full bg-transparent p-0 shadow-lg shadow-black/15 ring-2 ring-[var(--accent)]/45 ring-offset-2 ring-offset-[var(--background)] transition hover:scale-[1.04] hover:ring-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] md:bottom-8 md:right-8"
      >
        <ChatbotAvatar phase={avatarPhase} className={fabSize} />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[190] bg-black/35 backdrop-blur-[2px] md:bg-black/25"
          aria-hidden
          onClick={() => !busy && setOpen(false)}
        />
      ) : null}

      <div
        className={`fixed right-5 z-[210] flex w-[min(100vw-2rem,400px)] flex-col overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-2xl transition-all duration-200 md:right-8 ${
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        } bottom-[calc(5.25rem+4.5rem)] sm:bottom-[calc(6rem+5rem)] md:bottom-[calc(7rem+5.5rem)]`}
        role="dialog"
        aria-modal="true"
        aria-label="Talep asistanı"
      >
        <div className="flex items-center gap-3 border-b border-[var(--card-border)] bg-[var(--card-elevated)] px-4 py-3 dark:bg-[var(--card)]">
          <ChatbotAvatar phase={avatarPhase} className={`shrink-0 ${panelAvatarSize}`} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[var(--foreground)]">Talep asistanı</p>
            <p className="truncate text-xs text-[var(--muted)]">Talep temelli üye eşleştirme</p>
          </div>
          <button
            type="button"
            disabled={busy}
            className="rounded-full px-2 py-1 text-xs font-medium text-[var(--muted)] hover:bg-[var(--card-border)]/40 hover:text-[var(--foreground)] disabled:opacity-50"
            onClick={() => setOpen(false)}
          >
            Kapat
          </button>
        </div>

        <div ref={panelScrollRef} className="max-h-[min(52vh,360px)] space-y-3 overflow-y-auto px-4 py-3">
          {messages.map((msg, i) => (
            <div
              key={`${i}-${msg.text.slice(0, 24)}`}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "rounded-br-md bg-[var(--accent)]/85 text-black"
                    : "rounded-bl-md border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)]"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-[var(--card-border)] p-3">
          <div className="flex gap-2">
            <textarea
              value={input}
              disabled={busy}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              rows={2}
              placeholder="Örn: Ankara merkezli lojistik ortağı, yazılım ekipleri için bulut altyapısı…"
              className="max-h-28 min-h-[52px] flex-1 resize-y rounded-xl border border-[var(--card-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--foreground)] outline-none ring-[var(--accent)] placeholder:text-[var(--muted)] focus:ring-2"
            />
            <button
              type="button"
              disabled={busy || !input.trim()}
              onClick={() => void send()}
              className="self-end rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-black transition hover:brightness-95 disabled:opacity-45"
            >
              Gönder
            </button>
          </div>
          {sectorFilter.trim() ? (
            <p className="mt-2 text-[10px] text-[var(--muted)]">
              Sektör filtresi aktarılacak: <span className="font-medium text-[var(--foreground)]/80">{sectorFilter}</span>
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
}
