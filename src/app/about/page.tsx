import Link from "next/link";
import { PageShell } from "@/components/site/page-shell";
import { pageMetadata } from "@/lib/site/config";
export const metadata = pageMetadata("About ScriptFX", "A Story About Story. How letters, backyard films, and a lifelong love of screenwriting led to ScriptFX.", "/about", true);
const sections = [
  {
    heading: "It started with letters.",
    paragraphs: [
      "My grandfather sent handwritten stories from Mexico. Ink on paper. Imagination folded into envelopes.",
      "One day my dad said:",
      "“Write him one back.”",
      "So I did.",
      "That was the first time I understood what writing could do.",
    ],
  },
  {
    heading: "Then came the camcorder.",
    paragraphs: [
      "VHS tapes. Backyard films. I stopped just watching movies — I started making them.",
      "I wrote scripts. Directed scenes. Edited in my head.",
      "I fell in love with screenwriting.",
    ],
  },
  {
    heading: "I went to film school.",
    paragraphs: [
      "Life had other plans.",
      "I worked dead-end jobs. Sales floors. Long days.",
      "Eventually, I found my way into tech — and I’ve been in it since 2010.",
      "Designing products. Building digital experiences. Shaping how people feel when they use something.",
      "Because I love screenwriting. And I love building experiences.",
      "I’m a product designer and a storyteller.",
    ],
  },
  {
    heading: "Then AI changed everything.",
    paragraphs: [
      "Not because it replaces writers.",
      "But because, for the first time, a storyteller like me could build the tools I always imagined.",
      "AI made it possible.",
      "ScriptFX is where storytelling and product design collide.",
      "It’s the app I would’ve needed when I was 14 shooting films in the backyard.",
    ],
  },
  {
    heading: "ScriptFX doesn’t replace filmmaking.",
    paragraphs: [
      "It expands it.",
      "Use AI. Use real cameras. Use actors. Use performance capture. Use whatever tools you want.",
      "ScriptFX is the creative layer that connects them.",
      "Because writing is human.",
      "The tools evolve. The storyteller doesn’t.",
    ],
  },
];
export default function Page() { return <PageShell eyebrow="About ScriptFX" title="A Story About Story" description="By Peter Perez, product designer and storyteller."><div className="site-copy">{sections.map(({ heading, paragraphs }) => <section key={heading}><h2>{heading}</h2>{paragraphs.map(text => <p key={text}>{text}</p>)}</section>)}<Link href="/contact">Talk to us</Link></div></PageShell>; }
