import { sample } from './sample';
import { screenplayBeats } from './screenplay-story';
import { ELEMENT_DEFAULTS } from '@/lib/editor/element-defaults';
import { getFramework } from '@/lib/structure/frameworks';
import { composeDocument, decomposeDocument } from '@/lib/lexical/utils/document-composer';

export const projectId = '00000000-0000-4000-8000-000000000001';
const owner = '00000000-0000-4000-8000-000000000002';
const draftId = '00000000-0000-4000-8000-000000000003';
const user = { id: owner, email: 'preview@example.invalid', user_metadata: { display_name: 'Preview writer' }, app_metadata: {} };
const session = { user, access_token: 'local-preview', expires_at: 9999999999 };
const tables = new Map();
const now = new Date().toISOString();
const storyGroups = {
  opening: ['opening-image', 'theme-stated', 'setup'],
  'inciting-incident': ['catalyst'],
  'plot-point-1': ['debate', 'break-into-two'],
  'pinch-1': ['b-story', 'fun-and-games'],
  midpoint: ['midpoint'],
  'pinch-2': ['bad-guys-close-in', 'all-is-lost', 'dark-night'],
  'plot-point-2': ['break-into-three'],
  climax: ['finale'],
  resolution: ['final-image'],
};
const threeActBeats = getFramework('three-act').beats.map(beat => {
  const story = screenplayBeats.filter(item => storyGroups[beat.id].includes(item.frameworkBeatId));
  return { id: `preview-${beat.id}`, frameworkBeatId: beat.id, title: beat.label, act: Number(/Act (\d)/.exec(beat.act)[1]), description: story.map(item => item.description).join(' '), sceneIds: story.flatMap(item => item.sceneIds) };
});
let doc;
export let previewSceneId;
let revision = 0;
export const previewMode = new URLSearchParams(location.search).get('mode') ?? 'classic';
const layout = {
  'scriptfx:editor-view': JSON.stringify({ leftSidebar: previewMode === 'tools', experience: false, script: true, shots: true }),
  'scriptfx-project-companions': JSON.stringify({ [projectId]: previewMode === 'ai' }),
};
function initialize() {
  if (doc) return;
  doc = sample();
  tables.set('scenes', decomposeDocument(doc).scenes.map(scene => ({ ...scene, id: scene.scene_uuid, project_id: projectId })));
  previewSceneId = tables.get('scenes')[0].scene_uuid;
  tables.set('project_settings', [{ project_id: projectId,
    element_settings: { ...ELEMENT_DEFAULTS, scene: { ...ELEMENT_DEFAULTS.scene, behavior: { ...ELEMENT_DEFAULTS.scene.behavior, startNewPage: true } } },
    structure: { frameworkId: 'three-act', assignments: {}, beats: threeActBeats },
  }]);
  tables.set('document_elements', []);
  tables.set('projects', [{ id: projectId, title: 'The Last Night', user_id: owner, owner_id: owner, created_at: now, updated_at: now, document_revision: revision, lexical_doc: doc, scene_index: [], root_project_id: projectId, writing_format: 'screenplay' }]);
  tables.set('workspace_layouts', [{ user_id: owner, layout }]);
  tables.set('profiles', [{ id: owner, display_name: 'Preview writer', full_name: 'Preview writer', role: 'user', is_admin: false }]);
}
function query(table) {
  const filters = [];
  let single = false, values = null, operation = 'select';
  const chain = new Proxy({}, { get(_target, key) {
    if (key === 'then') return (resolve, reject) => Promise.resolve().then(() => {
      initialize();
      let rows = tables.get(table) ?? [];
      const match = row => filters.every(([name, value]) => row[name] === value);
      if (values && operation === 'update') rows = rows.map(row => match(row) ? { ...row, ...values } : row);
      else if (values && operation !== 'select') {
        const inserts = (Array.isArray(values) ? values : [values]).map(row => ({ id: crypto.randomUUID(), ...row }));
        if (operation === 'upsert' && rows.length) rows = rows.map(row => ({ ...row, ...inserts[0] }));
        else rows = [...rows, ...inserts];
      }
      if (operation === 'delete') rows = rows.filter(row => !match(row));
      tables.set(table, rows);
      const found = rows.filter(match);
      return { data: single ? found[0] ?? null : found, error: null, count: found.length };
    }).then(resolve, reject);
    if (key === 'eq') return (name, value) => { filters.push([name, value]); return chain; };
    if (key === 'single' || key === 'maybeSingle') return () => { single = true; return chain; };
    if (['insert', 'upsert', 'update'].includes(key)) return data => { values = data; operation = key; return chain; };
    if (key === 'delete') return () => { operation = 'delete'; return chain; };
    return () => chain;
  } });
  return chain;
}
const channel = { on: () => channel, subscribe: () => channel, unsubscribe: async () => {}, send: async () => 'ok', track: async () => 'ok', presenceState: () => ({}) };
export const supabase = {
  from: query,
  auth: { getSession: async () => ({ data: { session }, error: null }), getUser: async () => ({ data: { user }, error: null }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }), signOut: async () => ({ error: null }) },
  channel: () => channel,
  removeChannel: async () => {},
  removeAllChannels: async () => {},
  rpc: async name => {
    initialize();
    if (name === 'load_screenplay') return { data: { project: { ...tables.get('projects')[0], lexical_doc: doc, document_revision: revision }, scenes: tables.get('scenes'), elements: tables.get('document_elements') }, error: null };
    return { data: null, error: null };
  },
  functions: { invoke: async () => ({ data: null, error: new Error('This action needs a ScriptFX account.') }) },
  storage: { from: () => ({ getPublicUrl: () => ({ data: { publicUrl: '' } }), createSignedUrl: async () => ({ data: null, error: null }) }) },
};
const reply = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } });
export function installPreviewData() {
  initialize();
  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (input, options = {}) => {
    const url = new URL(typeof input === 'string' ? input : input.url ?? String(input), location.origin);
    if (!url.pathname.startsWith('/api/')) {
      if (url.origin === location.origin) return nativeFetch(input, options);
      return reply({ error: 'External services are unavailable in the public preview.' }, 403);
    }
    const path = url.pathname;
    if (path.includes('movie-versions') && options.method && options.method !== 'GET') return reply({ error: 'Sign in to manage project drafts.' }, 403);
    if (path.includes('movie-versions')) return reply({ activeId: draftId, versions: [{ id: draftId, number: 1, label: 'Draft 1', project_id: projectId, archived: false }] });
    if (path.includes('/lexical/save-scenes/')) {
      const body = JSON.parse(options.body || '{}');
      const previous = new Map(tables.get('scenes').map(scene => [scene.scene_uuid, scene]));
      const rows = body.scenes.map(scene => ({ ...previous.get(scene.scene_uuid), ...scene, id: scene.scene_uuid, project_id: projectId }));
      tables.set('scenes', rows); tables.set('document_elements', body.elements ?? []);
      doc = composeDocument(rows, body.elements ?? []); revision++;
      return reply({ revision, updated_at: new Date().toISOString() });
    }
    if (path.includes('screenplay') && options.method && options.method !== 'GET') {
      const body = JSON.parse(options.body || '{}'); doc = body.lexical_doc ?? body.content ?? doc; revision++;
      return reply({ revision, document_revision: revision, projectId, updated_at: new Date().toISOString() });
    }
    if (path.includes('usage') || path.includes('balance')) return reply({ balance: 0, remaining: 0 });
    if (path.includes('activity')) return reply({ jobs: [], items: [], activities: [], unreadCount: 0 });
    return reply({ error: 'Sign in to use this service. The editor preview works locally.' }, 403);
  };
  localStorage.setItem('app-theme', 'light');
  localStorage.setItem('scriptfx-zoom', '100');
  localStorage.setItem(`scriptfx:workspace-layout:${owner}`, JSON.stringify({ values: layout, dirty: false }));
}
