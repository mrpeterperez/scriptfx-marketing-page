"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { annualPricingAmount, formatPricingAmount, pricingCurrencies, pricingRateDate, type PricingBilling, type PricingCurrency } from "@/lib/site/pricing-display";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { approxCredits, CREDITS_PER, seedanceShots, pricingPlans, type PricingPlan } from "@/lib/site/pricing";
import { PricingPlanCard } from "./pricing-plan-card";

export function PricingPlans() {
  const [audience, setAudience] = useState("individuals");
  const [billing, setBilling] = useState<PricingBilling>("month");
  const [currency, setCurrency] = useState<PricingCurrency>("USD");
  // On phones, one plan shows at a time; each group opens on its recommended plan.
  const groups = (["individuals", "teams", "students"] as const).map(group => ({ group, plans: pricingPlans.filter(plan => plan.audience === group) }));
  const [picked, setPicked] = useState<Record<string, string>>(() => Object.fromEntries(groups.map(({ group, plans }) => [group, (plans.find(plan => plan.featured) ?? plans[0]).name])));
  const chosen = groups.find(({ group }) => group === audience)!.plans.find(plan => plan.name === picked[audience])!;
  return <Tabs value={audience} onValueChange={setAudience}>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
      <TabsList className="pricing-audience h-auto p-1.5 max-sm:w-full" aria-label="Choose your plan type"><TabsTrigger value="individuals" className="max-sm:flex-1">Individuals</TabsTrigger><TabsTrigger value="teams" className="max-sm:flex-1">Teams</TabsTrigger><TabsTrigger value="students" className="max-sm:flex-1">Students</TabsTrigger></TabsList>
      <div className="flex items-center gap-3 max-sm:w-full">
        <Tabs value={billing} onValueChange={value => setBilling(value as PricingBilling)} className="gap-0 max-sm:flex-1"><TabsList aria-label="Billing frequency" className="h-auto p-1 max-sm:w-full"><TabsTrigger value="month" className="min-h-10 px-4 max-sm:flex-1">Monthly</TabsTrigger><TabsTrigger value="year" className="min-h-10 px-4 max-sm:flex-1">Yearly</TabsTrigger></TabsList><TabsContent value="month" className="sr-only">Monthly prices, billed monthly.</TabsContent><TabsContent value="year" className="sr-only">Yearly prices include one month free, billed upfront.</TabsContent></Tabs>
        <Badge variant="secondary" className="max-sm:hidden">1 month free yearly</Badge>
        <Select value={currency} onValueChange={value => setCurrency(value as PricingCurrency)}><SelectTrigger aria-label="Pricing currency" className="pricing-currency w-auto cursor-pointer border-0 bg-container px-4 shadow-none"><SelectValue /></SelectTrigger><SelectContent position="popper" align="end" className="border-0">{pricingCurrencies.map(item => <SelectItem key={item.code} value={item.code}>{item.label}</SelectItem>)}</SelectContent></Select>
      </div>
    </div>
    {groups.map(({ group, plans }) => <TabsContent key={group} value={group}><div className="sm:hidden">
        <div role="radiogroup" aria-label="Choose a plan" className="space-y-2">{plans.map(plan => <PlanRow key={plan.name} plan={plan} billing={billing} currency={currency} selected={plan.name === picked[group]} onSelect={() => setPicked(current => ({ ...current, [group]: plan.name }))} />)}</div>
        <p className="mb-2 mt-6 text-xs font-medium uppercase tracking-wide text-muted-foreground">{picked[group]} includes</p>
        <PricingPlanCard plan={plans.find(plan => plan.name === picked[group])!} billing={billing} currency={currency} details />
      </div><div className={`grid gap-4 max-sm:hidden ${group === "individuals" ? "sm:grid-cols-2 lg:grid-cols-4" : group === "teams" ? "mx-auto max-w-2xl sm:grid-cols-2" : "lg:grid-cols-3"}`}>{plans.map(plan => <PricingPlanCard key={plan.name} plan={plan} billing={billing} currency={currency} />)}</div>{group === "individuals" ? <p className="mt-5 text-center text-sm leading-6 text-muted-foreground">🎓 Student or educator? <button type="button" onClick={() => { setAudience("students"); scrollTo({ top: 0, behavior: "smooth" }); }} className="cursor-pointer font-medium text-foreground underline underline-offset-4">See student prices</button></p> : null}</TabsContent>)}
    <p className="mt-5 text-center text-sm leading-6 text-muted-foreground">Credits cover everything you generate: directed scenes, audience reactions, table reads, voices, sound design, audio dramas, and video. You see the cost on every button before you generate. Live Directing is billed in minutes. Top up either anytime: bigger plans pay less for extras, and bought credits and minutes never expire.</p>
    <p className="mt-2 text-center text-xs leading-5 text-muted-foreground">*Fair use: screenplays are unlimited for everyday writing. We may limit automated or bulk uploads.</p>
    <MobilePlanBar plan={chosen} billing={billing} currency={currency} />
    {currency !== "USD" ? <p className="text-center text-xs leading-5 text-muted-foreground">Estimated local prices · Billed in USD · <a href="https://frankfurter.dev/" target="_blank" rel="noreferrer" className="underline underline-offset-4">Exchange rates: {pricingRateDate}</a></p> : null}
  </Tabs>;
}

