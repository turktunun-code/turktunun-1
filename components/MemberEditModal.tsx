"use client";

import { useEffect, useState } from "react";
import { parseAdminApiResponse } from "@/lib/admin-fetch";

export type MemberEditFields = {
  fullName: string;
  sector: string;
  brand: string;
  materials: string;
  location: string;
  contact: string;
  digitalContact: string;
  reference: string;
  rank: string;
};

type Props = {
  open: boolean;
  lineageKey: string | null;
  initial: MemberEditFields | null;
  onClose: () => void;
  onSaved: () => void;
  storageReady: boolean;
};

const inputClass =
  "mt-1 w-full rounded-xl border border-[var(--card-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--foreground)] outline-none ring-[var(--accent)] focus:ring-2";

export function MemberEditModal({ open, lineageKey, initial, onClose, onSaved, storageReady }: Props) {
  const [fields, setFields] = useState<MemberEditFields | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && initial) {
      setFields({ ...initial });
    }
  }, [open, initial]);

  if (!open || !lineageKey) return null;

  if (!fields) return null;

  function set<K extends keyof MemberEditFields>(k: K, v: string) {
    setFields((prev) => (prev ? { ...prev, [k]: v } : prev));
  }

  async function save() {
    if (!fields) return;
    if (!fields.fullName.trim()) {
      alert("Tam ad boş olamaz.");
      return;
    }
    if (!storageReady) {
      alert("Supabase gerekli.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          action: "update",
          lineageKey,
          patch: fields,
        }),
      });
      const parsed = await parseAdminApiResponse(res);
      if (!parsed.ok) {
        alert(parsed.error ?? "Kaydedilemedi.");
        return;
      }
      onSaved();
      onClose();
      alert("Üye bilgileri veritabanında güncellendi.");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Ağ hatası.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-edit-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-xl">
        <h2 id="member-edit-title" className="text-lg font-semibold text-[var(--foreground)]">
          Üye bilgisini düzenle
        </h2>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Buradaki değişiklikler Supabase üzerinde saklanır ve katalogda gösterilir.
        </p>

        <div className="mt-4 space-y-3 text-sm">
          <label className="block font-medium text-[var(--foreground)]">
            Tam ad
            <input className={inputClass} value={fields.fullName} onChange={(e) => set("fullName", e.target.value)} />
          </label>
          <label className="block font-medium text-[var(--foreground)]">
            Sektör
            <input className={inputClass} value={fields.sector} onChange={(e) => set("sector", e.target.value)} />
          </label>
          <label className="block font-medium text-[var(--foreground)]">
            Marka
            <input className={inputClass} value={fields.brand} onChange={(e) => set("brand", e.target.value)} />
          </label>
          <label className="block font-medium text-[var(--foreground)]">
            Hammadde / ihtiyaç
            <input className={inputClass} value={fields.materials} onChange={(e) => set("materials", e.target.value)} />
          </label>
          <label className="block font-medium text-[var(--foreground)]">
            Konum
            <input className={inputClass} value={fields.location} onChange={(e) => set("location", e.target.value)} />
          </label>
          <label className="block font-medium text-[var(--foreground)]">
            İletişim (telefon vb.)
            <input className={inputClass} value={fields.contact} onChange={(e) => set("contact", e.target.value)} />
          </label>
          <label className="block font-medium text-[var(--foreground)]">
            Dijital iletişim
            <input
              className={inputClass}
              value={fields.digitalContact}
              onChange={(e) => set("digitalContact", e.target.value)}
            />
          </label>
          <label className="block font-medium text-[var(--foreground)]">
            Rütbe / kıdem
            <input className={inputClass} value={fields.rank} onChange={(e) => set("rank", e.target.value)} />
          </label>
          <label className="block font-medium text-[var(--foreground)]">
            Referans
            <input className={inputClass} value={fields.reference} onChange={(e) => set("reference", e.target.value)} />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void save()}
            disabled={!storageReady || saving}
            className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
          >
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-full border border-[var(--card-border)] px-5 py-2.5 text-sm font-medium disabled:opacity-50"
          >
            Vazgeç
          </button>
        </div>
      </div>
    </div>
  );
}
