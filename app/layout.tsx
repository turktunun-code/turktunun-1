import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TAGLINE } from "@/lib/constants";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Türk Tudun | Üye Bilgi Platformu",
  description:
    "Türk Tudun: Ticaret ve hizmet alanında faaliyet gösteren üyelerin kurumsal dijital kataloğu. İletişim ve sektör bilgilerine tek noktadan erişim.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] transition-colors">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
