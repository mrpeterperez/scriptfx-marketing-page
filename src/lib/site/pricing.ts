export type PricingPlan = {
  name: string;
  audience: "individuals" | "students" | "teams";
  price: number;
  interval: "month" | "year";
  credits: number | null;
  /** Live Directing minutes a month, separate from credits: it is billed by the minute you spend talking. */
  directingMinutes?: number;
  /** Price of 150 extra credits on this plan. Bigger plans pay less. */
  extraCreditsPrice?: number;
  /** Price of one extra Live Directing minute on this plan. */
  extraMinutePrice?: number;
  video?: boolean;
  immersive?: boolean;
  /** Generated work can be used commercially. Free plans are personal use, like every competitor's. */
  commercial?: boolean;
  items: string[];
  /** The plan this one builds on: its card lists only what is new, under "Everything in {plusFrom}, plus". */
  plusFrom?: string;
  featured?: boolean;
  material: "gold" | "velvet" | "charcoal";
  illustration: string;
};

/** What one credit makes, for the "≈" lines on each card. Every rate is provider cost times our markup at $0.05 a credit. */
export const CREDITS_PER = {
  /** A table-read page on Standard voices. */
  tableReadPage: 0.6,
  /** An audio-drama page: adaptation, sound effects, and music. */
  dramaPage: 10,
  /** A Seedance 2.0 shot, 5 seconds at 720p. */
  seedanceShot: 30,
  /** A scene you direct and AI drafts in screenplay format (Opus 5.5, about 15k tokens in, 2k out). */
  directedScene: 6,
  /** An audience reaction: an AI audience reading your pages and reacting. */
  audienceReaction: 10,
};

export const pricingPlans: PricingPlan[] = [
  { name: "Writer", illustration: "screenwriters", material: "gold", audience: "individuals", price: 0, interval: "month", credits: 30, directingMinutes: 5, extraCreditsPrice: 10, extraMinutePrice: 0.25, video: true, items: [] },
  { name: "Indie", plusFrom: "Writer", commercial: true, illustration: "character-voices", material: "velvet", audience: "individuals", price: 20, interval: "month", credits: 400, directingMinutes: 30, extraCreditsPrice: 9, extraMinutePrice: 0.22, video: true, items: ["More than 13× Writer’s credits"] },
  { name: "Director", plusFrom: "Indie", commercial: true, illustration: "filmmakers", material: "charcoal", audience: "individuals", price: 40, interval: "month", credits: 900, directingMinutes: 90, extraCreditsPrice: 8, extraMinutePrice: 0.2, video: true, immersive: true, items: ["More than 2× Indie’s credits", "3× Indie’s Live Directing"], featured: true },
  { name: "Production", plusFrom: "Director", commercial: true, illustration: "video", material: "gold", audience: "individuals", price: 99, interval: "month", credits: 2200, directingMinutes: 180, extraCreditsPrice: 7, extraMinutePrice: 0.18, video: true, immersive: true, items: ["More than 2× Director’s credits", "2× Director’s Live Directing", "Lowest prices on extra credits and minutes"] },
  // Student plans cost less and carry a little less, so each one stays profitable even when every credit and minute is spent.
  { name: "Student Writer", illustration: "students", material: "velvet", audience: "students", price: 0, interval: "month", credits: 60, directingMinutes: 10, extraCreditsPrice: 10, extraMinutePrice: 0.25, video: true, items: ["2× Writer’s credits", "Verify once a year"] },
  { name: "Student Indie", plusFrom: "Student Writer", commercial: true, illustration: "character-voices", material: "velvet", audience: "students", price: 12, interval: "month", credits: 250, directingMinutes: 30, extraCreditsPrice: 9, extraMinutePrice: 0.22, video: true, items: ["4× Student Writer’s credits"] },
  { name: "Student Director", plusFrom: "Student Indie", commercial: true, illustration: "filmmakers", material: "charcoal", audience: "students", price: 24, interval: "month", credits: 550, directingMinutes: 60, extraCreditsPrice: 8, extraMinutePrice: 0.2, video: true, immersive: true, items: ["More than 2× Student Indie’s credits", "2× Student Indie’s Live Directing"], featured: true },
  { name: "Studio Team", plusFrom: "Production", commercial: true, illustration: "creative-teams", material: "velvet", audience: "teams", price: 299, interval: "month", credits: 7500, directingMinutes: 600, extraCreditsPrice: 7, extraMinutePrice: 0.18, video: true, immersive: true, items: ["10 seats sharing credits and minutes", "Shared projects, roles & approvals", "Extra seats · $25/month each"], featured: true },
  { name: "Enterprise", plusFrom: "Studio Team", commercial: true, illustration: "enterprise", material: "charcoal", audience: "teams", price: 25000, interval: "year", credits: null, video: true, immersive: true, items: ["25 seats", "Custom security & onboarding", "Dedicated support"] },
];

