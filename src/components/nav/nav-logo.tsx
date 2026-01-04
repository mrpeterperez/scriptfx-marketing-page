import Link from "next/link";
import Image from "next/image";

type NavLogoProps = {
  className?: string;
};

export function NavLogo({ className }: NavLogoProps) {
  return (
    <Link href="/" aria-label="Home" className={className ?? "flex items-center"}>
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
