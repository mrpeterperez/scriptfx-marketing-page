"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

type NavLogoProps = {
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
};

export function NavLogo({ className, onClick }: NavLogoProps) {
  const pathname = usePathname();

  return (
    <Link
      href="/"
      scroll
      aria-label="Home"
      className={className ?? "flex items-center"}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;

        if (pathname === "/") {
          event.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }}
    >
      <Image
        src="/brand/scriptfx-logo.svg"
        alt="ScriptFX"
        width={88}
        height={21}
        priority
      />
    </Link>
  );
}
