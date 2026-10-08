// Builds the installable <rain-on-glass> element from the standalone page, so the page stays the
// single source of truth. Every transform asserts that it matched: if the page changes shape, the
// build stops with a message instead of shipping a quietly broken element.
//
// Output: dist/rain-on-glass.js (minified, self-registering ES module) and dist/rain-on-glass.d.ts.
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const pkg = JSON.parse(await readFile(new URL('./package.json', import.meta.url), 'utf8'));
const html = await readFile(new URL('../../rain-on-glass/index.html', import.meta.url), 'utf8');

const YEAR = 2026;
const CREDITS = `Rain on Glass by ${pkg.author} · © ${YEAR} · ${pkg.name} v${pkg.version}`;
const BANNER = `/*! ${pkg.name} v${pkg.version} · Rain on Glass · © ${YEAR} ${pkg.author}. All rights reserved. Use is licensed under the terms in LICENSE; copying, modifying or redistributing this file is not permitted. */`;

const fail = (what) => { throw new Error(`build: couldn't find ${what} in rain-on-glass/index.html. Has the page changed shape?`); };
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
css = swap(css, /body \{ margin: 0; background: var\(--night\); color: var\(--ink\); overflow: hidden; font-family: var\(--mono\); \}/,
  ':host { display: block; position: relative; width: 100%; aspect-ratio: 16 / 10; overflow: hidden; contain: content; background: var(--night); color: var(--ink); font-family: var(--mono); }',
  'the body rule');
css = swap(css, /position: fixed;/g, 'position: absolute;', 'fixed positioning', 3);
css = swap(css, /100vw/g, '100%', 'viewport widths', 1);
css += `
:host(:not([controls])) .tray { display: none; }
.tray { max-height: calc(100% - 32px); overflow: auto; }
.credit { margin: 0; color: var(--dim); opacity: 0.7; font-size: 10px; }
`;
css = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{};,])\s*/g, '$1').replace(/:\s+/g, ':').trim();

// ---------- markup ----------
let markup = pick(/<body>([\s\S]*?)<script>/, 'the markup').trim();
// the page's default video ships beside the page, not in the package: the element starts on the painted views
markup = swap(markup, /<option value="video"[^>]*>[^<]*<\/option>/, '', 'the video view option');
markup = swap(markup, /(<p class="note">[\s\S]*?<\/p>)/, `$1\n    <p class="credit">Rain on Glass by ${pkg.author} · © ${YEAR}</p>`, 'the note');

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
const newAudioContext = () => (__env.audio = new (window.AudioContext || window.webkitAudioContext)());
const onTeardown = (fn) => __env.teardown.push(fn);
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
script = swap(script, /`(#version 300 es[\s\S]*?)`/g, (_, s) => '`' + minifyGLSL(s) + '`', 'shaders', 7);

const ATTRS = { rainfall: 'rain', condensation: 'mist', refraction: 'refract', fog: 'fog', humidity: 'humid' };
// where each slider starts on the page, so removing an attribute puts it back there
const START = Function(`return (${pick(/const START = (\{[^}]*\});/, 'the slider START values')})`)();

