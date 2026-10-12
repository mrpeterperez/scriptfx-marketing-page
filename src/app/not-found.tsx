import Link from "next/link";
import { PageShell } from "@/components/site/page-shell";
export default function NotFound() { return <PageShell eyebrow="404 / A missing scene" title="This page isn’t in the script." description="The link may have changed, or the page may not exist."><Link className="site-button" href="/">Back to ScriptFX</Link></PageShell>; }
