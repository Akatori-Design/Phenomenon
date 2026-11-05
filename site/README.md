# Phenomenon — website

The site for Phenomenon by Hiro · Akatori Design, published at
https://akatori-design.github.io/Phenomenon/. Every page is just a piece, full screen, with its
name lettered vertically on the right. Tap the name and the other pages slide out beside it.

| Page | Name | What it is |
| --- | --- | --- |
| `/` | 木漏れ日 komorebi | the landing page: the Komorebi wall, live, and nothing else |
| `/works/komorebi-wall/` | 木漏れ日 komorebi | Komorebi Wall, with its rustling sound |
| `/works/rain-on-glass/` | 雨の日 rainy day | Rain on Glass |
| `/works/attic-light/` | 屋根裏 attic | Attic Light |
| imhiro.xyz | ひろの部屋 hiro's room | link out |

```
index.html                 the landing page
assets/komorebi.js         the Komorebi Wall effect, scoped to the landing page
assets/side.js             the vertical name and its menu, shared by every page
assets/img/komorebi-wall.jpg   still shown if the browser has no WebGL 2
works/<piece>/index.html   the pieces, copied from the folders at the root of this repo
```

## The side menu

Each page adds it with one line at the end of `<body>`:

```html
<script src="../../assets/side.js?v=4" data-current="rain-on-glass" data-theme="dark"></script>
```

`data-current` picks the page's own name; the menu lists the others. `data-theme="dark"` draws the
lettering as pale light for dark pieces; the default multiplies it onto light ones like paint.
The names, glosses and links are in the `PIECES` list at the top of `side.js`. Bump the `?v=` on
every page when `side.js` or `komorebi.js` changes, so browsers fetch the new copy.

## How the site's pieces differ from the originals

None of the pages show a control tray; each runs at fixed settings.

- **Komorebi Wall**: breeze 43%, gusts 34%, shade depth 31%, olive tree. On the landing page the
  effect runs from `assets/komorebi.js`, derived from `komorebi-wall/index.html` with the same
  section order. Tapping the wall sends a gust; the leaves rustle once the page has been tapped.
- **Komorebi Wall** (`works/komorebi-wall/`): the piece itself, tray hidden, at the same settings.
- **Rain on Glass**: the rain is on the outside of the pane and the condensation on the inside.
  - Outside: the street (a 4K upscale of the original clip, played at 1.5×; 1080p on phones),
    the raindrops and their streams. Running drops strew tiny drops that last about a minute, and
    their trails stay on the glass after they leave the pane.
  - Inside: a fog with a fine grain of micro-droplets lies over all of it. The rain never clears
    it; it comes back about ten seconds after a wipe.
  - Wiping: it is the fingertip pads that wipe; the rest of the finger barely touches. They clear
    the fog, leave a thin, quickly drying streaky film, and leave drops behind (in the fingertips'
    tracks and along both edges of the band). The water they gather rides their leading edge as
    thin lines shaped like the fingertips, staying where the wipe stops; past what it can hold,
    it drips. Wiping over earlier water pushes it together. All of it stays as the fog returns,
    evaporating only over minutes, and the raindrops outside are never touched.
  - Drips run down the inside, clearing a narrow track through the fog and leaving tiny drops.
  - The drops knock a little softer: the knock resonance is 1.3–2.3 kHz, the click is quieter, and
    everything above 5 kHz is rolled off.
  - The view holds still under the pointer, and the street video is retried twice before falling
    back to the painted dusk street.
- **Attic Light**: unchanged apart from the menu.

## Running locally

Serve this folder over http, since Rain on Glass reads its street video into WebGL, and that
doesn't work from `file://`:

```bash
ruby -run -e httpd . -p 8000
```

Then open `http://localhost:8000/`.

## Publishing

`.github/workflows/pages.yml` at the root of the repo publishes this folder to GitHub Pages on
every push to `main` that touches `site/`.

© 2026 Hiro · Akatori Design. All rights reserved.
