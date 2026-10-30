import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey, $getRoot } from 'lexical';
import { sample } from './sample';

export function GuidedPreviewPlugin() {
  const [editor] = useLexicalComposerContext();
  const active = useRef(true);
  useEffect(() => {
    const editable = editor.isEditable();
    editor.setEditable(false);
    const visibility = event => { active.current = event.detail; };
    window.addEventListener('scriptfx-preview-visibility', visibility);
    return () => {
      editor.setEditable(editable);
      window.removeEventListener('scriptfx-preview-visibility', visibility);
    };
  }, [editor]);
  useEffect(() => {
    let timer = 0, stopped = false, blockKey, textKey;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scrollToScript = () => requestAnimationFrame(() => {
      const page = editor.getRootElement()?.querySelector('.screenplay-page');
      const scroller = page?.closest('.lexical-scroll-area');
      if (page && scroller) scroller.scrollTop += page.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
    });
    editor.setEditorState(editor.parseEditorState(sample()));
    scrollToScript();
    if (reduced) return;
    let character = 0;
    let text = '';
    editor.update(() => {
      const block = $getRoot().getFirstChild()?.getChildren().find(node => node.getType() === 'dialogue');
      const content = block?.getFirstChild();
      if (!content) return;
      text = content.getTextContent();
      blockKey = block.getKey(); textKey = content.getKey();
      character = 1;
      content.setTextContent(text.slice(0, character));
    }, { discrete: true });
    const mark = () => {
      editor.getRootElement()?.querySelectorAll('[data-preview-typing]').forEach(element => element.removeAttribute('data-preview-typing'));
      editor.getElementByKey(blockKey)?.setAttribute('data-preview-typing', '');
    };
    const tick = () => {
      if (stopped || character >= text.length || !textKey) return;
      if (!active.current || document.hidden) { timer = window.setTimeout(tick, 250); return; }
      editor.update(() => {
        character++;
        $getNodeByKey(textKey)?.setTextContent(text.slice(0, character));
      }, { discrete: true });
      mark();
      timer = window.setTimeout(tick, /[,.]/.test(text[character - 1]) ? 250 : 85 + (character % 4) * 25);
    };
    timer = window.setTimeout(tick, 650);
    return () => {
      stopped = true; clearTimeout(timer);
      delete document.documentElement.dataset.previewTypingPending;
      editor.getRootElement()?.querySelectorAll('[data-preview-typing]').forEach(element => element.removeAttribute('data-preview-typing'));
    };
  }, [editor]);
  return null;
}
