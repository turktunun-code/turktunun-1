import { redirect } from "next/navigation";

/** Eski bağlantılar: kök adres artık giriş sayfasıdır. */
export default function GirisRedirectPage() {
  redirect("/");
}
