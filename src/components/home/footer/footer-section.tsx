"use client";

import * as React from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import Image from "next/image";
import { submitMarketing } from "@/lib/marketing";
import { Button } from "@/components/ui/button";
import { footerLinks } from "@/lib/footer-links";

gsap.registerPlugin(ScrollTrigger);

export function FooterSection({ includeFooter = true }: { includeFooter?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const showDontTellRef = useRef<HTMLDivElement>(null);
  const showRef = useRef<HTMLSpanElement>(null);
  const dontTellRef = useRef<HTMLSpanElement>(null);
  const waitlistTextRef = useRef<HTMLDivElement>(null);
  const joinRef = useRef<HTMLSpanElement>(null);
  const waitlistRef = useRef<HTMLSpanElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const footerContentRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef<string | null>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (!containerRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const panel = panelRef.current;

      // ===== INITIAL STATES =====
      // Show Don't Tell - starts hidden, "Show." appears first
      if (showRef.current) gsap.set(showRef.current, { autoAlpha: 0, y: 30, filter: "blur(12px)" });
      if (dontTellRef.current) gsap.set(dontTellRef.current, { autoAlpha: 0, y: 30, filter: "blur(12px)" });

      // Waitlist text - starts hidden
      if (waitlistTextRef.current) gsap.set(waitlistTextRef.current, { autoAlpha: 0 });
      if (joinRef.current) gsap.set(joinRef.current, { autoAlpha: 0, y: 30, filter: "blur(12px)" });
      if (waitlistRef.current) gsap.set(waitlistRef.current, { autoAlpha: 0, y: 30, filter: "blur(12px)" });

      // Form - starts hidden, fades in with panel
      if (formRef.current) gsap.set(formRef.current, { autoAlpha: 0, y: 20 });

      // ===== MAIN SCROLL TRIGGER =====
      // Total phases: 3 show don't tell reveal + 3 waitlist transition = 6
      const totalPhases = 6;

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: `+=${totalPhases * 100}vh`,
        pin: true,
        scrub: 1.2,
        onUpdate: (self) => {
          const progress = self.progress;
          const phase = progress * totalPhases;

          // Hide nav while footer is visible
          window.dispatchEvent(new CustomEvent("scriptfx-toggle-nav", { detail: { visible: false } }));

          // ===== PHASE 1: Show Don't Tell reveal (0-3) =====
          if (phase < 3) {
            const localProgress = phase / 3;

            // "Show." appears early
            if (showRef.current) {
              const p = Math.max(0, Math.min(localProgress * 5, 1));
              gsap.set(showRef.current, { autoAlpha: p, y: 30 * (1 - p), filter: `blur(${12 * (1 - p)}px)` });
            }
            // "Don't Tell." fades in partway through
            if (dontTellRef.current) {
              const p = Math.max(0, Math.min((localProgress - 0.3) * 3, 1));
              gsap.set(dontTellRef.current, { autoAlpha: p, y: 30 * (1 - p), filter: `blur(${12 * (1 - p)}px)` });
            }

            // Keep waitlist text hidden
            if (waitlistTextRef.current) gsap.set(waitlistTextRef.current, { autoAlpha: 0 });

            // Form fades in
            if (formRef.current) {
              const p = Math.max(0, Math.min((localProgress - 0.5) * 3, 1));
              gsap.set(formRef.current, { autoAlpha: p, y: 20 * (1 - p) });
            }
          }
          // ===== PHASE 2: Transition to Waitlist (3-6) =====
          else {
            const localProgress = (phase - 3) / 3;

            // Fade out Show Don't Tell
            if (showRef.current) {
              const p = 1 - localProgress;
              gsap.set(showRef.current, { autoAlpha: p, y: -20 * localProgress, filter: `blur(${10 * localProgress}px)` });
            }
            if (dontTellRef.current) {
              const p = 1 - localProgress;
              gsap.set(dontTellRef.current, { autoAlpha: p, y: -20 * localProgress, filter: `blur(${10 * localProgress}px)` });
            }

            // Fade in Waitlist text
            if (waitlistTextRef.current) {
              const p = Math.max(0, Math.min((localProgress - 0.2) * 2, 1));
              gsap.set(waitlistTextRef.current, { autoAlpha: p });
            }
            if (joinRef.current) {
              const p = Math.max(0, Math.min((localProgress - 0.25) * 3, 1));
              gsap.set(joinRef.current, { autoAlpha: p, y: 30 * (1 - p), filter: `blur(${12 * (1 - p)}px)` });
            }
            if (waitlistRef.current) {
              const p = Math.max(0, Math.min((localProgress - 0.4) * 3, 1));
              gsap.set(waitlistRef.current, { autoAlpha: p, y: 30 * (1 - p), filter: `blur(${12 * (1 - p)}px)` });
            }

            // Keep form visible
            if (formRef.current) gsap.set(formRef.current, { autoAlpha: 1, y: 0 });
          }
        },

      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;
    setIsSubmitting(true);
    try {
      requestId.current ??= crypto.randomUUID();
      await submitMarketing("leads", { email, consent: true, interest: "all", website: "" }, requestId.current);
      setSubmitted(true);
    } catch { setError("We couldn’t save your email. Please try again."); }
    finally { setIsSubmitting(false); }
  };

  return (
    <section
      ref={containerRef}
      data-scriptfx-footer="true"
      className="relative z-[90] h-screen w-screen bg-transparent"
      style={{
        width: "100vw",
        marginLeft: "calc(50% - 50vw)",
      }}
    >
      {/* Panel wrapper - viewport sized */}
      <div className="relative h-full w-full px-6 py-6 md:px-12 md:py-12 overflow-hidden">
        {/* ===== Footer Panel ===== */}
        <div
          ref={panelRef}
          className="absolute inset-6 md:inset-12 z-[76] rounded-[16px] shadow-2xl transform-gpu will-change-transform border border-border bg-secondary-container"
          style={{
            overflow: "hidden",
            background: "var(--scriptfx-black)",
            color: "#fff",
            "--scriptfx-on-surface": "#fff",
            "--scriptfx-on-surface-variant": "rgba(255,255,255,.7)",
            "--scriptfx-border": "rgba(255,255,255,.15)",
            "--scriptfx-primary": "#fff",
            "--scriptfx-on-primary": "#111",
          } as React.CSSProperties}
        >
          <div className="relative z-10 w-full h-full flex flex-col p-8 md:p-20 overflow-hidden">
            {/* Launch date - top right */}
            <div className="absolute top-8 right-8 md:top-12 md:right-12">
              <p className="font-body text-[11px] tracking-[0.3px] text-on-surface-variant text-right leading-tight">
                Get access
              </p>
            </div>

            {/* Center content - takes remaining space and centers */}
            <div className="flex-1 flex flex-col items-center justify-center relative">
              {/* Text container - holds both Show Don't Tell and Waitlist text */}
              <div className="relative h-[200px] md:h-[250px] w-full flex items-center justify-center mb-8">
                {/* Stop pitching ideas. Ship experiences. - centered */}
                <div ref={showDontTellRef} className="absolute inset-0 flex items-center justify-center">
                  <h2 className="text-center font-display text-5xl md:text-6xl font-medium leading-[1.15] tracking-tighter text-on-surface">
                    <span ref={showRef} className="block">Stop pitching ideas.</span>
                    <span ref={dontTellRef} className="block">Ship <span className="italic">experiences.</span></span>
                  </h2>
                </div>

                {/* Join the Waitlist text - centered */}
                <div ref={waitlistTextRef} className="absolute inset-0 flex items-center justify-center">
                  <h2 className="text-center font-display text-5xl md:text-6xl font-medium leading-[1.15] tracking-tighter text-on-surface">
                    <span ref={joinRef} className="block">Join the</span>
                    <span ref={waitlistRef} className="block"><span className="italic">Waitlist.</span></span>
                  </h2>
                </div>
              </div>

              {/* Email form - always below the text */}
              <form ref={formRef} onSubmit={handleSubmit} className="w-full max-w-[300px] flex flex-col items-center gap-4">
                {!submitted ? (
                  <>
                    <input
                      type="email"
                      aria-label="Email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent border border-on-surface/30 rounded-full py-3 px-6 text-center text-on-surface font-body text-[14px] outline-none placeholder:text-on-surface-variant transition-all duration-200 disabled:opacity-50 focus:border-accent focus:ring-1 focus:ring-accent/30 focus:bg-accent/5 invalid:border-error invalid:focus:ring-error/30"
                      disabled={isSubmitting}
                      required
                    />
                    <Button
                      size="lg"
                      type="submit"
                      disabled={isSubmitting || !email}
                      className="w-full"
                    >
                      {isSubmitting ? "Submitting..." : "Join the waitlist"}
                    </Button>
                  </>
                ) : (
                  <div className="text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <p className="text-on-surface font-body text-[14px] mb-2">✓ You&apos;re on the list!</p>
                    <p className="text-on-surface-variant font-body text-[12px]">We&apos;ll be in touch soon.</p>
                  </div>
                )}
              <p className="text-xs">Submitting requests access updates. <Link href="/privacy">Privacy notice</Link></p>
                {error && <p role="alert">{error}</p>}
              </form>
            </div>

            {/* Footer content */}
            {includeFooter && <div ref={footerContentRef} className="grid grid-cols-3 lg:grid-cols-4 gap-4 text-on-surface pt-8 border-t border-border">
              <div className="col-span-3 lg:col-span-1 flex flex-col justify-between h-full order-first mb-4 lg:mb-0">
                <Link href="/" className="hover:opacity-80 transition-opacity">
                  <Image
                    src="/brand/ScriptFXLogo.svg"
                    alt="ScriptFX"
                    width={102}
                    height={21}
                  />
                </Link>
                <p className="font-body text-[11px] text-on-surface-variant mt-2 lg:mt-0">© {new Date().getFullYear()} ScriptFX, Inc.</p>
              </div>
              {Object.entries(footerLinks).map(([category, links]) => (
                <div key={category} className="col-span-1 flex flex-col gap-3 text-left">
                  <p className="font-body text-[11px] tracking-[0.5px] text-on-surface-variant">{category}</p>
                  {links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="font-body text-[11px] underline hover:text-on-surface-variant transition-colors"
                      {...(link.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>}
          </div>
        </div>
      </div>
    </section>
  );
}
