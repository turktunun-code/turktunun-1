import type { Metadata } from "next";
import { MembershipForm, MembershipPageShell } from "@/components/MembershipForm";
import { TAGLINE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Üyelik başvurusu | Türk Tudun",
  description: `Türk Tudun üyelik başvuru formu. ${TAGLINE}`,
};

export default function KayitPage() {
  return (
    <MembershipPageShell>
      <MembershipForm />
    </MembershipPageShell>
  );
}
