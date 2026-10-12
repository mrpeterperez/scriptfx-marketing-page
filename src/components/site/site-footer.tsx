"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { footerLinks } from "@/lib/footer-links";
export function SiteFooter() {
  const pathname = usePathname();
  return <footer className="site-footer"><div className="site-footer-grid"><div><Link href="/" aria-label="ScriptFX home" onClick={(event) => {
    if (pathname !== "/" || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }}><Image src="/brand/ScriptFXLogo.svg" alt="ScriptFX" width={130} height={27} /></Link><p>Writing. Production. Market.</p><p>One story. Every chapter.</p></div>{Object.entries(footerLinks).map(([group, links]) => <nav key={group} aria-label={group}><p className="site-eyebrow">{group}</p>{links.map(link => <Link key={link.href} href={link.href}>{link.label}</Link>)}</nav>)}</div><div className="site-footer-bottom"><p>© {new Date().getFullYear()} ScriptFX</p><p>Made for the stories only you can tell.</p></div></footer>;
}
