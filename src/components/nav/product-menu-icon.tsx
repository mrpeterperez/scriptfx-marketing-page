import { MaterialFrame } from "@/components/site/material-frame";
import Image from "next/image";
import { productArtSubjects, solutionArtSubjects } from "@/lib/site/art-direction";

export function menuMaterialFor(slug: string) {
  if (["video", "character-voices"].includes(slug)) return "black";
  return ["table-reads", "audio-drama"].includes(slug) ? "velvet" : "gold";
}

export function ProductMenuIcon({ href }: { href: string }) {
  const art = [...productArtSubjects, ...solutionArtSubjects].find(item => href === `/products/${item.slug}` || href === `/solutions/${item.slug}`);
  if (!art) return null;
  return <MaterialFrame slug={art.slug} className="product-menu-art"><Image src={art.src} alt="" width={80} height={80} className="product-menu-drawing" sizes="80px" /></MaterialFrame>;
}
