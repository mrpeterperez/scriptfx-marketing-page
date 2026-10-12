import Link from "next/link";
import type { Metadata } from "next";
import styles from "./preview.module.css";

export const metadata: Metadata = {
  title: "Old Hollywood hero study",
  description: "A paint-and-pencil art direction for ScriptFX.",
  robots: { index: false, follow: false },
};

export default function PreviewPage() {
  return <section className={styles.hero} aria-label="ScriptFX Old Hollywood hero preview">
    <div className={styles.copy}>
      <h1>Write your screenplay.<br/>Watch it come <em>alive.</em></h1>
      <p>From screenplay to audio drama and cinema.</p>
      <Link className={styles.cta} href="/products/screenplay-editor">Explore ScriptFX <span aria-hidden="true">↗</span></Link>
    </div>
    <a className={styles.art} href="/art/products/renaissance/old-hollywood-hero-final.png" aria-label="View the full typewriter, Bolex camera, and vintage microphone illustration">
      {/* Native image keeps the standalone artwork available in the read-only phone preview. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/art/products/renaissance/old-hollywood-hero-final.png" width="1536" height="768" alt="A vintage typewriter, Bolex-style movie camera, and brass microphone drawn in rough pencil with muted painted color." fetchPriority="high" />
    </a>
  </section>;
}
