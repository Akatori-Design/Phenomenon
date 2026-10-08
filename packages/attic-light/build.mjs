// Builds the installable <attic-light> element from the standalone page, so the page stays the
// single source of truth. Every transform asserts that it matched: if the page changes shape, the
// build stops with a message instead of shipping a quietly broken element.
//
// Output: dist/attic-light.js (minified, self-registering ES module) and dist/attic-light.d.ts.
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const pkg = JSON.parse(await readFile(new URL('./package.json', import.meta.url), 'utf8'));
const html = await readFile(new URL('../../attic-light/index.html', import.meta.url), 'utf8');

const YEAR = 2026;
const CREDITS = `Attic Light by ${pkg.author} · © ${YEAR} · ${pkg.name} v${pkg.version}`;
const BANNER = `/*! ${pkg.name} v${pkg.version} · Attic Light · © ${YEAR} ${pkg.author}. All rights reserved. Use is licensed under the terms in LICENSE; copying, modifying or redistributing this file is not permitted. */`;

const fail = (what) => { throw new Error(`build: couldn't find ${what} in attic-light/index.html. Has the page changed shape?`); };
const pick = (re, what) => html.match(re)?.[1] ?? fail(what);
// Replace exactly `count` matches, or stop the build.
const swap = (src, re, to, what, count = 1) => {
  const n = (src.match(new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g')) || []).length;
  if (n !== count) throw new Error(`build: expected ${count} match(es) for ${what}, found ${n}`);
  return src.replace(re, to);
};

// ---------- styles: page-wide rules become rules for the element ----------
let css = pick(/<style>([\s\S]*?)<\/style>/, 'the <style> block');
css = swap(css, /:root \{/, ':host {', ':root');
css = swap(css, /html, body \{ height: 100%; \}\n/, '', 'the html, body rule');
css = swap(css, /body \{ background: var\(--bg\); overflow: hidden; font-family: ([^}]*); \}/,
  ':host { display: block; position: relative; width: 100%; aspect-ratio: 16 / 10; overflow: hidden; contain: content; background: var(--bg); font-family: $1; }',
  'the body rule');
css = swap(css, /position: fixed;/g, 'position: absolute;', 'fixed positioning', 2);
// The page has no on-screen controls; the element adds a small tray, shown only with the controls attribute.
css += `
:host(:not([controls])) .tray { display: none; }
.tray { position: absolute; right: 12px; bottom: 12px; width: min(240px, calc(100% - 24px)); max-height: calc(100% - 24px); overflow: auto;
  box-sizing: border-box; padding: 10px 12px; border-radius: 10px; background: rgba(12, 9, 6, 0.72); border: 1px solid rgba(236, 220, 198, 0.14);
  color: #ecdcc6; font-size: 11px; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
.tray summary { cursor: pointer; letter-spacing: 0.08em; text-transform: uppercase; font-size: 10px; color: var(--muted); }
.tray[open] summary { margin-bottom: 8px; }
.rows { display: grid; gap: 8px; }
.rows label { display: grid; gap: 4px; }
.rows input[type="range"] { width: 100%; margin: 0; accent-color: #f2b974; }
.buttons { display: flex; gap: 6px; }
.buttons button { flex: 1; font: inherit; color: inherit; background: rgba(236, 220, 198, 0.08); border: 1px solid rgba(236, 220, 198, 0.16); border-radius: 999px; padding: 6px 8px; cursor: pointer; }
.buttons button:hover { border-color: #f2b974; color: #f2b974; }
.tray :focus-visible { outline: 2px solid #f2b974; outline-offset: 2px; }
.credit { margin: 0; color: var(--muted); opacity: 0.8; font-size: 10px; }
`;
css = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{};,])\s*/g, '$1').replace(/:\s+/g, ':').trim();

