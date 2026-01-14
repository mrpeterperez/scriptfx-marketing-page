export const screenplayLines = [
  {
    type: "action",
    text: "She stares at the screen. The cursor blinks. One word at a time, the scene builds itself—",
  },
  {
    type: "action",
    text: "A coffee shop materializes. Rain on windows. Two strangers reaching for the same book.",
  },
  { type: "action", text: "Elena watches, breathless, as her characters move. Speak. Live." },
  { type: "action", text: "For the first time, she isn't just writing a story." },
  { type: "action", text: "She's watching it happen." },
  { type: "character", text: "ELENA" },
  { type: "dialogue", text: "(whispers)" },
  { type: "dialogue", text: "It's real." },
  { type: "action", text: "She leans back. A single tear catches the light of the monitor." },
  { type: "action", text: "The cursor blinks once more—" },
  { type: "action", text: "—then types on its own:" },
  { type: "transition", text: "FADE TO BLACK." },
];

export function getLineClass(type: string): string {
  switch (type) {
    case "scene":
      return "mb-4 uppercase font-bold";
    case "action":
      return "mb-4";
    case "character":
      return "mt-4 mb-0.5 text-center uppercase";
    case "dialogue":
      return "mx-auto mb-3 max-w-[380px] text-center";
    case "transition":
      return "mt-6 text-right uppercase font-bold";
    default:
      return "";
  }
}
