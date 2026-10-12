import assert from "node:assert/strict";
const origin = process.env.SITE_TEST_URL || "http://127.0.0.1:3000";
const paths = ["/design-kit", "/resources/guides", "/products/screenplay-editor", "/products/table-reads", "/products/character-voices", "/products/audio-drama", "/products/storyboards", "/products/video", "/solutions/screenwriters", "/solutions/filmmakers", "/solutions/audio-storytellers", "/solutions/creative-teams", "/products", "/solutions", "/resources", "/enterprise", "/contact-sales", "/", "/writing", "/production", "/market", "/technology", "/pricing", "/about", "/careers", "/faq", "/contact", "/privacy", "/terms", "/get-access", "/blog", "/templates", "/features/screenplay-editor", "/features/table-read", "/features/character-voices", "/features/revisions", "/blog/prepare-a-table-read", "/blog/revise-dialogue-by-listening", "/blog/from-outline-to-scene"];
const links = new Set();
for (const path of paths) {
  const response = await fetch(new URL(path,origin));
  assert.equal(response.status,200,path);
  const html=await response.text();
  assert.match(html,/<h1[ >]/,`${path}: h1`);
  assert.match(html,/rel="canonical"/,`${path}: canonical`);
  assert.match(html,/name="description"/,`${path}: description`);
  for (const match of html.matchAll(/href="(\/[^"#?]*)"/g)) if (!match[1].startsWith('/_next/')) links.add(match[1]);
}
for (const path of links) {
  const response=await fetch(new URL(path,origin),{redirect:'manual'});
  assert.ok(response.status>=200 && response.status<400,`${path}: ${response.status}`);
}
assert.equal((await fetch(new URL('/missing-scene-check',origin))).status,404);
assert.equal((await fetch(new URL('/blog/hello-scriptfx',origin))).status,404);
const signIn=await fetch(new URL('/sign-in',origin),{redirect:'manual'});
assert.ok([307,308].includes(signIn.status));
assert.equal(new URL(signIn.headers.get('location')).pathname,'/login');
for (const path of ['/robots.txt','/sitemap.xml','/opengraph-image','/templates/scriptfx-scene.fountain']) assert.equal((await fetch(new URL(path,origin))).status,200,path);
console.log(`Passed: ${paths.length} pages, ${links.size} internal destinations, 404s, sign-in redirect, crawl files, social image, and template.`);