// ---------- markup ----------
let markup = pick(/<body>([\s\S]*?)<script>/, 'the markup').trim();
markup = swap(markup, /(<canvas id="c"[^>]*><\/canvas>)/, `$1
<details class="tray" id="tray" open>
  <summary>Attic Light</summary>
  <div class="rows">
    <label for="dust">Dust<input type="range" id="dust" min="0" max="1" step="0.01"></label>
    <label for="sunlight">Sunlight<input type="range" id="sunlight" min="0" max="1" step="0.01"></label>
    <label for="haze">Haze<input type="range" id="haze" min="0" max="1" step="0.01"></label>
    <div class="buttons"><button type="button" id="pause">Pause</button><button type="button" id="reset">Reset dust</button></div>
    <p class="credit">Attic Light by ${pkg.author} · © ${YEAR}</p>
  </div>
</details>`, 'the canvas');

// ---------- script ----------
let script = pick(/<script>\s*\(\(\) => \{([\s\S]*)\}\)\(\);\s*<\/script>/, 'the script');
// The page talks to window and document; the element talks only to itself.
script = swap(script, /\/\/ ---------- host ----------[\s\S]*?\/\/ ---------- end host ----------/, `
const $ = (id) => __env.root.getElementById(id);
const viewW = () => __env.w, viewH = () => __env.h;
const localX = (e) => e.clientX - __env.host.getBoundingClientRect().left;
const localY = (e) => e.clientY - __env.host.getBoundingClientRect().top;
const onPage = (type, fn, opts) => {
  if (type === 'resize') return;   // the frame loop already follows the element's size
  __env.host.addEventListener(type, fn, opts);
  __env.teardown.push(() => __env.host.removeEventListener(type, fn, opts));
};
const nextFrame = (fn) => { if (!__env.stopped) __env.frameId = requestAnimationFrame(fn); };
const smallScreen = () => Math.min(innerWidth, innerHeight) < 600;
const onTeardown = (fn) => __env.teardown.push(fn);
const expose = (api) => { __env.api = api; };
`, 'the host block');

