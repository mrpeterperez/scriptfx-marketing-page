export async function submitMarketing(kind: "leads" | "contact", values: Record<string, unknown>, idempotencyKey: string) {
  const query = new URLSearchParams(window.location.search);
  const attribution = Object.fromEntries(["utm_source", "utm_medium", "utm_campaign"].flatMap(key => query.has(key) ? [[key, query.get(key)!.slice(0, 120)]] : []));
  const response = await fetch(`/api/marketing/${kind}`, { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey }, body: JSON.stringify({ ...values, source: window.location.pathname, attribution }), signal: AbortSignal.timeout(15000) });
  const result = await response.json().catch(() => null);
  if (!response.ok || result?.accepted !== true) throw new Error(result?.error || "We couldn’t save that right now. Please try again.");
  window.dispatchEvent(new CustomEvent("scriptfx:conversion", { detail: { event: kind === "leads" ? "lead_accepted" : "contact_accepted", path: window.location.pathname } }));
}
