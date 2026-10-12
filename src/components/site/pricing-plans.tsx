"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
const plans = [
  { name: "Writer", label: "Start with the page", description: "A focused place to write and revise.", monthly: 12, annual: 9, items: ["3 active screenplays", "Screenplay editor & revisions", "PDF export", "30 minutes of table reads / month"], featured: false },
  { name: "Creator", label: "For your next production", description: "Give every character a voice.", monthly: 29, annual: 23, items: ["Unlimited screenplays", "Everything in Writer", "180 minutes of table reads / month", "Character voice library", "Audio export"], featured: true },
  { name: "Studio", label: "Create together", description: "More room for the whole team.", monthly: 79, annual: 63, items: ["Everything in Creator", "5 team members", "600 minutes of table reads / month", "Shared project workspace", "Priority support"], featured: false },
];
export function PricingPlans() {
  const [annual, setAnnual] = useState(false);
  return <><Tabs value={annual ? "annual" : "monthly"} onValueChange={value => setAnnual(value === "annual")}><TabsList className="pricing-kit-tabs" aria-label="Billing interval"><TabsTrigger value="monthly">Monthly</TabsTrigger><TabsTrigger value="annual">Annual · Save up to 25%</TabsTrigger></TabsList></Tabs><p className="pricing-preview-note">Design preview · Sample prices and plan details</p><div className="pricing-grid">{plans.map(plan => <article key={plan.name} className={`pricing-card${plan.featured ? " pricing-card-featured" : ""}`} data-visual-reveal><p className="site-eyebrow">{plan.label}</p><h2>{plan.name}</h2><p className="plan-description">{plan.description}</p><div className="plan-price" aria-live="polite"><strong>${annual ? plan.annual : plan.monthly}</strong><small> / month</small><span>{annual ? `$${plan.annual * 12} billed annually` : "Billed monthly"}</span></div><Button asChild><Link href="/get-access">Choose {plan.name}</Link></Button><div className="plan-includes"><p>What’s included</p><ul>{plan.items.map(item => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}</ul></div></article>)}</div></>;
}
