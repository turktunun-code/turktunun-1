import { WelcomeEntry } from "@/components/WelcomeEntry";
import { TAGLINE } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hoş geldiniz | Türk Tudun",
  description: `Türk Tudun üye bilgi platformuna giriş. ${TAGLINE}`,
};

export default function HomePage() {
  return <WelcomeEntry />;
}
