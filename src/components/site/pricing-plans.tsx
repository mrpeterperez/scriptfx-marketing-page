"use client";
import { useState } from "react";
import { ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPricingAmount, pricingCurrencies, pricingRateDate, type PricingBilling, type PricingCurrency } from "@/lib/site/pricing-display";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { pricingPlans } from "@/lib/site/pricing";
import { PricingPlanCard } from "./pricing-plan-card";

export function PricingPlans() {
  const [audience, setAudience] = useState("individuals");
  const [textured, setTextured] = useState(true);
  const [billing, setBilling] = useState<PricingBilling>("month");
  const [currency, setCurrency] = useState<PricingCurrency>("USD");
  return <Tabs value={audience} onValueChange={setAudience}>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <TabsList className="pricing-audience h-auto p-1.5" aria-label="Choose your plan type"><TabsTrigger value="individuals">Individuals</TabsTrigger><TabsTrigger value="students">Students</TabsTrigger><TabsTrigger value="teams">Teams</TabsTrigger></TabsList>
      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={billing} onValueChange={value => setBilling(value as PricingBilling)} className="gap-0"><TabsList aria-label="Billing frequency" className="h-auto p-1"><TabsTrigger value="month" className="min-h-10 px-4">Monthly</TabsTrigger><TabsTrigger value="year" className="min-h-10 px-4">Yearly</TabsTrigger></TabsList><TabsContent value="month" className="sr-only">Monthly prices, billed monthly.</TabsContent><TabsContent value="year" className="sr-only">Yearly prices include two months free, billed upfront.</TabsContent></Tabs>
        <Badge variant="secondary">2 months free yearly</Badge>
        <Select value={currency} onValueChange={value => setCurrency(value as PricingCurrency)}><SelectTrigger aria-label="Pricing currency" className="pricing-currency w-auto cursor-pointer border-0 bg-container px-4 shadow-none"><SelectValue /></SelectTrigger><SelectContent position="popper" align="end" className="border-0">{pricingCurrencies.map(item => <SelectItem key={item.code} value={item.code}>{item.label}</SelectItem>)}</SelectContent></Select>
      </div>
    </div>
    {(["individuals", "students", "teams"] as const).map(group => <TabsContent key={group} value={group}><div className={`grid gap-4 ${group === "individuals" ? "sm:grid-cols-2 lg:grid-cols-4" : group === "teams" ? "mx-auto max-w-2xl sm:grid-cols-2" : "mx-auto max-w-sm"}`}>{pricingPlans.filter(plan => plan.audience === group).map(plan => <PricingPlanCard key={plan.name} plan={plan} textured={textured} billing={billing} currency={currency} />)}</div>{group === "students" ? <p className="mx-auto mt-5 max-w-md text-center text-sm leading-6 text-muted-foreground">Only writing? Verified students and educators get Writer at no charge. Explore education access below.</p> : null}</TabsContent>)}
    <p className="mt-5 text-center text-sm leading-6 text-muted-foreground">Need more? Add 1,000 credits for {formatPricingAmount(10, currency)} on any plan. No upgrade required.</p>
    {currency !== "USD" ? <p className="text-center text-xs leading-5 text-muted-foreground">Estimated local prices · Billed in USD · <a href="https://frankfurter.dev/" target="_blank" rel="noreferrer" className="underline underline-offset-4">Exchange rates: {pricingRateDate}</a></p> : null}
    <Button type="button" variant="secondary" size="sm" aria-pressed={textured} onClick={() => setTextured(value => !value)} className="fixed bottom-4 left-4 z-50 shadow-md">{textured ? <ToggleRight aria-hidden="true" /> : <ToggleLeft aria-hidden="true" />}Textured cards</Button>
  </Tabs>;
}
