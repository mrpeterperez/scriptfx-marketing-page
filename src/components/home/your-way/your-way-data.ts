export interface YourWayFrame {
  id: number;
  /** Production mode — pill badge */
  mode: string;
  /** Big card title */
  title: string;
  /** One-line tagline under the title */
  tagline: string;
  image: string;
}

export const yourWayFrames: YourWayFrame[] = [
  {
    id: 1,
    mode: "No Camera",
    title: "Write It",
    tagline: "Write the script. ScriptFX generates the video.",
    image: "/placeholder/your-way-1.png",
  },
  {
    id: 2,
    mode: "Live Action",
    title: "Act It",
    tagline: "Film it solo or with a crew — phone to full studio.",
    image: "/placeholder/your-way-3.png",
  },
];
