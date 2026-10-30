"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { menuGroups } from "@/lib/site/catalog";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function TopNavMenu({ open, onOpenChange, onCloseAutoFocus }: { open: boolean; onOpenChange: (open: boolean) => void; onCloseAutoFocus: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const back = useRef<HTMLButtonElement>(null);
  const firstCategory = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const group = menuGroups.find(item => item.label === selected);
  const changeOpen = (next: boolean) => { if (!next) setSelected(null); onOpenChange(next); };
  const close = () => changeOpen(false);

  useEffect(() => {
    if (open) (selected ? back.current : firstCategory.current)?.focus();
  }, [selected, open]);

  return <Sheet open={open} onOpenChange={changeOpen}>
    <SheetContent side="top" showCloseButton={false} className="scriptfx-explore-sheet" onCloseAutoFocus={event => { event.preventDefault(); onCloseAutoFocus(); }}>
      <SheetTitle className="sr-only">Site navigation{group ? `: ${group.label}` : ""}</SheetTitle>
      <SheetDescription className="sr-only">Explore ScriptFX products, solutions, resources, and pricing.</SheetDescription>
      <div className="explore-menu-header">
        <Link href="/" onClick={close} aria-label="ScriptFX home"><Image src="/brand/ScriptFXLogo.svg" alt="ScriptFX" width={102} height={22} /></Link>
        <SheetClose asChild><button type="button" className="explore-menu-close" aria-label="Close menu"><X size={20} /></button></SheetClose>
      </div>
      <nav aria-label="Site navigation" className="explore-menu-body">
        <div key={selected ?? "main"} className="explore-menu-view">
          {group ? <>
            <button ref={back} type="button" className="explore-menu-back" onClick={() => setSelected(null)}><ArrowLeft size={16} /> All navigation</button>
            <h2 className="explore-menu-title">{group.label}</h2>
            <div className="explore-menu-links">{group.links.map(item => <Link key={item.href} href={item.href} onClick={close} aria-current={pathname === item.href ? "page" : undefined}>{item.title}<ChevronRight size={16} aria-hidden="true" /></Link>)}</div>
            <Link href={group.href} onClick={close} className="explore-menu-overview">Explore all {group.label.toLowerCase()}<ArrowRight size={16} aria-hidden="true" /></Link>
          </> : <>
            <div className="explore-menu-primary">{menuGroups.map((item, index) => <button ref={index === 0 ? firstCategory : undefined} key={item.label} type="button" onClick={() => setSelected(item.label)}>{item.label}<ChevronRight size={22} aria-hidden="true" /></button>)}<Link href="/pricing" onClick={close} aria-current={pathname === "/pricing" ? "page" : undefined}>Pricing<ArrowRight size={22} aria-hidden="true" /></Link></div>
            <div className="explore-menu-secondary"><Link href="/enterprise" onClick={close}>Enterprise</Link><Link href="/contact-sales" onClick={close}>Contact sales</Link></div>
          </>}
        </div>
      </nav>
      <div className="explore-menu-actions"><Link href="/sign-in" onClick={close}>Sign in</Link><Button asChild><Link href="/get-access" onClick={close}>Get access <ArrowRight size={16} aria-hidden="true" /></Link></Button></div>
    </SheetContent>
  </Sheet>;
}
