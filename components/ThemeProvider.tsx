"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * `class` yerine `data-theme`: layout'taki html `className` (font değişkenleri) ile çakışmaz;
 * `:root` + `.dark` aynı elemanda eşit özgüllük sorununu da önler.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="turktudun-theme"
    >
      {children}
    </NextThemesProvider>
  );
}
