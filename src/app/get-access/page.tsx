import { PageShell } from "@/components/site/page-shell";
import { MarketingForm } from "@/components/forms/marketing-form";
import { pageMetadata } from "@/lib/site/config";
export const metadata = pageMetadata("Get access", "Join the ScriptFX waitlist for access and updates on Writing, Production, and Market.", "/get-access", false);
export default function GetAccessPage() { return <PageShell eyebrow="Your story starts here" title="Be part of the next chapter." description="Join the waitlist for ScriptFX. Tell us which part of the journey matters most to you."><MarketingForm /></PageShell>; }
