import Link from "next/link";
import { PageShell } from "@/components/site/page-shell";
import { pageMetadata } from "@/lib/site/config";
export const metadata = pageMetadata("Careers", "Interested in the future of ScriptFX? Start a conversation.", "/careers", false);
const sections = [["Stay connected", "We are not listing open positions on this page right now. Use our contact form to tell us about your work and your interest in ScriptFX."]];
export default function Page() { return <PageShell eyebrow="Careers" title="Help shape the next chapter." description="Interested in the future of ScriptFX? Start a conversation."><div className="site-copy">{sections.map(([heading, text]) => <section key={heading}><h2>{heading}</h2><p>{text}</p></section>)}<Link href="/contact">Contact ScriptFX</Link></div></PageShell>; }
