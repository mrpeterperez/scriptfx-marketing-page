import Link from "next/link";
import { PageShell, SiteCTA } from "@/components/site/page-shell";
import { pageMetadata } from "@/lib/site/config";
export const metadata = pageMetadata("Frequently asked questions", "Answers about ScriptFX access, screenplay writing, table reads, and upcoming product areas.", "/faq");
const questions = [
  ["What is ScriptFX?", "ScriptFX brings screenwriting, scene revisions, and table reads into one creative workflow."],
  ["How do I get access?", "Join the waitlist to receive access updates. Joining the list does not create an application account or start a paid subscription."],
  
  ["How do table reads work?", "Assign voices to characters and generate a performance to review the scene. Delivery and timing can vary; use the read as another way to evaluate your writing."],
  ["What does ScriptFX cost?", "Public pricing and plan limits have not been announced on this website. They will be provided before you choose a paid plan."],
  ["Can I send feedback?", "Yes. Use the contact form and select Product feedback. Avoid sending confidential screenplay material through the marketing form."],
];
export default function FAQPage() { return <PageShell eyebrow="A little clarity" title="Good questions. Clear answers." description="Start here, or get in touch if there is something else you want to know."><div className="faq-list">{questions.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div><Link href="/contact">Ask us something</Link><SiteCTA /></PageShell>; }
