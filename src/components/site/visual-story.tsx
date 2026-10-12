import { MediaPlaceholder } from "./media-placeholder";

type StoryItem = { title: string; description: string; media: string; variant?: "page" | "frames" | "sound" };
export function VisualStory({ items }: { items: readonly StoryItem[] }) {
  return <div className="visual-story">{items.map((item,index) => <section className="visual-story-row" key={item.title}>
    <div className="visual-story-copy" data-visual-reveal><p className="site-eyebrow">{String(index+1).padStart(2,"0")} / The experience</p><h2>{item.title}</h2><p>{item.description}</p></div>
    <MediaPlaceholder label={item.media} variant={item.variant} number={String(index+2).padStart(2,"0")} />
  </section>)}</div>;
}
