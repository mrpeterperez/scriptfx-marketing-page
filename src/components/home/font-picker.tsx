"use client";

import { useEffect, useState } from "react";

type FontChoice = "outfit" | "manrope" | "satoshi";
type FontSettings = {
  headingWeight: number;
  bodyWeight: number;
  headingSpacing: number;
  bodySpacing: number;
};
type FontSettingsByFamily = Record<FontChoice, FontSettings>;

const defaultSettings: FontSettingsByFamily = {
  outfit: { headingWeight: 700, bodyWeight: 300, headingSpacing: -0.035, bodySpacing: -0.01 },
  manrope: { headingWeight: 600, bodyWeight: 500, headingSpacing: -0.035, bodySpacing: 0 },
  satoshi: { headingWeight: 700, bodyWeight: 300, headingSpacing: -0.035, bodySpacing: -0.01 },
};

const weightRanges: Record<FontChoice, { min: number; max: number }> = {
  outfit: { min: 100, max: 900 },
  manrope: { min: 200, max: 800 },
  satoshi: { min: 300, max: 900 },
};

function readSettings(): FontSettingsByFamily {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const saved = JSON.parse(window.localStorage.getItem("scriptfx-site-font-settings-v2") || "{}") as Partial<FontSettingsByFamily>;
    return {
      outfit: { ...defaultSettings.outfit, ...saved.outfit },
      manrope: { ...defaultSettings.manrope, ...saved.manrope },
      satoshi: { ...defaultSettings.satoshi, ...saved.satoshi },
    };
  } catch {
    return defaultSettings;
  }
}

function formatSpacing(value: number, unit: "em" | "rem") {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}${unit}`;
}

const fonts: { id: FontChoice; name: string; family: string }[] = [
  { id: "outfit", name: "Outfit", family: "var(--font-outfit)" },
  { id: "manrope", name: "Manrope", family: "var(--font-manrope)" },
  { id: "satoshi", name: "Satoshi Variable", family: "var(--font-satoshi)" },
];

export function FontPicker() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<FontChoice>(() => {
    if (typeof window === "undefined") return "manrope";
    const saved = window.localStorage.getItem("scriptfx-site-font");
    return saved === "outfit" || saved === "satoshi" ? saved : "manrope";
  });
  const [settings, setSettings] = useState<FontSettingsByFamily>(readSettings);
  const current = settings[selected];

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.siteFont = selected;
    root.style.setProperty("--scriptfx-heading-weight", String(current.headingWeight));
    root.style.setProperty("--scriptfx-body-weight", String(current.bodyWeight));
    root.style.setProperty("--scriptfx-heading-spacing", `${current.headingSpacing}em`);
    root.style.setProperty("--scriptfx-body-spacing", `${current.bodySpacing}em`);
  }, [selected, current]);

  function chooseFont(font: FontChoice) {
    setSelected(font);
    window.localStorage.setItem("scriptfx-site-font", font);
  }

  function changeSetting(key: keyof FontSettings, value: number) {
    const next = { ...settings, [selected]: { ...current, [key]: value } };
    setSettings(next);
    window.localStorage.setItem("scriptfx-site-font-settings-v2", JSON.stringify(next));
  }

  const weightRange = weightRanges[selected];

  return (
    <div className="fixed right-3 top-1/2 z-[1100] -translate-y-1/2 md:right-5">
      {open && (
        <div className="absolute right-full top-1/2 mr-3 max-h-[85vh] w-64 -translate-y-1/2 overflow-y-auto rounded-xl border border-white/15 bg-[#171717]/95 p-3 text-white shadow-2xl backdrop-blur-xl">
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
            Site typography
          </p>
          <div className="space-y-1" role="group" aria-label="Site font">
            {fonts.map((font) => (
              <button
                key={font.id}
                type="button"
                onClick={() => chooseFont(font.id)}
                aria-pressed={selected === font.id}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[15px] transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${selected === font.id ? "bg-white/10" : ""}`}
                style={{ fontFamily: font.family, fontWeight: 700 }}
              >
                {font.name}
                {selected === font.id && <span className="text-xs" aria-hidden="true">✓</span>}
              </button>
            ))}
          </div>
          <div className="mt-3 space-y-4 border-t border-white/10 px-2 pt-4">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">Headlines</p>
              <label className="block text-xs" htmlFor="heading-weight">
                <span className="flex justify-between"><span>Weight</span><output>{current.headingWeight}</output></span>
                <input id="heading-weight" type="range" min={weightRange.min} max={weightRange.max} step="25" value={current.headingWeight} onChange={(event) => changeSetting("headingWeight", Number(event.target.value))} className="mt-1 w-full accent-white" />
              </label>
              <label className="block text-xs" htmlFor="heading-spacing">
                <span className="flex justify-between"><span>Letter spacing</span><output>{formatSpacing(current.headingSpacing, "em")}</output></span>
                <input id="heading-spacing" type="range" min="-0.08" max="0.16" step="0.005" value={current.headingSpacing} onChange={(event) => changeSetting("headingSpacing", Number(event.target.value))} className="mt-1 w-full accent-white" />
              </label>
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">Text &amp; menu</p>
              <label className="block text-xs" htmlFor="body-weight">
                <span className="flex justify-between"><span>Weight</span><output>{current.bodyWeight}</output></span>
                <input id="body-weight" type="range" min={weightRange.min} max={weightRange.max} step="25" value={current.bodyWeight} onChange={(event) => changeSetting("bodyWeight", Number(event.target.value))} className="mt-1 w-full accent-white" />
              </label>
              <label className="block text-xs" htmlFor="body-spacing">
                <span className="flex justify-between"><span>Letter spacing</span><output>{formatSpacing(current.bodySpacing, "em")}</output></span>
                <input id="body-spacing" type="range" min="-0.08" max="0.16" step="0.005" value={current.bodySpacing} onChange={(event) => changeSetting("bodySpacing", Number(event.target.value))} className="mt-1 w-full accent-white" />
              </label>
            </div>
          </div>
          <p className="px-2 pt-3 text-[11px] text-white/50">Screenplay: Courier New</p>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Change site typography"
        aria-expanded={open}
        title="Change site typography"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-[#171717]/90 text-sm font-bold text-white shadow-lg backdrop-blur-xl transition-colors hover:bg-[#303030] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      >
        Aa
      </button>
    </div>
  );
}
