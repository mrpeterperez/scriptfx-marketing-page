"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import Link from "next/link";
type AnalyticsWindow = Window & { dataLayer?: unknown[][]; gtag?: (...args: unknown[]) => void };
const key = "scriptfx-analytics-consent";
export function Analytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID;
  const [consent, setConsent] = useState(false);
  const [ready, setReady] = useState(false);
  const path = usePathname();
  useEffect(() => {
    const load = () => setConsent(localStorage.getItem(key) === "granted");
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!id || !consent || !ready) return;
    const target = window as AnalyticsWindow;
    target.gtag?.("event", "page_view", { page_location: `${window.location.origin}${path}`, page_title: document.title });
    function converted(event: Event) {
      const name = (event as CustomEvent<{ event: string }>).detail?.event;
      if (name === "lead_accepted" || name === "contact_accepted") target.gtag?.("event", name, { page_path: path });
    }
    function clicked(event: MouseEvent) {
      const link = (event.target as HTMLElement)?.closest?.('a[href="/get-access"]');
      if (link) target.gtag?.("event", "access_cta_click", { page_path: path });
    }
    window.addEventListener("scriptfx:conversion", converted); document.addEventListener("click", clicked);
    return () => { window.removeEventListener("scriptfx:conversion", converted); document.removeEventListener("click", clicked); };
  }, [id, consent, ready, path]);
  if (!id || !/^G-[A-Z0-9]+$/.test(id)) return null;
  function choose() {
    const granted = !consent; localStorage.setItem(key, granted ? "granted" : "denied");
    const target = window as AnalyticsWindow;
    target.gtag?.("consent", "update", { analytics_storage: granted ? "granted" : "denied" });
    setConsent(granted);
    if (!granted) window.location.reload();
  }
  return <><div className="analytics-choice"><p>Optional analytics help us improve ScriptFX.</p><button type="button" onClick={choose}>{consent ? "Turn analytics off" : "Allow analytics"}</button><Link href="/privacy">Privacy</Link></div>{consent && <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" onReady={() => { const target = window as AnalyticsWindow; target.dataLayer ??= []; target.gtag ??= (...args) => target.dataLayer!.push(args); target.gtag("consent", "default", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" }); target.gtag("js", new Date()); target.gtag("config", id, { send_page_view: false, allow_google_signals: false }); setReady(true); }} />}</>;
}
