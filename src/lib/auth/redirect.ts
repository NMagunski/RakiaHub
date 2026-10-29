/** Accept only local app destinations, never protocol-relative or auth loops. */
export function safeReturnPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\x00-\x20]/.test(value)) return "/discover";
  try {
    const base = "https://rakiq.invalid";
    const url = new URL(value, base);
    if (url.origin !== base || /^\/(login|register|auth)(\/|$)/.test(url.pathname)) return "/discover";
    return url.pathname + url.search + url.hash;
  } catch { return "/discover"; }
}