// Shaders ship as text to the GPU; strip their comments and whitespace so they read as little as possible.
const minifyGLSL = (src) => {
  if (src.includes('\\')) throw new Error('build: shader uses a line continuation; minifyGLSL does not handle it');
  let out = '';
  for (let line of src.replace(/\/\*[\s\S]*?\*\//g, '').split('\n')) {
    line = line.replace(/\/\/.*$/, '').trim().replace(/\s+/g, ' ');
    if (!line) continue;
    if (line.startsWith('#')) { out += (out && !out.endsWith('\n') ? '\n' : '') + line + '\n'; continue; }
    out += line.replace(/\s*([{}();,=*/<>!?:&|[\]])\s*/g, '$1') + ' ';   // never + or -: "a - -b" must not become "a--b"
  }
  return out.trim();
};
script = swap(script, /`(#version 300 es[\s\S]*?)`/g, (_, s) => '`' + minifyGLSL(s) + '`', 'shaders', 6);
script = swap(script, /const (BEAM|NOISE) = `([\s\S]*?)`;/g, (_, name, s) => `const ${name} = \`${minifyGLSL(s)}\`;`, 'shared shader code', 2);

// attribute -> default level (0-1). Dust is the share of specks; the others put the tuned look at 50%.
const LEVELS = { dust: 1, sunlight: 0.5, haze: 0.5 };

const element = `
const CREDITS = ${JSON.stringify(CREDITS)};
const CSS = ${JSON.stringify(css)};
const MARKUP = ${JSON.stringify(`<!-- ${CREDITS} -->\n` + markup)};
const LEVELS = ${JSON.stringify(LEVELS)};

function engine(__env) {
${script}
}

// "0.4" and "40%" both mean 40%.
const level = (v) => {
  const n = parseFloat(v);
  if (!Number.isFinite(n)) return null;
  return Math.min(1, Math.max(0, String(v).trim().endsWith('%') || n > 1 ? n / 100 : n));
};

class AtticLight extends HTMLElement {
  static credits = CREDITS;
  static observedAttributes = [...Object.keys(LEVELS), 'paused'];
  #root = this.attachShadow({ mode: 'closed' });
  #env = null;
  #ro = null;
  #paused = false;

  get credits() { return CREDITS; }

  connectedCallback() {
    if (this.#env) return;
    this.#root.innerHTML = '<style>' + CSS + '</style>' + MARKUP;
    const box = this.getBoundingClientRect();
    const env = this.#env = { root: this.#root, host: this, w: box.width, h: box.height, teardown: [], stopped: false, frameId: 0, api: null };
    this.#ro = new ResizeObserver(([e]) => { env.w = e.contentRect.width; env.h = e.contentRect.height; });
    this.#ro.observe(this);
    engine(env);
    if (!env.api) { this.#el('tray')?.remove(); return; }   // no WebGL2: the page's own message is showing
    for (const name of Object.keys(LEVELS)) {
      const input = this.#el(name);
      input.addEventListener('input', () => env.api[name](+input.value));
    }
    this.#el('pause').addEventListener('click', () => this.#pause(!this.#paused));
    this.#el('reset').addEventListener('click', () => env.api.reset());
    if (box.width < 480) this.#el('tray').open = false;   // small embeds start with the tray folded
    for (const name of AtticLight.observedAttributes) this.#apply(name);
  }

  disconnectedCallback() {
    const env = this.#env;
    if (!env) return;
    env.stopped = true;
    cancelAnimationFrame(env.frameId);
    for (const fn of env.teardown) { try { fn(); } catch (_) {} }
    this.#ro.disconnect();
    this.#root.getElementById('c')?.getContext('webgl2')?.getExtension('WEBGL_lose_context')?.loseContext();
    this.#root.innerHTML = '';
    this.#env = null;
  }

  attributeChangedCallback(name) { if (this.#env) this.#apply(name); }

  /** Puts the starting dust back in the air, as the Reset dust button does. */
  reset() { this.#env?.api?.reset(); }

  #el(id) { return this.#root.getElementById(id); }

  #pause(on) {
    this.#paused = on;
    this.#env.api.paused(on);
    this.#el('pause').textContent = on ? 'Resume' : 'Pause';
  }

  #apply(name) {
    if (!this.#env?.api) return;
    if (name === 'paused') { this.#pause(this.hasAttribute('paused')); return; }
    const v = this.getAttribute(name), n = (v === null ? null : level(v)) ?? LEVELS[name];
    this.#env.api[name](n);
    this.#el(name).value = n;
  }
}

if (!customElements.get('attic-light')) customElements.define('attic-light', AtticLight);
export { AtticLight, CREDITS as credits };
export default AtticLight;
`;

await rm(new URL('./dist/', import.meta.url), { recursive: true, force: true });
await mkdir(new URL('./dist/', import.meta.url), { recursive: true });
await build({
  stdin: { contents: element, loader: 'js', sourcefile: 'attic-light.js' },
  outfile: fileURLToPath(new URL('./dist/attic-light.js', import.meta.url)),
  format: 'esm', target: 'es2022', minify: true, legalComments: 'none',
  banner: { js: BANNER },
});

await writeFile(new URL('./dist/attic-light.d.ts', import.meta.url), `${BANNER}
export declare const credits: string;
export declare class AtticLight extends HTMLElement {
  /** Who made this: name, year and package version. */
  static readonly credits: string;
  readonly credits: string;
  /** Puts the starting dust back in the air, as the Reset dust button does. */
  reset(): void;
}
export default AtticLight;
declare global {
  interface HTMLElementTagNameMap { 'attic-light': AtticLight; }
}
`);

const { size } = await import('node:fs').then((fs) => fs.promises.stat(new URL('./dist/attic-light.js', import.meta.url)));
console.log(`built dist/attic-light.js (${(size / 1024).toFixed(1)} KB) · ${CREDITS}`);