/** A plan's headline price for the chosen billing: "Free", "$40/mo", or a studio's yearly "From" price. */
function planPrice(plan: PricingPlan, billing: PricingBilling, currency: PricingCurrency) {
  if (plan.price === 0) return "Free";
  if (plan.interval === "year") return `From ${formatPricingAmount(plan.price, currency)}/yr`;
  const yearly = billing === "year";
  return `${formatPricingAmount(yearly ? annualPricingAmount(plan.price) / 12 : plan.price, currency)}/mo`;
}

/** One selectable plan on phones: name, what it makes, and price, so every plan fits on one screen. */
function PlanRow({ plan, billing, currency, selected, onSelect }: { plan: PricingPlan; billing: PricingBilling; currency: PricingCurrency; selected: boolean; onSelect: () => void }) {
  const makes = plan.credits === null ? "Custom credits and minutes" : `${plan.credits.toLocaleString("en-US")} credits · ≈ ${plan.video ? `${seedanceShots(plan.credits)}` : `${approxCredits(plan.credits, CREDITS_PER.tableReadPage)} table-read pages`}`;
  return <button type="button" role="radio" aria-checked={selected} onClick={onSelect} className={`flex w-full items-center gap-3 rounded-2xl p-4 text-left transition-colors ${selected ? "bg-primary text-primary-foreground" : "bg-container text-on-surface"}`}>
    <span aria-hidden="true" className={`grid size-5 shrink-0 place-items-center rounded-full border-2 ${selected ? "border-primary-foreground" : "border-muted-foreground/40"}`}>{selected ? <span className="size-2.5 rounded-full bg-primary-foreground" /> : null}</span>
    <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2 font-semibold">{plan.name}{plan.featured ? <Badge variant={selected ? "secondary" : "default"}>Recommended</Badge> : null}</span><span className={`block text-xs leading-5 ${selected ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{makes}</span></span>
    <span className="shrink-0 text-right font-semibold">{planPrice(plan, billing, currency)}</span>
  </button>;
}

/** On phones, the chosen plan's button stays in reach while the page scrolls. */
function MobilePlanBar({ plan, billing, currency }: { plan: PricingPlan; billing: PricingBilling; currency: PricingCurrency }) {
  const enterprise = plan.name === "Enterprise";
  return <>
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur sm:hidden">
      <Button asChild size="lg" className="w-full"><Link href={enterprise ? "/contact-sales" : "/get-access"}>{enterprise ? "Talk to us" : plan.price === 0 ? "Start free" : `Join the waitlist · ${plan.name} ${planPrice(plan, billing, currency)}`}</Link></Button>
      {plan.price > 0 && plan.audience === "individuals" ? <Link href="/get-access" className="mt-2 block text-center text-xs text-muted-foreground underline underline-offset-4">or start free with Writer</Link> : null}
    </div>
  </>;
}
