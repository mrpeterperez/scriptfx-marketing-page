"use client";
import { useEffect } from "react";
import { designDefaults, designKey, designVariables, loadDesign } from "@/lib/site/design-tokens";
export function DesignProvider() {
  useEffect(() => {
    const root = document.documentElement;
    const originals = Object.fromEntries(Object.keys(designVariables(designDefaults)).map(key => [key, root.style.getPropertyValue(key)]));
    function update() {
      const saved = loadDesign();
      if (saved) { root.dataset.designKit = "active"; Object.entries(designVariables(saved)).forEach(([key, value]) => root.style.setProperty(key, value)); }
      else { delete root.dataset.designKit; Object.entries(originals).forEach(([key, value]) => value ? root.style.setProperty(key, value) : root.style.removeProperty(key)); }
    }
    function storage(event: StorageEvent) { if (event.key === designKey || event.key === null) update(); }
    update(); window.addEventListener("scriptfx-design-update", update); window.addEventListener("storage", storage);
    return () => { window.removeEventListener("scriptfx-design-update", update); window.removeEventListener("storage", storage); };
  }, []);
  return null;
}
