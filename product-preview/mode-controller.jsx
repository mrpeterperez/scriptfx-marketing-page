import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useEditorView } from '@/lib/hooks/use-editor-view';
import { useWorkspaceSlots } from '@/lib/presence/workspace-slots';
import { useZoom } from '@/lib/zoom-context';
import { previewMode } from './data';

export function ModeController() {
  const navigate = useNavigate();
  const view = useEditorView();
  const slots = useWorkspaceSlots();
  const { setZoom } = useZoom();
  useEffect(() => {
    if (!new URLSearchParams(location.search).has('fit')) return;
    const fit = () => setZoom(Math.min(100, Math.max(25, Math.floor((innerWidth - 32) / 816 * 100))));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [setZoom]);
  useEffect(() => {
    const showMode = mode => {
      document.documentElement.dataset.previewMode = mode;
      void navigate({ search: previous => ({ ...previous, map: mode === 'tools' ? 'v4' : undefined }), replace: true, resetScroll: false });
    };
    showMode(previewMode);
    const receive = event => {
      if (event.origin !== location.origin || event.source !== parent) return;
      if (event.data?.type === 'scriptfx-preview-visibility') {
        window.dispatchEvent(new CustomEvent('scriptfx-preview-visibility', { detail: event.data.active }));
      } else if (event.data?.type === 'scriptfx-preview-mode' && ['classic', 'tools', 'ai'].includes(event.data.mode)) {
        showMode(event.data.mode);
      }
    };
    window.addEventListener('message', receive);
    parent.postMessage({ type: 'scriptfx-preview-ready' }, location.origin);
    return () => window.removeEventListener('message', receive);
  }, [navigate]);
  // Keep the same document and panel nodes mounted; only their layout changes.
  useEffect(() => { view.openLeftSidebar(); }, [view.openLeftSidebar]);
  useEffect(() => {
    if (slots?.companion?.open) slots.companion.onToggle();
  }, [slots?.companion?.open]);
  return null;
}
