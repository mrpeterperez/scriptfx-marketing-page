import { NextRequest, NextResponse } from "next/server";
export async function POST(request: NextRequest, { params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  if (!["leads", "contact"].includes(kind)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const origin = request.headers.get("origin");
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL;
  const allowedOrigins = configuredOrigin ? [new URL(configuredOrigin).origin] : process.env.NODE_ENV === "development" ? ["http://127.0.0.1:3000", "http://localhost:3000"] : [];
  if (!origin || !allowedOrigins.includes(origin)) return NextResponse.json({ error: "Request not allowed." }, { status: 403 });
  if (!request.headers.get("content-type")?.startsWith("application/json")) return NextResponse.json({ error: "JSON required." }, { status: 415 });
  if (Number(request.headers.get("content-length")) > 16384) return NextResponse.json({ error: "Message too large." }, { status: 413 });
  const api = process.env.SCRIPTFX_API_URL;
  const secret = process.env.MARKETING_PROXY_SECRET;
  if (!api || !secret) return NextResponse.json({ error: "Submissions are temporarily unavailable. Please try again later." }, { status: 503 });
  try {
    const body = await request.text();
    if (Buffer.byteLength(body) > 16384) return NextResponse.json({ error: "Message too large." }, { status: 413 });
    const response = await fetch(new URL(`/api/public/marketing/${kind}`, api), { method: "POST", headers: { "Content-Type": "application/json", "X-Marketing-Secret": secret, "Idempotency-Key": request.headers.get("idempotency-key") || "" }, body, cache: "no-store", signal: AbortSignal.timeout(12000) });
    const data = await response.json();
    return NextResponse.json(response.ok ? { accepted: data.accepted === true } : { error: response.status === 429 ? "Too many attempts. Please try again later." : response.status === 400 ? "Please check your details and try again." : "We couldn’t save that right now. Please try again." }, { status: response.status, headers: { "Cache-Control": "no-store", ...(response.status === 429 ? { "Retry-After": "900" } : {}) } });
  } catch { return NextResponse.json({ error: "We couldn’t save that right now. Please try again." }, { status: 503 }); }
}
