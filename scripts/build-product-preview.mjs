import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';

const landing = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = path.resolve(process.env.SCRIPTFX_APP_ROOT || '/Users/peterperezjr/Documents/Clients/ScriptfXV1/scriptfxv1/frontend');
const requireApp = createRequire(path.join(app, 'package.json'));
const { build } = await import(pathToFileURL(requireApp.resolve('vite')));
const { default: react } = await import(pathToFileURL(requireApp.resolve('@vitejs/plugin-react')));
const { default: tailwindcss } = await import(pathToFileURL(requireApp.resolve('@tailwindcss/vite')));
const guest = path.join(landing, 'product-preview');
const output = path.join(landing, 'public/product-preview');
const source = path.join(app, 'src');
const modules = path.join(app, 'node_modules');
const used = new Set();
await build({
  configFile: false,
  envDir: guest,
  root: guest,
  base: '/product-preview/',
  publicDir: false,
  plugins: [{
    name: 'guest-workspace-boundary',
    enforce: 'pre',
    resolveId(id, importer) {
      if (id === '@/lib/sync/live-sync' || id.replace(/\.tsx?$/, '').endsWith('/lib/sync/live-sync') || (importer && id.startsWith('.') && path.resolve(path.dirname(importer), id).replace(/\.tsx?$/, '') === path.join(source, 'lib/sync/live-sync'))) return path.join(guest, 'live-sync.js');
      if (id === '@/lib/editor/draft-recovery' || id.replace(/\.tsx?$/, '').endsWith('/lib/editor/draft-recovery') || (importer && id.startsWith('.') && path.resolve(path.dirname(importer), id).replace(/\.tsx?$/, '') === path.join(source, 'lib/editor/draft-recovery'))) return path.join(guest, 'recovery.js');
      if (importer && id.startsWith('.') && path.resolve(path.dirname(importer), id).replace(/\.tsx?$/, '') === path.join(source, 'lib/lexical/plugins/auto-focus-plugin')) return path.join(guest, 'embedded-focus.js');
      if (id === '@/lib/supabase' || id.replace(/\.tsx?$/, '').endsWith('/lib/supabase') || (importer && id.startsWith('.') && path.resolve(path.dirname(importer), id).replace(/\.tsx?$/, '') === path.join(source, 'lib/supabase'))) return path.join(guest, 'data.js');
      if (id === '@liveblocks/react') return path.join(guest, 'presence.jsx');
      if (id.startsWith('@/')) return this.resolve(path.join(source, id.slice(2)), importer, { skipSelf: true });
      if (!id.startsWith('.') && !id.startsWith('/') && !id.startsWith('\0')) {
        return this.resolve(id, path.join(app, 'src/main.tsx'), { skipSelf: true });
      }
    },
    transform(code, id) {
      if (id === path.join(guest, 'preview.css')) return code.replaceAll('__APP_SOURCE__', source);
      if (id.startsWith(source + '/')) used.add(path.relative(source, id));
      if (id.endsWith('/lib/lexical/components/screenplay-editor/screenplay-editor.tsx')) return `import { GuidedPreviewPlugin } from '${path.join(guest, 'guided-plugin.jsx')}';\n` + code.replace('<AutoFocusPlugin />', '<AutoFocusPlugin /><GuidedPreviewPlugin />');
      if (id.endsWith('/components/ui/scene-cover.tsx')) return code.replaceAll('/art/storyboard-covers/', '/product-preview/art/storyboard-covers/');

    },
  }, tailwindcss(), react()],
  resolve: { alias: [{ find: /^@\/lib\/supabase$/, replacement: path.join(guest, 'data.js') }, { find: /^@liveblocks\/react$/, replacement: path.join(guest, 'presence.jsx') }, { find: '@', replacement: source }, { find: 'react', replacement: path.join(modules, 'react') }, { find: 'react-dom', replacement: path.join(modules, 'react-dom') }, { find: /^lexical$/, replacement: path.join(modules, 'lexical/Lexical.prod.mjs') }] },
  build: { outDir: output, emptyOutDir: true, rollupOptions: { input: path.join(guest, 'index.html') } },
});
if (used.has('lib/editor/draft-recovery.ts')) throw new Error('The product preview must use its isolated recovery adapter.');
if (used.has('lib/sync/live-sync.ts')) throw new Error('The product preview must use its isolated window sync adapter.');
await mkdir(path.join(output, 'fonts'), { recursive: true });
for (const font of ['Manrope-Latin.woff2', 'Manrope-LatinExt.woff2', 'Manrope-OFL.txt', 'BDOGrotesk-Bold.woff2', 'PermanentMarker-Regular.ttf']) {
  await cp(path.join(app, 'public/fonts', font), path.join(output, 'fonts', font));
}
await cp(path.join(app, 'public/art/storyboard-covers'), path.join(output, 'art/storyboard-covers'), { recursive: true });
for (const file of await readdir(path.join(output, 'assets'))) {
  if (file.endsWith('.css')) {
    const asset = path.join(output, 'assets', file);
    await writeFile(asset, (await readFile(asset, 'utf8')).replaceAll('/fonts/', '/product-preview/fonts/'));
  }
}
await writeFile(path.join(output, 'source-manifest.json'), JSON.stringify({ source: 'ScriptFX application frontend', components: [...used].sort() }, null, 2) + '\n');
console.log(`Built the actual Write screen from ${used.size} actual app modules.`);