const element = `
const CREDITS = ${JSON.stringify(CREDITS)};
const CSS = ${JSON.stringify(css)};
const MARKUP = ${JSON.stringify(`<!-- ${CREDITS} -->\n` + markup)};
const SLIDERS = ${JSON.stringify(ATTRS)};
const START = ${JSON.stringify(START)};

function engine(__env) {
${script}
}

// "0.4" and "40%" both mean 40% of the slider.
const level = (v) => {
  const n = parseFloat(v);
  if (!Number.isFinite(n)) return null;
  return Math.min(1, Math.max(0, String(v).trim().endsWith('%') || n > 1 ? n / 100 : n));
};

class RainOnGlass extends HTMLElement {
  static credits = CREDITS;
  static observedAttributes = [...Object.keys(SLIDERS), 'scene', 'src', 'sound', 'paused'];
  #root = this.attachShadow({ mode: 'closed' });
  #env = null;
  #ro = null;

  get credits() { return CREDITS; }

  connectedCallback() {
    if (this.#env) return;
    this.#root.innerHTML = '<style>' + CSS + '</style>' + MARKUP;
    const box = this.getBoundingClientRect();
    const env = this.#env = { root: this.#root, host: this, w: box.width, h: box.height, teardown: [], stopped: false, frameId: 0, audio: null };
    this.#ro = new ResizeObserver(([e]) => { env.w = e.contentRect.width; env.h = e.contentRect.height; });
    this.#ro.observe(this);
    engine(env);
    if (!this.hasAttribute('sound')) this.#click('sound');   // the page plays sound by default; an embed stays quiet unless asked
    for (const name of RainOnGlass.observedAttributes) if (name !== 'sound' && this.hasAttribute(name)) this.#apply(name);
  }

  disconnectedCallback() {
    const env = this.#env;
    if (!env) return;
    env.stopped = true;
    cancelAnimationFrame(env.frameId);
    for (const fn of env.teardown) { try { fn(); } catch (_) {} }
    this.#ro.disconnect();
    env.audio?.close().catch(() => {});
    this.#root.getElementById('glass')?.getContext('webgl2')?.getExtension('WEBGL_lose_context')?.loseContext();
    this.#root.innerHTML = '';
    this.#env = null;
  }

  attributeChangedCallback(name) { if (this.#env) this.#apply(name); }

  /** Clears the glass, as the Wipe glass button does. */
  wipe() { this.#click('wipe'); }

  #el(id) { return this.#root.getElementById(id); }
  #click(id) { this.#el(id)?.click(); }

  #apply(name) {
    const v = this.getAttribute(name);
    if (name in SLIDERS) {
      const input = this.#el(SLIDERS[name]), n = level(v ?? String(START[SLIDERS[name]]));
      if (input && n !== null) { input.value = n; input.dispatchEvent(new Event('input')); }
    } else if (name === 'scene') {
      const select = this.#el('scene');
      if (select && [...select.options].some((o) => o.value === v)) { select.value = v; select.dispatchEvent(new Event('change')); }
    } else if (name === 'src') {
      if (!v) { this.#el('scene')?.dispatchEvent(new Event('change')); return; }
      fetch(v).then((r) => r.blob()).then((blob) => {
        if (this.getAttribute('src') !== v || !this.#env) return;
        const dt = new DataTransfer();
        dt.items.add(new File([blob], 'background', { type: blob.type }));
        const input = this.#el('photo');
        input.files = dt.files; input.dispatchEvent(new Event('change'));
      }).catch(() => {});
    } else if (name === 'sound') {
      const on = this.#el('sound')?.getAttribute('aria-pressed') === 'true';
      if (on !== this.hasAttribute('sound')) this.#click('sound');
    } else if (name === 'paused') {
      const paused = this.#el('pause')?.textContent === 'Resume';
      if (paused !== this.hasAttribute('paused')) this.#click('pause');
    }
  }
}

if (!customElements.get('rain-on-glass')) customElements.define('rain-on-glass', RainOnGlass);
export { RainOnGlass, CREDITS as credits };
export default RainOnGlass;
`;

await rm(new URL('./dist/', import.meta.url), { recursive: true, force: true });
await mkdir(new URL('./dist/', import.meta.url), { recursive: true });
await build({
  stdin: { contents: element, loader: 'js', sourcefile: 'rain-on-glass.js' },
  outfile: fileURLToPath(new URL('./dist/rain-on-glass.js', import.meta.url)),
  format: 'esm', target: 'es2022', minify: true, legalComments: 'none',
  banner: { js: BANNER },
});

await writeFile(new URL('./dist/rain-on-glass.d.ts', import.meta.url), `${BANNER}
export declare const credits: string;
export declare class RainOnGlass extends HTMLElement {
  /** Who made this: name, year and package version. */
  static readonly credits: string;
  readonly credits: string;
  /** Clears the glass, as the Wipe glass button does. */
  wipe(): void;
}
export default RainOnGlass;
declare global {
  interface HTMLElementTagNameMap { 'rain-on-glass': RainOnGlass; }
}
`);

const { size } = await import('node:fs').then((fs) => fs.promises.stat(new URL('./dist/rain-on-glass.js', import.meta.url)));
console.log(`built dist/rain-on-glass.js (${(size / 1024).toFixed(1)} KB) · ${CREDITS}`);
