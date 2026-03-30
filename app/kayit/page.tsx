import type { Metadata } from "next";
import { MembershipForm, MembershipPageShell } from "@/components/MembershipForm";
import { FORM_URL, TAGLINE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Üyelik başvurusu | Türk Tudun",
  description: `Türk Tudun üyelik başvuru formu. ${TAGLINE}`,
};

export default function KayitPage() {
  return (
    <MembershipPageShell>
      <MembershipForm />
      <section className="mt-12 rounded-2xl border border-[var(--card-border)] bg-[var(--card-elevated)] p-5 dark:bg-[var(--card)]">
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          Altyapı kısıtı veya kurum içi süreç gereği yedek kanal kullanmanız durumunda, aynı kapsamdaki bilgileri{" "}
          <a
            href={FORM_URL}
            className="font-medium text-[var(--foreground)] underline decoration-[var(--accent)] underline-offset-4"
            target="_blank"
            rel="noopener noreferrer"
          >
            resmî Google Form
          </a>{" "}
          üzerinden de iletebilirsiniz.
        </p>
      </section>
    </MembershipPageShell>
  );
}
