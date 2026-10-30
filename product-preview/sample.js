import { createInitialEditorStateFromElements } from '@/lib/lexical/utils/import-to-lexical';
import { screenplayPages } from './screenplay-story';
export const alternatives = [
  ['Mara sits. Leo keeps the keys.', 'I want the car. And I want the money. Tonight, Leo.'],
  ['Mara leans across the table.', 'The car. The money. Tonight, Leo.'],
  ['Mara takes the keys. Leo watches.', 'Keep the money. I’m taking the car.'],
];
export function sample() {
  const state = createInitialEditorStateFromElements([]);
  state.root.children = screenplayPages.map(({ number, id, lines }) => {
    const page = createInitialEditorStateFromElements(lines.map(([type, text]) => ({ type, text }))).root.children[0];
    page.pageNumber = number;
    page.children[0].sceneId = id;
    return page;
  });
  return state;
}
