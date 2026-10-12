export const designDefaults = {
  font: "manrope", ink: "#202020", paper: "#ffffff", muted: "#666666",
  headingWeight: 600, bodySize: 16, tracking: -0.035, radius: 24, spacing: 80, buttonRadius: 999,
};
export type DesignSettings = typeof designDefaults;
export const designKey = "scriptfx-design-kit-v1";
export function sanitizeDesign(input: unknown): DesignSettings {
  const value = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const number = (key: keyof DesignSettings, min: number, max: number) => typeof value[key] === "number" && Number.isFinite(value[key]) ? Math.min(max, Math.max(min, value[key] as number)) : designDefaults[key];
  const color = (key: "ink" | "paper" | "muted") => typeof value[key] === "string" && /^#[0-9a-f]{6}$/i.test(value[key] as string) ? value[key] as string : designDefaults[key];
  return { font: ["manrope", "outfit", "satoshi"].includes(String(value.font)) ? String(value.font) : designDefaults.font, ink: color("ink"), paper: color("paper"), muted: color("muted"), headingWeight: number("headingWeight", 300, 800) as number, bodySize: number("bodySize", 16, 22) as number, tracking: number("tracking", -0.06, 0) as number, radius: number("radius", 0, 48) as number, spacing: number("spacing", 40, 120) as number, buttonRadius: number("buttonRadius", 0, 999) as number };
}
export function designVariables(settings: DesignSettings): Record<string, string> {
  return { "--scriptfx-black": settings.ink, "--scriptfx-surface": settings.paper, "--scriptfx-on-surface": settings.ink, "--kit-ink": settings.ink, "--kit-paper": settings.paper, "--kit-muted": settings.muted, "--scriptfx-font-display": `var(--font-${settings.font}), sans-serif`, "--scriptfx-font-body": `var(--font-${settings.font}), sans-serif`, "--scriptfx-heading-weight": String(settings.headingWeight), "--scriptfx-heading-spacing": `${settings.tracking}em`, "--kit-body-size": `${settings.bodySize}px`, "--kit-radius": `${settings.radius}px`, "--kit-section-space": `${settings.spacing}px`, "--kit-button-radius": `${settings.buttonRadius}px` };
}
export function loadDesign(): DesignSettings | null {
  try { const saved = localStorage.getItem(designKey); return saved ? sanitizeDesign(JSON.parse(saved)) : null; } catch { return null; }
}
