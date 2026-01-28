export interface YourWayFrame {
  id: number;
  headline: string;
  subtext: string;
  image: string;
}

export const yourWayFrames: YourWayFrame[] = [
  {
    id: 1,
    headline: "No camera.",
    subtext: "Turn scenes into cinematic visuals directly from the script. No filming. No actors. No crew.",
    image: "/placeholder/your-way-1.png",
  },
  {
    id: 2,
    headline: "Your setup.",
    subtext: "Film scenes on your phone or camera. ScriptFX handles performances, visuals, and continuity.",
    image: "/placeholder/your-way-2.png",
  },
  {
    id: 3,
    headline: "Full production.",
    subtext: "Combine real footage with AI-generated shots, performances, and environments — all in one pipeline.",
    image: "/placeholder/your-way-3.png",
  },
];
