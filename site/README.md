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
| `/works/senko/` | 線香 incense | Senko: a stick of incense burning, and its smoke |
| imhiro.xyz | ひろの部屋 hiro's room | link out |

```
index.html                 the landing page
assets/komorebi.js         the Komorebi Wall effect, scoped to the landing page
assets/side.js             the vertical name and its menu, shared by every page
assets/img/komorebi-wall.jpg   still shown if the browser has no WebGL 2
works/<piece>/index.html   the pieces, copied from the folders at the root of this repo
works/senko/index.html     Senko, which so far lives only here
```

## The side menu

Each page adds it with one line at the end of `<body>`:

```html
<script src="../../assets/side.js?v=5" data-current="rain-on-glass" data-theme="dark"></script>
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
  - Outside: an autumn meadow in the rain (`meadow.mp4`, a ten-second clip looped by crossfading
    two copies; `meadow-phone.mp4` on phones). Its first frame, `meadow.jpg`, shows while the clip
    loads, and stays for reduced motion. The near branches sway and bounce in the wind and rain;
    the far trees barely move. The raindrops and their streams are on the outside of the pane.
    - Half the drops come in at a slant and skid as they land, leaving a line of tiny beads above
      the drop, tilted up to 10° either way.
    - A drop starts to run once it is as big as the 95th percentile of the drops resting on the
      pane, never smaller than a set floor. Runners are fast and leave small beads along their
      track at an uneven spacing. The beads stay until there are too many, then the oldest dry away.
    - Running water (runners and streams) goes straight down unless something resists it to one
      side: grime holds it back and turns it toward cleaner glass, wet tracks draw it in, and gusts
      push the outside drops a little.
    - Against the bright sky a drop reads darker: its rim is dark, and the lens shows the ground
      below, flipped.
  - Inside: a fog of beaded condensation and fine micro-droplets lies over all of it and blurs the
    view. The rain never clears it; it creeps back slowly after a wipe. Now and then a small drop of
    condensation forms on it. A warm lamp in the room lights the glass from the upper left.
    The page opens on a fog already dotted with fine drops, with drips that have been running down
    the inside a while (some far, some only just), each with its clear track and line of beads. The
    fog starts lighter (80% of its setting) and thickens over the first few minutes.
  - The room behind the viewer is mirrored faintly in the glass: a modern home office with its
    lights on (`room.jpg`, a photograph generated with Higgsfield). Through the fog it shows only as
    soft glows of its lights and screens; on wiped glass it is clearer. Soft streaks of glare rake
    down the glass, and the warm pendant up to the left flares in a halo.
  - Wiping: a slow or short wipe is one fingertip on the glass (a thumb's on phones), a short rounded
    pad. Sweeping fast for a second and a half brings the hand down: three fingers lie flat on the
    glass and wipe a broad band, and as the hand slows it lifts back to one fingertip. Only the first
    touch wipes.
    Wiping clears the fog, leaves a thin, quickly drying streaky film, and scatters drops across the
    band, with ridges along both its edges. The water it gathers rides its leading edge as a thin line
    shaped like the fingertips, staying where the wipe stops; past what it can hold, it drips, and
    often: drops run down from the band and from where a wipe stops, bigger the more fog the wipe has
    gathered. Wiping over earlier water pushes it together. All of it stays as the fog returns,
    evaporating only over minutes, and the raindrops outside are never touched.
  - Drips run down the inside, clearing a narrow track through the fog. Each leaves a line of beads
    behind it, largest at the bottom. They run straight down, bending only where grime to one side
    turns them.
  - The drops land gently: a soft knock (resonance 1.3–2.3 kHz) with a slow-ish attack, hardly any
    click, everything above 5 kHz rolled off, only a few knocks a second, and all of them quiet.
  - The view holds still under the pointer.
  - Wiping is silent: the swish and squeaks of the fingers are held at zero.
  - Opened with `?quiet`, the page makes no sound at all; imhiro.xyz uses it for the corner peeled
    back from its page. The page that embeds it can also quiet it at once by posting it the message
    `"phenomenon:quiet"`, as imhiro.xyz does when it closes the full view.
  - Kept light: the out-of-focus view is blurred once per video frame into a small texture, the drop
    shading runs only where there is water, the video is uploaded straight to the GPU, and the
    picture is drawn at up to ~2.4 megapixels (the water maps at ~2), at no more than 1.5x on a
    phone, stepping down if frames run slow. It draws at most 60 frames a second, skipping the
    frames between on a 90 or 120 Hz screen.
- **Attic Light**: unchanged apart from the menu.
- **Senko** (線香): new, and only on the site. A stick of Japanese incense stands tilted in a clay
  pebble on a ceramic dish, on a stone table, in a pool of lamplight. Behind it is a dark wall of
  warm umber plaster, lit only by the lamp's spill.
  - The scene is drawn in code. The table, dish and pebble are ray-marched once through a thin
    lens (96 passes summed over the first second and a half), so the plane of the stick is sharp
    and the table falls out of focus. The stick, its shadow, the ember and the ash are drawn over
    that every frame.
  - The smoke is a fluid simulation of the air in the plane of the stick: warm air rises, the flow
    is kept incompressible by a pressure solve, and air has its real viscosity (0.15 cm²/s), which
    is what keeps the thread smooth as it leaves the ember. The room drifts faintly and has small
    slow eddies, stillest near the table, so the thread sways and folds over higher up.
  - The smoke itself is 24 threads of tracer points carried by that air, with a veil between
    neighbours, as bright as the smoke is dense there. The ribbon turns as it leaves the ember, so
    it shows now edge-on as one bright thread, now face-on as a faint band.
  - It diffuses. Each thread widens with age and its parts drift their own ways, so the ribbon
    opens out and thins. Once a thread has spread wider than its points are apart it is drawn as
    soft round puffs, each holding the smoke that left the ember with it, so smoke that gathers is
    only denser, never a bright speck. Smoke is not timed out: it stays visible until it has spread
    too thin to see.
  - The pointer is a finger moving through the air: a small solid body about 3.5 cm across, and the
    air it meets has to move with it. That is all it does. The rest is the simulation: air is
    pushed aside and drawn in behind, and whirls roll off the sides and travel on across the pane
    by themselves. The smoke only goes where the air carries it. The air keeps its motion and
    settles over several seconds.
    Air moving across the ember makes it glow brighter and can knock the ash off early.
  - The fire is drawn inside the stick: its last few millimetres glow from deep red to
    yellow-white, with only a faint warmth in the air around them.
  - The stick burns down in about twelve minutes. The ash grows on the tip, breaks off every
    minute or so, falls, and gathers as crumbs in the dish. At the end the ember fades with a last
    wisp, and a fresh stick is set in the holder and lit.
  - It is silent. With reduced motion the room's drift is halved.
  - Kept light: the air is worked out about thirty times a second (the smoke rides it every frame)
    in 13 passes, with advection folded into the forces and two pressure steps to a pass; the smoke
    is drawn as one smooth curve per piece; and the picture is drawn at most about sixty times a
    second, so a 120 Hz screen does half the work. Uncapped, it draws about 200 frames a second at
    1440×900 on a Retina Mac. It needs WebGL 2 with float render targets.

## Running locally

Serve this folder over http, since Rain on Glass reads its meadow into WebGL, and that doesn't
work from `file://`:

```bash
ruby -run -e httpd . -p 8000
```

Then open `http://localhost:8000/`.

## Publishing

`.github/workflows/pages.yml` at the root of the repo publishes this folder to GitHub Pages on
every push to `main` that touches `site/`.

© 2026 Hiro · Akatori Design. All rights reserved.
