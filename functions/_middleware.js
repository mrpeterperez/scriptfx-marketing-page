const COOKIE = "__Host-scriptfx-preview";
const AGE = 60 * 60 * 24;
const encoder = new TextEncoder();
const headers = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  // same-origin, not no-referrer: no-referrer makes browsers send "Origin: null" on our own form posts, which the origin checks reject.
  "Referrer-Policy": "same-origin",
  "X-Content-Type-Options": "nosniff",
};

async function signature(secret, value) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const bytes = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
  return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
}

async function equal(a, b) {
  const [left, right] = await Promise.all([a, b].map(value => crypto.subtle.digest("SHA-256", encoder.encode(value))));
  const x = new Uint8Array(left), y = new Uint8Array(right);
  let difference = 0;
  for (let index = 0; index < x.length; index++) difference |= x[index] ^ y[index];
  return difference === 0;
}

function gate(error = false, status = 401) {
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>ScriptFX | Private preview</title><style>body{margin:0;min-height:100svh;display:grid;place-items:center;background:#f9f9f4;color:#17181a;font:16px system-ui,sans-serif}main{width:min(340px,calc(100% - 48px))}h1{font-size:32px;letter-spacing:-1px}p{line-height:1.5;color:#626262}label{display:block;margin:24px 0 8px}input,button{box-sizing:border-box;width:100%;padding:14px 16px;border:1px solid #ddd;border-radius:8px;font:inherit}input{background:white}button{margin-top:12px;background:#17181a;color:white;cursor:pointer}.error{color:#ad2626}</style></head><body><main><h1>ScriptFX</h1><p>Private preview. Enter the password to take a look.</p><form action="/_preview/unlock" method="post"><label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required autofocus maxlength="256">${error ? '<p class="error" role="alert">Incorrect password. Try again.</p>' : ""}<button type="submit">Enter site</button></form></main></body></html>`, {
    status,
    headers: { ...headers, "Content-Type": "text/html; charset=utf-8", "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'" },
  });
}

export async function onRequest({ request, env, next }) {
  const url = new URL(request.url);
  if (!env.PREVIEW_PASSWORD || !env.PREVIEW_SESSION_SECRET) return new Response("Private preview unavailable.", { status: 503, headers });
  if (url.pathname === "/robots.txt") return new Response("User-agent: *\nDisallow: /\n", { headers: { ...headers, "Content-Type": "text/plain" } });

  if (url.pathname === "/_preview/unlock" && request.method === "POST") {
    if (request.headers.get("origin") !== url.origin && request.headers.get("sec-fetch-site") !== "same-origin") return new Response("Request not allowed.", { status: 403, headers });
    if (Number(request.headers.get("content-length")) > 2048) return gate(true, 413);
    const body = await request.text();
    if (encoder.encode(body).length > 2048) return gate(true, 413);
    const password = new URLSearchParams(body).get("password") || "";
    if (!(await equal(password, env.PREVIEW_PASSWORD))) return gate(true);
    const expires = Math.floor(Date.now() / 1000) + AGE;
    const signed = await signature(env.PREVIEW_SESSION_SECRET, `${url.hostname}:${expires}`);
    return new Response(null, { status: 303, headers: { ...headers, Location: "/", "Set-Cookie": `${COOKIE}=${expires}.${signed}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${AGE}` } });
  }

  const cookie = (request.headers.get("cookie") || "").split(";").map(part => part.trim()).find(part => part.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
  const [expires, signed] = (cookie || "").split(".");
  const now = Math.floor(Date.now() / 1000);
  if (!/^\d+$/.test(expires || "") || Number(expires) <= now || Number(expires) > now + AGE || !/^[a-f0-9]{64}$/.test(signed || "")) return gate();
  if (!(await equal(signed, await signature(env.PREVIEW_SESSION_SECRET, `${url.hostname}:${expires}`)))) return gate();
  const upstream = await next();
  const response = new Response(upstream.body, upstream);
  for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
  return response;
}
