/*! Phenomenon · side menu · © 2026 Hiro · Akatori Design. All rights reserved. */
// The page's name, lettered vertically on the right of the piece. Tap it and the other pieces slide
// out beside it, column by column, reading right to left.
//
//   <script src="assets/side.js" data-current="komorebi-wall"></script>                  (light wall)
//   <script src="../../assets/side.js" data-current="rain-on-glass" data-theme="dark"></script>
//
// On a light piece the lettering multiplies with the picture, like paint on plaster; on a dark one
// it is drawn as pale light. Every pointer event outside the name and its links passes to the piece.
(() => {
'use strict';
const me = document.currentScript;
const root = new URL('../', me.src);   // this file lives in <site>/assets/
const PIECES = [
  { id: 'komorebi-wall', ja: '木漏れ日', en: 'komorebi', href: new URL('works/komorebi-wall/', root).href },
  { id: 'rain-on-glass', ja: '雨の日', en: 'rainy day', href: new URL('works/rain-on-glass/', root).href },
  { id: 'attic-light', ja: '屋根裏', en: 'attic', href: new URL('works/attic-light/', root).href },
  { id: 'hiro', ja: 'ひろの部屋', en: "hiro's room", href: 'https://imhiro.xyz/' },
];
const current = PIECES.find((p) => p.id === me.dataset.current) || PIECES[0];
const theme = me.dataset.theme === 'dark' ? 'dark' : 'light';

// fonts: Geist Mono for the glosses, and only the kanji the names use from Shippori Mincho
const glyphs = encodeURIComponent([...new Set(PIECES.map((p) => p.ja).join(''))].join(''));
for (const href of [
  'https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400&display=swap',
  `https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500&text=${glyphs}&display=swap`,
]) {
  if (document.querySelector(`link[href="${href}"]`)) continue;
  const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; document.head.appendChild(l);
}

const css = document.createElement('style');
css.textContent = `
.side {
  --side-ink: #575e4e; --side-hi: #22261f; --side-dim: #5f655a; --side-line: rgba(34, 38, 31, 0.22); --side-accent: #56694a;
  --side-gap: clamp(18px, 2.4vw, 32px); --side-ease: cubic-bezier(0.22, 0.61, 0.36, 1);
  position: fixed; z-index: 10;
  top: calc(env(safe-area-inset-top, 0px) + clamp(40px, 10vh, 112px));
  right: calc(env(safe-area-inset-right, 0px) + clamp(16px, 4vw, 48px));
  display: flex; flex-direction: row-reverse; align-items: flex-start;
  mix-blend-mode: multiply; pointer-events: none;
  animation: side-in 1.4s var(--side-ease) 0.6s both;
}
.side[data-theme="dark"] {
  --side-ink: #efebe3; --side-hi: #ffffff; --side-dim: rgba(239, 235, 227, 0.78);
  --side-line: rgba(239, 235, 227, 0.4); --side-accent: #ffffff;
  mix-blend-mode: normal;
  text-shadow: 0 0 14px rgba(8, 10, 14, 0.55), 0 0 3px rgba(8, 10, 14, 0.35);   /* holds over bright patches of the picture */
}
@keyframes side-in { from { opacity: 0; } }
.side .name {
  display: block; writing-mode: vertical-rl; margin: 0; padding: 0;
  font: 500 var(--size)/1 "Shippori Mincho", "Hiragino Mincho ProN", "Yu Mincho", serif;
  letter-spacing: 0.32em; color: var(--side-ink); text-decoration: none; transition: color 0.3s;
}
.side .name small {
  display: block; margin-inline-start: 0.9em; margin-block-start: calc(var(--size) * 0.3);
  font: 400 11px/1 "Geist Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  letter-spacing: 0.18em; text-transform: lowercase; color: var(--side-dim); transition: color 0.3s;
}
.side .name:focus-visible { outline: 2px solid var(--side-accent); outline-offset: 6px; }
.side-toggle {
  --size: clamp(28px, 3.4vw, 46px);
  appearance: none; border: 0; background: none; cursor: pointer; pointer-events: auto;
  -webkit-tap-highlight-color: transparent;
}
.side-toggle:hover, .side-toggle[aria-expanded="true"] { color: var(--side-hi); }
.side-pieces {
  position: relative; list-style: none; margin: 0 var(--side-gap) 0 0; padding: 0 var(--side-gap) 0 0;
  display: flex; flex-direction: row-reverse; gap: var(--side-gap);
  visibility: hidden; transition: visibility 0s linear 0.6s;
}
.side-pieces::after {   /* a hairline drops between the name and the pieces as they open */
  content: ""; position: absolute; top: 0.2em; right: 0; width: 1px; height: calc(100% - 0.2em);
  background: var(--side-line); transform: scaleY(0); transform-origin: top; transition: transform 0.5s var(--side-ease);
}
.side-pieces li { opacity: 0; transform: translateX(14px); transition: opacity 0.45s var(--side-ease), transform 0.6s var(--side-ease); }
.side-pieces .name { --size: clamp(23px, 2.7vw, 37px); pointer-events: auto; }
.side-pieces .name:hover, .side-pieces .name:focus-visible { color: var(--side-hi); }
.side-pieces .name:hover small, .side-pieces .name:focus-visible small { color: var(--side-accent); }
.side.open .side-pieces { visibility: visible; transition-delay: 0s; }
.side.open .side-pieces::after { transform: scaleY(1); }
.side.open .side-pieces li { opacity: 1; transform: none; }
.side.open .side-pieces li:nth-child(1) { transition-delay: 0.08s; }
.side.open .side-pieces li:nth-child(2) { transition-delay: 0.18s; }
.side.open .side-pieces li:nth-child(3) { transition-delay: 0.28s; }
@media (prefers-reduced-motion: reduce) {
  .side { animation: none; }
  .side-pieces::after, .side-pieces li { transition: none; }
}`;
document.head.appendChild(css);

const name = (tag, p) => {
  const el = document.createElement(tag);
  el.className = 'name'; el.lang = 'ja'; el.textContent = p.ja;
  const s = document.createElement('small'); s.lang = 'en'; s.textContent = p.en;
  el.appendChild(s);
  return el;
};
const nav = document.createElement('nav');
nav.className = 'side'; nav.dataset.theme = theme; nav.setAttribute('aria-label', 'Pieces');
const toggle = name('button', current);
toggle.classList.add('side-toggle'); toggle.type = 'button';
toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-controls', 'side-pieces');
const list = document.createElement('ul');
list.className = 'side-pieces'; list.id = 'side-pieces';
for (const p of PIECES) {
  if (p === current) continue;
  const a = name('a', p); a.href = p.href;
  const li = document.createElement('li'); li.appendChild(a); list.appendChild(li);
}
nav.append(toggle, list);
document.body.appendChild(nav);

const isOpen = () => nav.classList.contains('open');
const setOpen = (open) => { nav.classList.toggle('open', open); toggle.setAttribute('aria-expanded', String(open)); };
toggle.addEventListener('click', () => setOpen(!isOpen()));
// a tap anywhere else closes it again (and still reaches the piece); so does Escape
addEventListener('pointerdown', (e) => { if (isOpen() && !nav.contains(e.target)) setOpen(false); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen()) { setOpen(false); toggle.focus(); } });
addEventListener('pageshow', () => setOpen(false));   // coming back to a page, the menu is shown closed
})();
