/** Admin API yanıtları: HTML hata sayfası veya boş gövde geldiğinde res.json() çökmez. */
export async function parseAdminApiResponse(res: Response): Promise<{ ok: boolean; error?: string }> {
  const text = await res.text();
  if (!text.trim()) {
    return {
      ok: res.ok,
      error: res.ok ? undefined : `Sunucu boş yanıt döndü (HTTP ${res.status}).`,
    };
  }
  try {
    const data = JSON.parse(text) as { error?: string };
    if (!res.ok) {
      return { ok: false, error: data.error ?? `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch {
    const hint = text.trimStart().startsWith("<")
      ? "Oturum süresi dolmuş veya sunucu hata sayfası döndü. Sayfayı yenileyip tekrar giriş yapın."
      : text.slice(0, 280);
    return {
      ok: false,
      error: `Geçersiz yanıt (HTTP ${res.status}). ${hint}`,
    };
  }
}
