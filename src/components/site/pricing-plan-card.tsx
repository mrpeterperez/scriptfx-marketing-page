import Link from "next/link";
import Image from "next/image";
import { productArtSubjects, solutionArtSubjects } from "@/lib/site/art-direction";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductIcon } from "@/components/site/product-icon";
import { annualPricingAmount, formatPricingAmount, type PricingBilling, type PricingCurrency } from "@/lib/site/pricing-display";
import type { PricingPlan } from "@/lib/site/pricing";

const pricingArtwork = [...productArtSubjects, ...solutionArtSubjects];

export function PricingPlanCard({ plan, textured = true, billing = "month", currency = "USD" }: { plan: PricingPlan; textured?: boolean; billing?: PricingBilling; currency?: PricingCurrency }) {
  const illustration = pricingArtwork.find(art => art.slug === plan.illustration)!;
  const annual = plan.interval === "month" && billing === "year";
  const annualTotal = annualPricingAmount(plan.price);
  const displayedPrice = annual ? annualTotal / 12 : plan.price;
  const featured = plan.featured && !textured;
  const muted = featured ? "text-primary-foreground/70" : "text-muted-foreground";
  return <Card data-material={textured ? plan.material : undefined} className={`h-full gap-5 border-0 shadow-none ${textured ? "pricing-plan bg-container p-4 text-on-surface" : featured ? "material-charcoal pricing-plan-film bg-primary p-5 text-primary-foreground" : "bg-container p-5 text-on-surface"}`}>
    <div className={textured ? "pricing-plan-heading relative isolate flex min-h-56 flex-col gap-4 overflow-hidden rounded-xl bg-surface p-5" : "contents"}>
    {textured ? <div aria-hidden="true" className={`pricing-plan-material material-${plan.material} pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-0 transition-opacity duration-300 motion-reduce:transition-none`}><Image src={illustration.src} alt="" fill sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw" className="object-cover" /></div> : null}
    <div className="flex min-h-6 flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-semibold tracking-tight">{plan.name}</h2>{plan.featured ? <Badge variant={featured ? "secondary" : "default"}>Recommended</Badge> : null}</div>
    <p className={`min-h-12 text-sm leading-6 ${muted}`}>{plan.description}</p>
    <div className={textured ? "mt-auto" : undefined}>{annual ? <p className={`mb-1 text-sm ${muted}`}><span className="sr-only">Regular monthly price: </span><s>{formatPricingAmount(plan.price, currency)}</s><span className="ml-2">2 months free</span></p> : null}<p>{plan.interval === "year" ? <span className={`mr-1 text-sm ${muted}`}>From</span> : null}<strong className={`${currency === "USD" ? "text-4xl" : "text-3xl"} font-semibold tracking-tight`}>{formatPricingAmount(displayedPrice, currency)}</strong><span className={`ml-1 text-sm ${muted}`}>/{plan.interval}</span></p><p className={`mt-2 text-xs leading-5 ${muted}`}>{plan.interval === "year" ? "Annual studio agreement" : annual ? `${formatPricingAmount(annualTotal, currency)} billed yearly` : "Billed monthly"}</p></div>
    </div>
    <div className={`rounded-xl p-4 ${featured ? "bg-primary-foreground/10" : "bg-surface"}`}><p className="text-xl font-semibold tracking-tight">{plan.credits === null ? "Custom budget" : plan.credits === 0 ? "Pay as you go" : `${plan.credits.toLocaleString("en-US")} credits`}</p><p className={`mt-1 text-xs leading-5 ${muted}`}>{plan.credits === null ? "Generation tailored to your studio" : plan.credits === 0 ? "Buy credits when you generate" : "Monthly credits · top up anytime"}</p><p className={`mt-2 text-[10px] font-medium uppercase tracking-wide ${muted}`}>Generate</p><ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1">{plan.generations.map(product => <li key={product} className="flex items-center gap-1.5 text-xs"><ProductIcon product={product} size="inline" />{product === "audio" ? "Table reads" : product === "immersion" ? "Full immersion" : "Video"}</li>)}</ul></div>
    <Button asChild variant={featured ? "secondary" : "default"} className="w-full"><Link href={plan.name === "Enterprise" ? "/contact-sales" : "/get-access"}>{plan.name === "Enterprise" ? "Talk to us" : "Join the waitlist"}</Link></Button>
    <ul className="space-y-3 text-sm leading-6">{plan.items.map(item => <li key={item} className="flex items-start gap-2"><Check className="mt-1 size-4 shrink-0" aria-hidden="true" /><span>{item === "Extra seats · $25/month each" ? `Extra seats · ${formatPricingAmount(25, currency)}/month each` : item}</span></li>)}</ul>
  </Card>;
}
