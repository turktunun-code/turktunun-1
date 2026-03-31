"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function AdminLoginForm({ misconfigured }: { misconfigured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Kimlik doğrulama başarısızdır.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Sunucu ile iletişim kurulamadı. Ağ bağlantınızı kontrol ediniz.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-full flex-col bg-[var(--background)] text-[var(--foreground)]">
      <header className="flex items-center justify-between border-b border-[var(--card-border)] px-4 py-4">
        <span className="text-sm font-semibold text-[var(--muted)]">Türk Tudun | Yönetim oturumu</span>
        <ThemeToggle />
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
        <h1 className="text-2xl font-bold">Yönetici girişi</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          İstatistik raporları, kurumsal logo ayarı ve üye onay süreçlerine erişmek için oturum açınız.
        </p>

        {misconfigured ? (
          <div
            className="mt-6 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-[var(--foreground)]"
            role="alert"
          >
            Oturum sırrı eksik veya çok kısa: barındırıcı ortamında en az on altı karakterlik{" "}
            <code className="font-mono text-xs">ADMIN_SESSION_SECRET</code> tanımlanmalıdır.{" "}
            <code className="font-mono text-xs">ADMIN_PASSWORD</code> da ayarlanmalıdır.
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm font-medium">
            Erişim parolası
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border border-[var(--card-border)] bg-[var(--input-bg)] px-4 py-3 text-[var(--foreground)] outline-none ring-[var(--accent)] focus:ring-2"
              required
            />
          </label>
          {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-[var(--accent)] py-3 text-sm font-semibold text-black transition hover:brightness-95 disabled:opacity-60"
          >
            {loading ? "Doğrulanıyor…" : "Oturumu aç"}
          </button>
        </form>
      </main>
    </div>
  );
}
