import Link from "next/link";

const tiers: Array<{
  name: string;
  price: string;
  hint: string;
  features: string[];
  featured?: boolean;
}> = [
  {
    name: "Starter",
    price: "$0",
    hint: "For evaluating ScriptFX",
    features: ["1 workspace", "Community support", "Basic automations"],
  },
  {
    name: "Pro",
    price: "$19",
    hint: "For small teams shipping weekly",
    features: ["Unlimited workspaces", "Priority support", "Advanced automations"],
    featured: true,
  },
  {
    name: "Business",
    price: "Let’s talk",
    hint: "For larger orgs",
    features: ["SLA", "Security reviews", "Custom onboarding"],
  },
];

export function Pricing() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Pricing</h1>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-300">
          Keep this page in code for now—later you can wire it to Stripe.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={
              tier.featured
                ? "rounded-2xl border border-black/10 bg-zinc-50 p-6 dark:border-white/10 dark:bg-white/5"
                : "rounded-2xl border border-black/10 p-6 dark:border-white/10"
            }
          >
            <div className="space-y-1">
              <h2 className="text-base font-semibold">{tier.name}</h2>
              <div className="text-3xl font-semibold tracking-tight">
                {tier.price}
                {tier.price.startsWith("$") ? (
                  <span className="text-base font-medium text-zinc-500 dark:text-zinc-400">
                    /mo
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">{tier.hint}</p>
            </div>

            <ul className="mt-6 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
              {tier.features.map((feature) => (
                <li key={feature}>• {feature}</li>
              ))}
            </ul>

            <div className="mt-8">
              <Link
                href="/"
                className={
                  tier.featured
                    ? "inline-flex h-10 w-full items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                    : "inline-flex h-10 w-full items-center justify-center rounded-full border border-black/10 px-5 text-sm font-semibold text-zinc-950 hover:bg-zinc-50 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
                }
              >
                Get started
              </Link>
            </div>
          </div>
        ))}
      </section>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Want subscriptions next? Add Stripe Checkout + a webhook.
      </p>
    </div>
  );
}
