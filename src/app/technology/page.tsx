import { PageShell, SiteCTA } from "@/components/site/page-shell";
import { VisualStory } from "@/components/site/visual-story";
import { pageMetadata } from "@/lib/site/config";
export const metadata = pageMetadata("Technology", "Explore the writing, revision, and generated table-read workflows behind ScriptFX.", "/technology");
export default function TechnologyPage() { return <PageShell eyebrow="Behind the experience" title="Built for the story." description="From the first line to the next take." mediaLabel="The ScriptFX experience"><VisualStory items={[
  { title: "Write with focus.", description: "Action, character, dialogue. A workspace that keeps you in the scene.", media: "Screenplay workspace", variant: "page" },
  { title: "Hear the words.", description: "Cast a table read. Find the rhythm. Generated performances vary; your judgment leads.", media: "Table-read playback", variant: "sound" },
  { title: "Keep developing.", description: "Explore another version. Follow the story somewhere new.", media: "Scene revisions", variant: "frames" },
]} /><SiteCTA /></PageShell>; }
