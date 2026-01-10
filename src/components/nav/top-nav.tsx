"use client";

import * as React from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { TopNavMenu } from "@/components/nav/top-nav-menu";
import { NavLogo } from "@/components/nav/nav-logo";

export function TopNav() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isHidden, setIsHidden] = React.useState(false);
  const navRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    const handleToggle = (e: CustomEvent<{ visible: boolean }>) => {
      setIsHidden(!e.detail.visible);
    };

    window.addEventListener("scriptfx-toggle-nav", handleToggle as EventListener);
    return () => {
      window.removeEventListener("scriptfx-toggle-nav", handleToggle as EventListener);
    };
  }, []);



  if (isMenuOpen) {
    return <TopNavMenu onClose={() => setIsMenuOpen(false)} />;
  }

  return (
    <header
      ref={navRef}
      className={`fixed left-0 right-0 top-5 z-[200] mx-auto w-full max-w-[600px] px-4 transition-all duration-500 ${
        isHidden ? "-translate-y-32 opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="relative flex h-14 items-center justify-between rounded-lg bg-black/60 px-4 backdrop-blur-xl shadow-[-11.15px_-10.392px_48px_-12px_rgba(0,0,0,0.15),-1.858px_-1.732px_12px_-8px_rgba(0,0,0,0.15)]">
        <div className="pointer-events-none absolute inset-[-1px] rounded-[8px] shadow-[inset_2.1px_1.957px_9.04px_0px_rgba(255,255,255,0.05),inset_1.171px_1.091px_4.52px_0px_rgba(255,255,255,0.03)]" />

        <NavLogo />

        <nav className="relative flex items-center gap-4 text-sm font-medium">
          <Link href="/sign-in" className="text-on-surface/90 hover:text-on-surface">
            Sign In
          </Link>
          <Button href="/get-access" variant="solid" size="sm">
            Get Access
          </Button>
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setIsMenuOpen(true)}
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-transparent text-on-surface hover:bg-container/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </header>
  );
}
