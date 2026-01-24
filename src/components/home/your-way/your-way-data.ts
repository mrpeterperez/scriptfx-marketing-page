export interface YourWayFrame {
  id: number;
  headline: string;
  subtext: string;
  image: string;
}

export const yourWayFrames: YourWayFrame[] = [
  {
    id: 1,
    headline: "Laptop only.",
    subtext: "Generate scenes straight from your script. No camera needed.",
    image: "/placeholder/your-way-1.png",
  },
  {
    id: 2,
    headline: "Your gear.",
    subtext: "Shoot it yourself. Star in it. Direct the action.",
    image: "/placeholder/your-way-2.png",
  },
  {
    id: 3,
    headline: "Full studio.",
    subtext: "Elevate existing footage with AI.",
    image: "/placeholder/your-way-3.png",
  },
];
