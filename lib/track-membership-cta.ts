/**
 * Kamuya açık «Üyelik başvurusu» /kayit bağlantılarında çağrılır; admin panelde günlük CTA sayılarına yazar.
 * Sunucu tarafında tarih anahtarı Europe/Istanbul ile üretilir (lib/analytics).
 */
export function trackMembershipFormCta(): void {
  void fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "form_cta" }),
  });
}
