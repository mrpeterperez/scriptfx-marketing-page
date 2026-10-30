"use client";

import { usePathname } from "next/navigation";
import { TopNav } from "@/components/nav/top-nav";
import { SiteFooter } from "./site-footer";
import { LandingSoundProvider } from "@/components/home/landing-sound";
import { PageMotion } from "./page-motion";

export function SiteFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const internal = pathname !== "/" && !pathname.startsWith("/preview/landing-");
  const content = <>
    <TopNav />
    <div className={`global-page-surface${internal ? " internal-page-surface" : ""}`}>
      <main id="main-content" style={internal ? undefined : { paddingTop: 0 }} className="mx-auto w-full max-w-site px-6 pt-8 sm:pt-12">
        <PageMotion>{children}</PageMotion>
      </main>
      <SiteFooter />
    </div>
  </>;
  return internal ? content : <LandingSoundProvider>{content}</LandingSoundProvider>;
}
