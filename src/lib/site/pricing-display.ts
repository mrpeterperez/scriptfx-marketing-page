export const pricingCurrencies = [
  { code: "USD", label: "USD $", rate: 1 },
  { code: "JPY", label: "JPY ¥", rate: 158.6 },
  { code: "EUR", label: "EUR €", rate: 0.89437 },
  { code: "KRW", label: "KRW ₩", rate: 1333.09 },
  { code: "GBP", label: "GBP £", rate: 0.75555 },
  { code: "BRL", label: "BRL R$", rate: 4.9923 },
] as const;

export type PricingCurrency = typeof pricingCurrencies[number]["code"];
export type PricingBilling = "month" | "year";

// Reference-rate snapshot for display estimates, not settlement prices.
// Source: https://api.frankfurter.dev/v1/latest?base=USD&symbols=JPY,EUR,KRW,GBP,BRL
export const pricingRateDate = "2026-10-12";

export function formatPricingAmount(amountUsd: number, currency: PricingCurrency = "USD") {
  const rate = pricingCurrencies.find(item => item.code === currency)!.rate;
  const amount = amountUsd * rate;
  const decimals = currency === "JPY" || currency === "KRW" || Number.isInteger(amount) ? 0 : 2;
  return new Intl.NumberFormat("en-US", { style: "currency", currency, currencyDisplay: "narrowSymbol", minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(amount);
}

export function annualPricingAmount(monthlyUsd: number) {
  return monthlyUsd * 10;
}
