"use client";

import { usePathname } from "next/navigation";
import { TopNav } from "@/components/nav/top-nav";
import { SiteFooter } from "./site-footer";
import { PageMotion } from "./page-motion";

export function SiteFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const internal = pathname !== "/";
  return <>
    <TopNav />
    <div className={`global-page-surface${internal ? " internal-page-surface" : ""}`}>
      <main id="main-content" style={internal ? undefined : { paddingTop: 0 }} className="mx-auto w-full max-w-site px-6 pt-28">
        <PageMotion>{children}</PageMotion>
      </main>
      <SiteFooter />
    </div>
  </>;
}
