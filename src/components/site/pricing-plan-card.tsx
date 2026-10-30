import Link from "next/link";
import Image from "next/image";
import { productArtSubjects, solutionArtSubjects } from "@/lib/site/art-direction";
import { BadgeCheck, Check, CornerRightDown, Megaphone } from "lucide-react";
import { CreditsInfo } from "@/components/site/credits-info";
import { scriptfxProducts } from "@/components/site/product-icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { annualPricingAmount, formatPricingAmount, type PricingBilling, type PricingCurrency } from "@/lib/site/pricing-display";
import { approxCredits, CREDITS_PER, seedanceShots, pricingPlans, type PricingPlan } from "@/lib/site/pricing";


const pricingArtwork = [...productArtSubjects, ...solutionArtSubjects];

/** Whether a plan already includes a line, so the plan built on it doesn't repeat it. */
function baseHas(plan: PricingPlan, icon: string) {
  return icon === "video" ? !!plan.video && plan.price > 0 : icon === "immersive" ? !!plan.immersive : icon === "commercial" ? !!plan.commercial : true;
}
/** What 150 extra credits cost on Writer; bigger plans show their saving against it. */
const FULL_EXTRA_PRICE = pricingPlans[0].extraCreditsPrice!;
/** A plan card. With `details`, only what the plan includes: the phone layout shows its name, price, and button elsewhere. */
export function PricingPlanCard({ plan, textured = false, billing = "month", currency = "USD", details = false }: { plan: PricingPlan; textured?: boolean; billing?: PricingBilling; currency?: PricingCurrency; details?: boolean }) {
  const illustration = pricingArtwork.find(art => art.slug === plan.illustration)!;
  const free = plan.price === 0;
  const annual = !free && plan.interval === "month" && billing === "year";
  const annualTotal = annualPricingAmount(plan.price);
  const displayedPrice = annual ? annualTotal / 12 : plan.price;
  const featured = plan.featured && !textured && !details;
  const base = pricingPlans.find(other => other.name === plan.plusFrom);
  const muted = featured ? "text-primary-foreground/70" : "text-muted-foreground";
  return <Card data-material={textured ? plan.material : undefined} className={`h-full gap-5 border-0 shadow-none ${textured ? "pricing-plan bg-container p-4 text-on-surface" : featured ? "bg-primary p-5 text-primary-foreground" : "bg-container p-5 text-on-surface"}`}>
    {details ? null : <>
    {textured ? null : <div aria-hidden="true" className="relative aspect-[16/9] overflow-hidden rounded-xl sm:aspect-[4/3]"><Image src={illustration.src} alt="" fill sizes="(min-width: 1024px) 280px, (min-width: 640px) 50vw, 100vw" className="object-cover" /></div>}
    <div className={textured ? "pricing-plan-heading relative isolate flex min-h-56 flex-col gap-4 overflow-hidden rounded-xl bg-surface p-5" : "contents"}>
    {textured ? <div aria-hidden="true" className={`pricing-plan-material material-${plan.material} pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-0 transition-opacity duration-300 motion-reduce:transition-none`}><Image src={illustration.src} alt="" fill sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw" className="object-cover" /></div> : null}
    <div className="flex min-h-6 flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-semibold tracking-tight">{plan.name}</h2>{plan.featured ? <Badge variant={featured ? "secondary" : "default"}>Recommended</Badge> : null}</div>
    <div className={textured ? "mt-auto" : undefined}>{annual ? <p className={`mb-1 text-sm ${muted}`}><span className="sr-only">Regular monthly price: </span><s>{formatPricingAmount(plan.price, currency)}</s><Badge variant={featured ? "secondary" : "default"} className="ml-2">Save {formatPricingAmount(plan.price * 12 - annualTotal, currency)}</Badge></p> : null}<p>{plan.interval === "year" ? <span className={`mr-1 text-sm ${muted}`}>From</span> : null}{free ? <strong className="text-4xl font-semibold tracking-tight">Free</strong> : <><strong className={`${currency === "USD" ? "text-4xl" : "text-3xl"} font-semibold tracking-tight`}>{formatPricingAmount(displayedPrice, currency)}</strong><span className={`ml-1 text-sm ${muted}`}>/{plan.interval}</span></>}</p><p className={`mt-2 text-xs leading-5 ${muted}`}>{free ? (plan.audience === "students" ? "Free for students and educators" : "Free forever") : plan.interval === "year" ? "Annual studio agreement" : `${plan.audience === "students" ? "Student price · " : ""}${annual ? `${formatPricingAmount(annualTotal, currency)} billed yearly` : "Billed monthly"}`}</p></div>
    </div>
    <Button asChild variant={featured ? "secondary" : "outline"} className="w-full"><Link href={plan.name === "Enterprise" ? "/contact-sales" : "/get-access"}>{plan.name === "Enterprise" ? "Talk to us" : "Join the waitlist"}</Link></Button>
    </>}
    <div className={`rounded-xl p-4 ${featured ? "bg-primary-foreground/10" : "bg-surface"}`}>
      <div className="flex items-start justify-between gap-2"><p className="text-lg"><strong className="font-semibold">{plan.credits === null ? "Custom" : plan.credits.toLocaleString("en-US")}</strong> credits{plan.credits === null ? "" : " monthly"}</p><CreditsInfo video={plan.video} className={muted} /></div>
      {plan.credits === null ? <p className={`mt-1 text-xs leading-5 ${muted}`}>Volume pricing for your studio</p> : <p className={`mt-1 text-xs leading-5 ${muted}`}>≈ {plan.video ? `${seedanceShots(plan.credits)}` : `${approxCredits(plan.credits, CREDITS_PER.tableReadPage)} table-read pages`}</p>}
      {plan.extraCreditsPrice ? <p className="mt-3 flex flex-wrap items-center gap-2 text-sm">Extra 150 credits for <strong className="font-semibold">{formatPricingAmount(plan.extraCreditsPrice, currency)}</strong>{plan.extraCreditsPrice < FULL_EXTRA_PRICE ? <Badge variant={featured ? "secondary" : "default"}>Save {Math.round((1 - plan.extraCreditsPrice / FULL_EXTRA_PRICE) * 100)}%</Badge> : null}</p> : null}
    </div>
    <div className="flex items-start gap-2.5 text-sm leading-6"><Megaphone className="mt-1 size-4 shrink-0" strokeWidth={1.6} aria-hidden="true" /><p className="min-w-0 flex-1"><strong className="block whitespace-nowrap font-semibold">{plan.directingMinutes ? `${plan.directingMinutes.toLocaleString("en-US")} min of ` : "Custom minutes of "}Live Directing</strong><span className={`block text-xs leading-5 ${muted}`}>You direct out loud. AI makes only the changes you ask for.</span>{plan.extraMinutePrice ? <span className={`block text-xs leading-5 ${muted}`}>Extra: {formatPricingAmount(plan.extraMinutePrice, currency)}/min</span> : null}<Link href="/products/live-directing" className="mt-1 inline-block text-xs underline underline-offset-4">Learn more</Link></p></div>
    <div>
    <p className={`flex items-center gap-1.5 border-b border-dotted pb-2.5 text-sm ${featured ? "border-primary-foreground/30" : "border-border"} ${muted}`}>{base ? <>Everything in {base.name}, plus<CornerRightDown className="size-3.5" strokeWidth={1.6} aria-hidden="true" /></> : "Includes"}</p>
    <ul className={`divide-y divide-dotted text-sm leading-6 ${featured ? "divide-primary-foreground/30" : "divide-border"}`}>{[...([
      { text: "Unlimited screenplays*", icon: "screenplay", included: true },
      { text: free ? "Video, watermarked" : "Video, no watermark", icon: "video", included: !!plan.video },
      { text: "Table reads", icon: "voices", included: true },
      { text: "Audio dramas", icon: "drama", included: true },
      { text: "Sound effects & music", icon: "sfx", included: true },
      { text: "Immersive 3D sound", icon: "immersive", included: !!plan.immersive },
      { text: "Commercial license", icon: "commercial", included: !!plan.commercial },
    ] as { text: string; icon: string; included: boolean }[]).filter(line => base ? line.included && !baseHas(base, line.icon) : line.included || line.icon === "video"), ...plan.items.map(item => ({ text: item === "Extra seats · $25/month each" ? `Extra seats · ${formatPricingAmount(25, currency)}/month each` : item, icon: "check", included: true }))].map(line => {
      const Icon = line.icon === "commercial" ? BadgeCheck : line.icon === "check" ? Check : scriptfxProducts.find(product => product.id === line.icon)!.icon;
      return <li key={line.text} className={`flex items-start gap-2.5 py-2.5 ${line.included ? "" : `${muted} opacity-60`}`}><Icon className="mt-1 size-4 shrink-0" strokeWidth={1.6} aria-hidden="true" /><span className={line.included ? undefined : "line-through"}>{line.included ? null : <span className="sr-only">Not included: </span>}{line.text}</span></li>;
    })}</ul>
    </div>
  </Card>;
}
