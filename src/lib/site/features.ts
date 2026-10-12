export const features = [
  { slug: "screenplay-editor", title: "Screenplay editor", area: "writing", status: "", description: "Give your scenes a place to take shape.", sections: [
    ["Stay with the scene", "Action. Dialogue. Character. Stay inside the scene."],
    ["Work scene by scene", "Find the moment. Refine it. Keep the story moving."],
    ["Read, then listen", "Hear the rhythm of your dialogue. Find your next rewrite."],
  ] },
  { slug: "table-read", title: "Table reads", area: "writing", status: "", description: "Hear the scene you have been imagining.", sections: [
    ["Cast the conversation", "Choose a voice for every character. Hear the exchange take shape."],
    ["Listen for the rewrite", "Catch the repetition. Feel the pause. Hear what the page is missing."],
    ["Keep the writer in control", "Generated performances vary. Your judgment shapes the next draft."],
  ] },
  { slug: "character-voices", title: "Character voices", area: "writing", status: "", description: "A distinct voice for every part.", sections: [
    ["Make casting deliberate", "Distinct voices. Clear relationships. A cast chosen by you."],
    ["Refine the performance", "Try another delivery. Discover another side of the line."],
  ] },
  { slug: "revisions", title: "Scene revisions", area: "writing", status: "", description: "Give the next draft room to surprise you.", sections: [
    ["Explore another direction", "Give an idea another take. Follow the version that serves the story."],
    ["Review with context", "Compare the writing. Choose the direction. Keep going."],
  ] },
] as const;
