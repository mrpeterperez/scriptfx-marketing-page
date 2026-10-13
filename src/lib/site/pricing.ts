import type { ScriptFXProduct } from "@/components/site/product-icon";

export type PricingPlan = {
  name: string;
  audience: "individuals" | "students" | "teams";
  description: string;
  price: number;
  interval: "month" | "year";
  credits: number | null;
  generations: ScriptFXProduct[];
  items: string[];
  featured?: boolean;
  material: "gold" | "velvet" | "charcoal";
  illustration: string;
};

export const pricingPlans: PricingPlan[] = [
  { name: "Writer", illustration: "screenwriters", material: "gold", audience: "individuals", description: "Your space to write and revise.", price: 5, interval: "month", credits: 0, generations: ["audio"], items: ["Unlimited screenplays", "Longer draft history", "Co-writing tools"] },
  { name: "Indie", illustration: "character-voices", material: "velvet", audience: "individuals", description: "Give your story a voice and a world.", price: 20, interval: "month", credits: 1000, generations: ["audio", "video"], items: ["Everything in Writer", "AI companion · 30 min/month", "AI post-production"] },
  { name: "Director", illustration: "filmmakers", material: "charcoal", audience: "individuals", description: "More room for every new take.", price: 40, interval: "month", credits: 3000, generations: ["audio", "video", "immersion"], items: ["Everything in Indie", "Full immersion & sound design", "AI companion · 90 min/month"], featured: true },
  { name: "Production", illustration: "video", material: "gold", audience: "individuals", description: "A bigger budget for bigger stories.", price: 99, interval: "month", credits: 8000, generations: ["audio", "video", "immersion"], items: ["Everything in Director", "AI companion · 240 min/month"] },
  { name: "Student Indie", illustration: "screenplay-editor", material: "velvet", audience: "students", description: "From your first draft to your first production.", price: 9, interval: "month", credits: 500, generations: ["audio", "video"], items: ["All Writer features", "AI companion · 15 min/month", "AI post-production", "Annual student or educator verification"], featured: true },
  { name: "Studio Team", illustration: "creative-teams", material: "velvet", audience: "teams", description: "One workspace. Your whole production.", price: 299, interval: "month", credits: 10000, generations: ["audio", "video", "immersion"], items: ["10 authoring seats", "AI companion · 600 pooled min/month", "Shared projects, roles & approvals", "Extra seats · $25/month each"], featured: true },
  { name: "Enterprise", illustration: "creative-teams", material: "charcoal", audience: "teams", description: "Built around your studio’s requirements.", price: 25000, interval: "year", credits: null, generations: ["audio", "video", "immersion"], items: ["25 authoring seats", "Custom companion allowance", "Custom security & onboarding", "Dedicated support", "Generation quoted separately"] },
];
