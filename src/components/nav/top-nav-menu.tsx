"use client";
import Link from "next/link";
import { ProductMenuIcon, menuMaterialFor } from "./product-menu-icon";
import { NavLogo } from "@/components/nav/nav-logo";
import { menuGroups } from "@/lib/site/catalog";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
export function TopNavMenu({ open, onOpenChange, onCloseAutoFocus }: { open: boolean; onOpenChange: (open: boolean) => void; onCloseAutoFocus: () => void }) {
  const close = () => onOpenChange(false);
  return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent className="scriptfx-mobile-sheet" onCloseAutoFocus={event => { event.preventDefault(); onCloseAutoFocus(); }}><SheetTitle className="sr-only">Site navigation</SheetTitle><SheetDescription className="sr-only">Explore ScriptFX products, solutions, and resources.</SheetDescription><NavLogo onClick={close}/><nav aria-label="Products and resources"><Accordion type="single" collapsible>{menuGroups.map(group => <AccordionItem value={group.label} key={group.label}><AccordionTrigger>{group.label}</AccordionTrigger><AccordionContent><Link href={group.href} onClick={close}>Explore all {group.label.toLowerCase()}</Link>{group.links.map(item => <Link key={item.href} href={item.href} onClick={close} className={(group.label === "Products" || group.label === "Solutions") ? `product-menu-item product-card-${menuMaterialFor(item.href.split("/").pop() || "")}` : undefined}>{(group.label === "Products" || group.label === "Solutions") && <ProductMenuIcon href={item.href} />}<div className="menu-item-copy"><strong>{item.title}</strong><span>{item.description}</span></div></Link>)}</AccordionContent></AccordionItem>)}</Accordion>{[{ title: "Enterprise", href: "/enterprise" }, { title: "Pricing", href: "/pricing" }, { title: "Contact Sales", href: "/contact-sales" }].map(item => <Link key={item.href} href={item.href} className="mobile-main-link" onClick={close}>{item.title}</Link>)}</nav><div className="mobile-menu-actions"><Link href="/sign-in" onClick={close}>Sign In</Link><Button asChild><Link href="/get-access" onClick={close}>Get Access</Link></Button></div></SheetContent></Sheet>;
}
