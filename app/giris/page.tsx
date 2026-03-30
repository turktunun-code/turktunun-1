import type { Metadata } from "next";
import { WelcomeEntry } from "@/components/WelcomeEntry";
import { TAGLINE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Hoş geldiniz | Türk Tudun",
  description: `Türk Tudun üye bilgi platformuna giriş. ${TAGLINE}`,
};

export default function GirisPage() {
  return <WelcomeEntry />;
}
