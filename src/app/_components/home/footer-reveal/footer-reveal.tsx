"use client";

import * as React from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

const footerLinks = {
  Product: [
    { label: "Technology", href: "/technology" },
    { label: "Pricing", href: "/pricing" },
    { label: "Features", href: "/features" },
    { label: "Beta", href: "/get-access" },
  ],
  Company: [
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "About", href: "/about" },
  ],
  Social: [
    { label: "X/Twitter", href: "https://twitter.com/scriptfx" },
    { label: "LinkedIn", href: "https://linkedin.com/company/scriptfx" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
};

interface FooterRevealProps {
  className?: string;
}

export function FooterReveal({ className }: FooterRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const joinRef = useRef<HTMLSpanElement>(null);
  const waitlistRef = useRef<HTMLSpanElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const footerContentRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (!containerRef.current || !panelRef.current) return;

      const join = joinRef.current;
      const waitlist = waitlistRef.current;
      const form = formRef.current;
      const footerContent = footerContentRef.current;

      // Initial states
      gsap.set(panelRef.current, {
        scale: 0.9,
        y: 50,
      });

      if (join) gsap.set(join, { x: -10, opacity: 0.5 });
      if (waitlist) gsap.set(waitlist, { x: 10, opacity: 0.5 });
      if (form) gsap.set(form, { y: 20, opacity: 0 });
      if (footerContent) gsap.set(footerContent, { y: 30, opacity: 0 });

      // Simple scroll-triggered animation - no pinning
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          end: "top 20%",
          scrub: 0.3,
        },
      });

      // Panel scales up
      tl.to(panelRef.current, {
        scale: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
      }, 0);

      // Text parallax
      if (join) {
        tl.to(join, {
          x: -5,
          opacity: 1,
          duration: 1,
          ease: "power2.out",
        }, 0);
      }
      if (waitlist) {
        tl.to(waitlist, {
          x: 5,
          opacity: 1,
          duration: 1,
          ease: "power2.out",
        }, 0);
      }

      // Form and footer fade in
      if (form) {
        tl.to(form, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
        }, 0.3);
      }
      if (footerContent) {
        tl.to(footerContent, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
        }, 0.4);
      }

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubmitted(true);
    setIsSubmitting(false);
  };

  return (
    <section
      ref={containerRef}
      data-scriptfx-footer-reveal="true"
      className={`relative w-screen min-h-screen ${className ?? ""}`}
      style={{ 
        width: "100vw", 
        marginLeft: "calc(50% - 50vw)",
      }}
    >
      {/* Panel container */}
      <div className="w-full min-h-screen flex items-center justify-center py-6 px-3 md:px-6">
        <div 
          ref={panelRef}
          className="relative w-full max-w-[calc(100%-20px)] min-h-[calc(100dvh-48px)] rounded-[24px] overflow-hidden shadow-2xl transform-gpu backface-hidden will-change-transform"
          style={{
            background: "rgb(43, 123, 223)",
            perspective: "1000px",
            WebkitFontSmoothing: "antialiased",
          }}
        >
          {/* Main content */}
          <div className="relative z-10 w-full h-full flex flex-col p-8 md:p-20 min-h-[calc(100dvh-48px)]">
            
            {/* Launch date - top right */}
            <div className="absolute top-8 right-8 md:top-12 md:right-12">
              <p className="font-mono text-[11px] tracking-[0.3px] text-white/80 text-right leading-tight">
                launching<br />2026
              </p>
            </div>

            {/* Center content */}
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center w-full flex flex-col items-center justify-center">
                {/* Main headline */}
                <h2 className="font-display text-[60px] md:text-[120px] leading-[1.1] text-white tracking-[-2px] font-light flex flex-col items-center w-full mb-8">
                  <span 
                    ref={joinRef}
                    className="block will-change-transform"
                    style={{ WebkitFontSmoothing: "antialiased", textRendering: "optimizeLegibility" }}
                  >
                    Join the
                  </span>
                  <span 
                    ref={waitlistRef}
                    className="block will-change-transform"
                    style={{ WebkitFontSmoothing: "antialiased", textRendering: "optimizeLegibility" }}
                  >
                    Waitlist.
                  </span>
                </h2>

                {/* Email form */}
                <form 
                  ref={formRef}
                  onSubmit={handleSubmit}
                  className="w-full max-w-[300px] flex flex-col items-center gap-4"
                >
                  {!submitted ? (
                    <>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent border border-white rounded-full py-3 px-6 text-center text-white font-mono text-[14px] outline-none placeholder:text-white/50 focus:bg-white/10 transition-colors disabled:opacity-50"
                        disabled={isSubmitting}
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting || !email}
                        className="w-full px-8 bg-white text-[rgb(43,123,223)] py-3 rounded-full font-mono text-[12px] tracking-[1px] uppercase hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? "Submitting..." : "Submit"}
                      </button>
                    </>
                  ) : (
                    <div className="text-center">
                      <p className="text-white font-mono text-[14px] mb-2">✓ You&apos;re on the list!</p>
                      <p className="text-white/70 font-mono text-[12px]">We&apos;ll be in touch soon.</p>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Footer content - bottom */}
            <div 
              ref={footerContentRef}
              className="mt-auto grid grid-cols-3 lg:grid-cols-4 gap-4 text-white pt-8 border-t border-white/20"
            >
              {/* Brand */}
              <div className="col-span-3 lg:col-span-1 flex flex-col justify-between h-full order-first mb-4 lg:mb-0">
                <Link href="/" className="font-display text-[20px] tracking-[0.5px] hover:opacity-80 transition-opacity text-left">
                  ScriptFX
                </Link>
                <p className="font-mono text-[11px] text-white/60 mt-2 lg:mt-0">
                  © {new Date().getFullYear()} ScriptFX, Inc.
                </p>
              </div>

              {/* Links */}
              {Object.entries(footerLinks).slice(0, 3).map(([category, links]) => (
                <div key={category} className="col-span-1 flex flex-col gap-3 text-left">
                  <p className="font-mono text-[11px] tracking-[0.5px] text-white/60">
                    {category}
                  </p>
                  {links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="font-mono text-[11px] underline hover:text-white/80 transition-colors"
                      {...(link.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
