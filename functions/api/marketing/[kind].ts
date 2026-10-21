// Cloudflare Pages Function: passes the site's lead and contact forms to the ScriptFX API with the shared secret.
interface Env { NEXT_PUBLIC_SITE_URL?: string; SCRIPTFX_API_URL?: string; MARKETING_PROXY_SECRET?: string }
const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers } });

export async function onRequestPost({ request, params, env }: { request: Request; params: Record<string, string | string[]>; env: Env }) {
  const kind = String(params.kind);
  if (!["leads", "contact"].includes(kind)) return json({ error: "Not found" }, 404);
  const origin = request.headers.get("origin");
  const allowed = env.NEXT_PUBLIC_SITE_URL ? new URL(env.NEXT_PUBLIC_SITE_URL).origin : new URL(request.url).origin;
  if (!origin || origin !== allowed) return json({ error: "Request not allowed." }, 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return json({ error: "JSON required." }, 415);
  if (Number(request.headers.get("content-length")) > 16384) return json({ error: "Message too large." }, 413);
  if (!env.SCRIPTFX_API_URL || !env.MARKETING_PROXY_SECRET) return json({ error: "Submissions are temporarily unavailable. Please try again later." }, 503);
  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).length > 16384) return json({ error: "Message too large." }, 413);
    const response = await fetch(new URL(`/api/public/marketing/${kind}`, env.SCRIPTFX_API_URL), {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Marketing-Secret": env.MARKETING_PROXY_SECRET, "Idempotency-Key": request.headers.get("idempotency-key") || "" },
      body, signal: AbortSignal.timeout(12000),
    });
    const data = await response.json() as { accepted?: boolean };
    return json(response.ok ? { accepted: data.accepted === true } : { error: response.status === 429 ? "Too many attempts. Please try again later." : response.status === 400 ? "Please check your details and try again." : "We couldn’t save that right now. Please try again." },
      response.status, response.status === 429 ? { "Retry-After": "900" } : {});
  } catch { return json({ error: "We couldn’t save that right now. Please try again." }, 503); }
}
