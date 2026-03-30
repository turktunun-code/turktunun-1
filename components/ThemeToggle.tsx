"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <span
        className={`inline-flex h-10 w-10 shrink-0 rounded-full border border-[var(--card-border)] bg-[var(--card)] ${className}`}
        aria-hidden
      />
    );
  }

  const isDark = (theme === "system" ? resolvedTheme : theme) === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${className}`}
      title={isDark ? "Açık renk temasına geç" : "Koyu renk temasına geç"}
      aria-label={isDark ? "Açık renk temasını etkinleştir" : "Koyu renk temasını etkinleştir"}
    >
      {isDark ? (
        <span className="text-lg" aria-hidden>
          ☀
        </span>
      ) : (
        <span className="text-lg" aria-hidden>
          ☽
        </span>
      )}
    </button>
  );
}
