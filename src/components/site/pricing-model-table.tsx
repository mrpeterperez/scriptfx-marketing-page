"use client";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { modelRates, pricingPlans } from "@/lib/site/pricing";

const plans = pricingPlans.filter(plan => plan.audience === "individuals");
/** How many a plan's credits make, in words: a dash when it can't afford one, and a singular unit for exactly one. */
const count = (credits: number, rate: number, unit: string) => {
  const made = Math.floor(credits / rate);
  return made === 0 ? "–" : made === 1 ? `1 ${unit.replace(/s$/, "")}` : `${made.toLocaleString("en-US")} ${unit}`;
};

/** Every model, its credit price, and how many each plan's monthly credits make, the way creators compare video tools. */
export function PricingModelTable() {
  // On phones the table shows one plan's column at a time, chosen here; wider screens show them all.
  const [shown, setShown] = useState((plans.find(plan => plan.featured) ?? plans[0]).name);
  const hide = (name: string) => (name === shown ? "" : "max-sm:hidden");
  return <section className="mt-16" aria-labelledby="models-heading">
    <h2 id="models-heading" className="text-center text-2xl font-semibold tracking-tight">Compare models across plans</h2>
    <p className="mt-2 text-center text-sm text-muted-foreground">Credits cover everything you generate. Here is what each plan’s monthly credits make if you spend them all on one thing; mix and match as you like.</p>
    <Tabs value={shown} onValueChange={setShown} className="mt-6 sm:hidden"><TabsList aria-label="Show plan" className="h-auto w-full p-1">{plans.map(plan => <TabsTrigger key={plan.name} value={plan.name} className="min-h-10 flex-1 px-1">{plan.name}</TabsTrigger>)}</TabsList></Tabs>
    <div className="mt-3 overflow-x-auto rounded-2xl bg-container sm:mt-8">
      <table className="w-full text-left text-sm sm:min-w-[640px]">
        <thead><tr className="border-b border-border">
          <th scope="col" className="p-4 font-medium">Model</th>
          <th scope="col" className="p-4 font-medium">Credits</th>
          {plans.map(plan => <th key={plan.name} scope="col" className={`p-4 font-medium ${hide(plan.name)}`}>{plan.name}</th>)}
        </tr></thead>
        <tbody>
          <tr><th scope="rowgroup" colSpan={plans.length + 2} className="px-4 pb-2 pt-6 text-xs font-medium uppercase tracking-wide text-muted-foreground"><span>Writing</span></th></tr>
          <tr className="border-t border-border">
            <th scope="row" className="p-4 font-normal"><span className="font-medium">Screenplay editor</span><span className="block text-xs text-muted-foreground">Every writing tool, no watermark</span></th>
            <td className="p-4">Free</td>
            {plans.map(plan => <td key={plan.name} className={`p-4 ${hide(plan.name)}`}>Unlimited</td>)}
          </tr>
          {modelRates.map(group => <ModelGroup key={group.group} {...group} hide={hide} />)}
          <tr><th scope="rowgroup" colSpan={plans.length + 2} className="px-4 pb-2 pt-6 text-xs font-medium uppercase tracking-wide text-muted-foreground"><span>Live Directing · minutes for directing by voice</span></th></tr>
          <tr className="border-t border-border">
            <th scope="row" className="p-4 font-normal"><span className="font-medium">Direct by voice</span><span className="block text-xs text-muted-foreground">You direct out loud. AI makes only the changes you ask for</span></th>
            <td className="p-4">Minutes</td>
            {plans.map(plan => <td key={plan.name} className={`p-4 ${hide(plan.name)}`}>{plan.directingMinutes} min</td>)}
          </tr>
          <tr><th scope="rowgroup" colSpan={plans.length + 2} className="px-4 pb-2 pt-6 text-xs font-medium uppercase tracking-wide text-muted-foreground"><span>Extras · bigger plans pay less · prices in USD</span></th></tr>
          <tr className="border-t border-border">
            <th scope="row" className="p-4 font-normal"><span className="font-medium">Extra credits</span><span className="block text-xs text-muted-foreground">150 credits, never expire</span></th>
            <td className="p-4">Top-up</td>
            {plans.map(plan => <td key={plan.name} className={`p-4 tabular-nums ${hide(plan.name)}`}>{plan.extraCreditsPrice ? `$${plan.extraCreditsPrice}` : "–"}</td>)}
          </tr>
          <tr className="border-t border-border">
            <th scope="row" className="p-4 font-normal"><span className="font-medium">Extra Live Directing</span><span className="block text-xs text-muted-foreground">Per minute, never expire</span></th>
            <td className="p-4">Top-up</td>
            {plans.map(plan => <td key={plan.name} className={`p-4 tabular-nums ${hide(plan.name)}`}>{plan.extraMinutePrice ? `$${plan.extraMinutePrice.toFixed(2)}/min` : "–"}</td>)}
          </tr>
        </tbody>
      </table>
    </div>
  </section>;
}

function ModelGroup({ group, video, rates, hide }: (typeof modelRates)[number] & { hide: (name: string) => string }) {
  return <>
    <tr><th scope="rowgroup" colSpan={plans.length + 2} className="px-4 pb-2 pt-6 text-xs font-medium uppercase tracking-wide text-muted-foreground"><span>{group}</span></th></tr>
    {rates.map(rate => <tr key={`${rate.name} ${rate.detail}`} className="border-t border-border">
      <th scope="row" className="p-4 font-normal"><span className="font-medium">{rate.name}</span>{rate.favorite ? <Badge className="ml-2">Our pick</Badge> : null}<span className="block text-xs text-muted-foreground">{rate.detail}</span></th>
      <td className="p-4 tabular-nums">{rate.credits}</td>
      {plans.map(plan => <td key={plan.name} className={`p-4 tabular-nums ${hide(plan.name)}`}>{video && !plan.video ? <span className="text-muted-foreground">Not included</span> : count(plan.credits ?? 0, rate.credits, rate.unit)}</td>)}
    </tr>)}
  </>;
}
