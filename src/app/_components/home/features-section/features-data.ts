export interface Feature {
  id: number;
  title: string;
  headline: string;
  description: string;
}

export const features: Feature[] = [
  {
    id: 1,
    title: "Write",
    headline: "Write like you always have.",
    description: "Familiar. Focused. Out of your way.",
  },
  {
    id: 2,
    title: "Hear it.",
    headline: "Hear it.",
    description: "AI-powered voice generation brings your characters to life instantly.",
  },
  {
    id: 3,
    title: "Build it.",
    headline: "Build it.",
    description: "Generate concept art, storyboards, and visual references from your script.",
  },
  {
    id: 4,
    title: "Direct it.",
    headline: "Direct it.",
    description: "Control camera angles, lighting, and composition with simple commands.",
  },
  {
    id: 5,
    title: "Act it.",
    headline: "Act it.",
    description: "Create animated previews with AI-generated performances.",
  },
  {
    id: 6,
    title: "Watch it.",
    headline: "Watch it.",
    description: "Export polished previsualization videos to share with your team.",
  },
];
