import Link from "next/link";
import { PricingPlans } from "@/components/site/pricing-plans";
import { pageMetadata } from "@/lib/site/config";
export const metadata = pageMetadata("Pricing", "Get updates on ScriptFX plans and availability before choosing a plan.", "/pricing", false);
export default function PricingPage() {
  return <section className="editorial-page pricing-page"><header className="editorial-heading"><p className="site-eyebrow">Plans & availability</p><h1>A plan for your<br />next chapter.</h1><p>Choose your starting point. Make room for what comes next.</p></header><PricingPlans /><div className="pricing-contact"><div><h2>Have something bigger in mind?</h2><p>Tell us what you’re working on.</p></div><Link className="site-button" href="/contact">Contact us</Link></div><section className="pricing-faq"><h2>Common questions</h2><div className="faq-list"><details><summary>Are these final prices?</summary><p>These are sample plans for this design preview. Actual prices and included usage will be confirmed before launch.</p></details><details><summary>Does joining the waitlist purchase a plan?</summary><p>No. The waitlist registers your interest and does not start a paid subscription.</p></details></div></section></section>;
}
