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
      className={className ?? "inline-flex shrink-0 self-center items-center leading-none"}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;

        if (pathname === "/") {
          event.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }}
    >
      <span className="flex items-center">
        <Image
          src="/brand/ScriptFXLogo.svg"
          alt="ScriptFX"
          width={102}
          height={21}
          className="block invert h-auto w-[102px] translate-y-[2px]"
          priority
        />
      </span>
    </Link>
  );
}