export type ModelRate = { name: string; detail: string; credits: number; unit: string; favorite?: boolean };

/**
 * Credits per generation, from each provider's API list price (October 2026)
 * times our markup (2× voices and video, 3× sound and music) at $0.05
 * a credit, rounded. Each count on the compare table is a plan's monthly credits
 * divided by these.
 */
export const modelRates: { group: string; video?: boolean; rates: ModelRate[] }[] = [
  { group: "Video", video: true, rates: [
    { name: "Seedance 2.0", detail: "720p · 5s", credits: 30, unit: "shots", favorite: true },
    { name: "Seedance 2.0 Fast", detail: "720p · 5s", credits: 24, unit: "shots" },
    { name: "Seedance 2.5", detail: "720p · 5s", credits: 46, unit: "shots" },
    { name: "Seedance 2.5", detail: "1080p · 5s", credits: 114, unit: "shots" },
    { name: "Veo 3.1 Fast", detail: "720p · 8s · with sound", credits: 32, unit: "shots" },
    { name: "Veo 3.1", detail: "1080p · 8s · with sound", credits: 128, unit: "shots" },
    { name: "Kling 3.0", detail: "720p · 5s", credits: 17, unit: "shots" },
    { name: "Kling 3.0", detail: "1080p · 5s", credits: 22, unit: "shots" },
  ] },
  { group: "Directing · credits for what it makes", rates: [
    { name: "Directed scene", detail: "Say what happens, by voice or by typing; it drafts the scene for you to rewrite", credits: 6, unit: "scenes" },
    { name: "Audience reaction", detail: "An AI audience reads your pages and reacts, beat by beat", credits: 10, unit: "reactions" },
  ] },
  { group: "Voices", rates: [
    { name: "Standard voices", detail: "One page of a table read", credits: 0.6, unit: "pages" },
    { name: "Premium voices", detail: "One page of a table read", credits: 1.6, unit: "pages" },
    { name: "Premium+ voices", detail: "Our richest performances", credits: 3.2, unit: "pages" },
  ] },
  { group: "Sound design", rates: [
    { name: "Sound effect", detail: "10 seconds", credits: 1.2, unit: "effects" },
    { name: "Music", detail: "1 minute of score", credits: 9, unit: "minutes" },
    { name: "Audio drama", detail: "One adapted page with sound and music", credits: 10, unit: "pages" },
  ] },
];

/** Feature screenplays the credits read, at about 110 pages a script; zero when under one. */
export function scriptsFor(credits: number) {
  return Math.floor(credits / CREDITS_PER.tableReadPage / 110)
}

/** "≈ 13 Seedance shots", or "1 Seedance shot" when it makes just one. */
export function seedanceShots(credits: number) {
  const shots = approxCredits(credits, CREDITS_PER.seedanceShot);
  return `${shots} Seedance shot${shots === "1" ? "" : "s"}`;
}

/** Rounded down to a friendly figure: 666 reads as 650, 13 stays 13. */
export function approxCredits(credits: number, rate: number) {
  const n = Math.floor(credits / rate);
  const step = n >= 1000 ? 50 : n >= 100 ? 10 : 1;
  return (Math.floor(n / step) * step).toLocaleString("en-US");
}
