"use client";
import { useRef, useState } from "react";
import { Menu } from "lucide-react";
import Link from "next/link";
import { ProductMenuIcon } from "./product-menu-icon";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { TopNavMenu } from "./top-nav-menu";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink } from "@/components/ui/navigation-menu";
import { menuGroups } from "@/lib/site/catalog";

export function TopNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [open, setOpen] = useState("");
  const pinned = useRef("");
  const closeMenu = () => { pinned.current = ""; setOpen(""); };
  const mobileTrigger = useRef<HTMLButtonElement>(null);
  return <header className="global-masthead catalog-masthead">
    <div className="global-masthead-inner">
      <Button ref={mobileTrigger} variant="ghost" size="icon" className="global-mobile-menu" aria-label="Open menu" aria-expanded={mobileOpen} onClick={() => { closeMenu(); setMobileOpen(true); }}><Menu size={26} /></Button>
      <Link href="/" className="global-masthead-logo" aria-label="ScriptFX home" onClick={event => {
        closeMenu();
        if (pathname !== "/" || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
      }}><Image src="/brand/ScriptFXLogo.svg" alt="ScriptFX" width={110} height={23} priority /></Link>
      <NavigationMenu viewport={false} value={open} onValueChange={value => { if (!pinned.current) setOpen(value); }} delayDuration={100} skipDelayDuration={200} className="catalog-navigation-left" aria-label="Product navigation"><NavigationMenuList>
        {menuGroups.map(group => <NavigationMenuItem value={group.label} key={group.label}><NavigationMenuTrigger onClick={event => { event.preventDefault(); if (pinned.current === group.label) closeMenu(); else { pinned.current = group.label; setOpen(group.label); } }}>{group.label}</NavigationMenuTrigger><NavigationMenuContent className="catalog-dropdown" onEscapeKeyDown={closeMenu} onInteractOutside={event => { if (!(event.target instanceof Element && event.target.closest('[data-slot="navigation-menu-trigger"]'))) closeMenu(); }}><div className="catalog-dropdown-heading"><div><span className="catalog-kicker">{group.label}</span><p>{group.intro}</p></div><NavigationMenuLink asChild><Link href={group.href} onClick={closeMenu}>Explore all {group.label.toLowerCase()}</Link></NavigationMenuLink></div><div className="catalog-dropdown-grid">{group.links.map(item => <NavigationMenuLink asChild key={item.href}><Link href={item.href} onClick={closeMenu} className={`catalog-menu-card${(group.label === "Products" || group.label === "Solutions") ? " product-menu-item" : ""}`}>{(group.label === "Products" || group.label === "Solutions") && <ProductMenuIcon href={item.href} />}<div className="menu-item-copy"><strong>{item.title}</strong><span>{item.description}</span></div></Link></NavigationMenuLink>)}</div><div className="catalog-dropdown-bottom">Write it. Hear it. See where it goes.<NavigationMenuLink asChild><Link href="/get-access" onClick={closeMenu}>Get access</Link></NavigationMenuLink></div></NavigationMenuContent></NavigationMenuItem>)}
      </NavigationMenuList></NavigationMenu>
      <div className="catalog-header-right"><nav className="catalog-navigation" aria-label="Company navigation">{[{ title: "Enterprise", href: "/enterprise" }, { title: "Pricing", href: "/pricing" }, { title: "Contact Sales", href: "/contact-sales" }].map(item => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined} onPointerEnter={() => { if (!pinned.current) setOpen(""); }} onClick={closeMenu}>{item.title}</Link>)}</nav><nav className="global-account" aria-label="Account"><Link href="/sign-in">Sign In</Link><Button asChild size="sm" className="global-access"><Link href="/get-access" onClick={closeMenu}>Get Access</Link></Button></nav></div>
    </div>
    <TopNavMenu open={mobileOpen} onOpenChange={setMobileOpen} onCloseAutoFocus={() => mobileTrigger.current?.focus()} />
  </header>;
}
