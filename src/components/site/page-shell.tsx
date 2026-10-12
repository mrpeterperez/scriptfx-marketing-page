import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MediaPlaceholder } from "./media-placeholder";

export function PageShell({ eyebrow, title, description, children, mediaLabel, mediaVariant = "frames" }: {
  eyebrow: string; title: string; description: string; children?: React.ReactNode;
  mediaLabel?: string; mediaVariant?: "page" | "frames" | "sound";
}) {
  return <div className="site-page"><div className="site-page-hero"><header className="site-page-header"><p className="site-eyebrow">{eyebrow}</p><h1>{title}</h1><p className="site-description">{description}</p></header><MediaPlaceholder label={mediaLabel || title} variant={mediaVariant} wide /></div><div className="site-page-content">{children}</div></div>;
}

export function SiteCTA() {
  return <aside className="site-cta"><div><p className="site-eyebrow">Your next chapter</p><h2>Start with a story.</h2><p>Writing. Production. Market.</p></div><Button asChild><Link href="/get-access">Get access</Link></Button></aside>;
}
