import { PageShell } from "@/components/site/page-shell";
import { MarketingForm } from "@/components/forms/marketing-form";
import { pageMetadata } from "@/lib/site/config";
export const metadata = pageMetadata("Contact", "Contact ScriptFX for support, partnerships, product feedback, or privacy questions.", "/contact");
export default function ContactPage() { return <PageShell eyebrow="Let’s talk" title="Every conversation starts somewhere." description="Questions, feedback, or a workflow you wish existed? Tell the ScriptFX team."><MarketingForm kind="contact" /></PageShell>; }
