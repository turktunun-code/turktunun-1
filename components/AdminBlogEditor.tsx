"use client";

import { useEffect, useState } from "react";
import { parseAdminApiResponse } from "@/lib/admin-fetch";
import type { HomeBlogItem } from "@/lib/home-content";

const inputClass =
  "rounded-xl border border-[var(--card-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--foreground)] outline-none ring-[var(--accent)] focus:ring-2";

type Props = {
  initialItems: HomeBlogItem[];
  canSave: boolean;
  hasPersistedOverride: boolean;
  onSaved: () => void;
};

export function AdminBlogEditor({ initialItems, canSave, hasPersistedOverride, onSaved }: Props) {
  const [items, setItems] = useState<HomeBlogItem[]>(initialItems);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  function patch(id: string, field: keyof HomeBlogItem, value: string | number) {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, [field]: value } : x)));
  }

  function add() {
    const id = `b-${Date.now()}`;
    setItems((prev) => [
      ...prev,
      {
        id,
        date: new Date().toISOString().slice(0, 10),
        title: "",
        excerpt: "",
        readMinutes: 5,
      },
    ]);
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/home-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ blog: items }),
      });
      const parsed = await parseAdminApiResponse(res);
      if (!parsed.ok) {
        alert(parsed.error ?? "Kaydedilemedi.");
        return;
      }
      onSaved();
      alert("Blog kayıtları kaydedildi.");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Ağ hatası. Bağlantınızı kontrol edin.");
    } finally {
      setSaving(false);
    }
  }

  async function resetDefaults() {
    if (!confirm("Kayıtlı blog listesi silinsin mi? Anasayfa tekrar lib/home-content.ts varsayılanına döner.")) {
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/home-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ resetBlog: true }),
      });
      const parsed = await parseAdminApiResponse(res);
      if (!parsed.ok) {
        alert(parsed.error ?? "İşlem başarısız.");
        return;
      }
      onSaved();
      alert("Blog varsayılan içeriğe alındı.");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Ağ hatası.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
      <h2 className="text-lg font-semibold">Blog içerikleri</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Özet metinleri anasayfada listelenir. Okuma süresi tahmini dakikadır (1–240).
      </p>
      <p className="mt-2 text-xs text-[var(--muted)]">
        Şu anki kaynak:{" "}
        <strong className="text-[var(--foreground)]">
          {hasPersistedOverride ? "Kayıtlı içerik (Supabase veya dosya)" : "lib/home-content.ts varsayılanı"}
        </strong>
      </p>

      <div className="mt-6 space-y-5">
        {items.map((b) => (
          <div
            key={b.id}
            className="rounded-xl border border-[var(--card-border)] bg-[var(--card-elevated)] p-4 dark:bg-[var(--input-bg)]"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-[var(--muted)]">#{b.id}</span>
              <label className="flex items-center gap-2 text-xs text-[var(--muted)]">
                Tarih
                <input
                  type="date"
                  value={b.date}
                  onChange={(e) => patch(b.id, "date", e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="flex items-center gap-2 text-xs text-[var(--muted)]">
                Okuma (dk)
                <input
                  type="number"
                  min={1}
                  max={240}
                  value={b.readMinutes}
                  onChange={(e) => patch(b.id, "readMinutes", Math.max(1, Math.min(240, Number(e.target.value) || 1)))}
                  className={`${inputClass} w-20`}
                />
              </label>
              <button
                type="button"
                onClick={() => remove(b.id)}
                className="ml-auto rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-500/10 dark:text-red-400"
              >
                Sil
              </button>
            </div>
            <label className="mt-3 block text-sm font-medium text-[var(--foreground)]">
              Başlık
              <input
                className={`${inputClass} mt-1 w-full`}
                value={b.title}
                onChange={(e) => patch(b.id, "title", e.target.value)}
                placeholder="Yazı başlığı"
              />
            </label>
            <label className="mt-3 block text-sm font-medium text-[var(--foreground)]">
              Özet
              <textarea
                className={`${inputClass} mt-1 min-h-[100px] w-full resize-y`}
                value={b.excerpt}
                onChange={(e) => patch(b.id, "excerpt", e.target.value)}
                placeholder="Giriş veya özet paragraf"
                rows={5}
              />
            </label>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={add}
          disabled={!canSave || saving}
          className="rounded-full border border-[var(--card-border)] px-5 py-2.5 text-sm font-medium hover:border-[var(--accent)] disabled:opacity-50"
        >
          Yeni yazı
        </button>
        <button
          type="button"
          onClick={() => void save()}
          disabled={!canSave || saving}
          className="rounded-full bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
        >
          {saving ? "Kaydediliyor…" : "Değişiklikleri kaydet"}
        </button>
        <button
          type="button"
          onClick={() => void resetDefaults()}
          disabled={!canSave || saving || !hasPersistedOverride}
          className="rounded-full border border-[var(--card-border)] px-5 py-2.5 text-sm font-medium hover:border-amber-500/50 disabled:opacity-50"
        >
          Varsayılana dön
        </button>
      </div>
    </section>
  );
}
