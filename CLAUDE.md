# Phenomenon

Hiro's collection of interactive animations of natural phenomena, by **Hiro · Akatori Design**.
This private repo is the home for every piece: the source pages live here, and each piece can be
installed elsewhere as a private, signed web component from GitHub Packages.

- GitHub: `Akatori-Design/Phenomenon` (private). Push with the `Akatori-Design` gh account.
- The remote `phenomonon` is an older public copy. Never push to it.
- Don't commit, push, tag or publish without asking first.

## Layout

```
<piece>/index.html        the piece: one self-contained page, WebGL 2, no dependencies
<piece>/README.md         optional: how it works
packages/<piece>/         the installable <piece> element, built from <piece>/index.html
docs/<piece>.jpg          screenshot for the repo README (800×500)
.github/workflows/publish.yml   publishes a package when a <piece>@<version> tag is pushed
```

Folder names are lowercase-hyphenated and become the package name (`@akatori-design/<piece>`) and
the element tag (`<piece>`), so they must contain a hyphen. Rename before the first publish if not.

## Adding a new piece

1. Build it as `<piece>/index.html`: a single page, no external scripts, works offline when
   opened directly. Respect `prefers-reduced-motion`. Sound, if any, starts only after the
   viewer's first interaction.
2. Put every `window`/`document` access behind a host block at the top of the script, using the
   same names as `rain-on-glass/index.html`:
   `$`, `viewW`/`viewH`, `localX`/`localY`, `onPage`, `nextFrame`, `newAudioContext`, `onTeardown`,
   between `// ---------- host ----------` and `// ---------- end host ----------`.
   Doing this from the start makes packaging a small step later.
3. Add it to the root `README.md`: a section with a screenshot (`docs/<piece>.jpg`), a two-line
   description, how to interact, and links.

## Packaging a piece

1. Copy `packages/rain-on-glass/` to `packages/<piece>/`. Adapt `build.mjs` (its regexes match
   that page's markup and CSS, and every swap asserts its match count, so the build tells you
   what differs), the element's attributes, `package.json`, `LICENSE`, `README.md` and `demo.html`.
2. `package.json` must keep: `"author": "Hiro · Akatori Design"`, `"license": "SEE LICENSE IN LICENSE"`,
   `"files": ["dist", "LICENSE"]`, `publishConfig.registry` = `https://npm.pkg.github.com`, and
   `repository` pointing at this repo with `"directory": "packages/<piece>"`. The repository link
   is what keeps the package private and lets the workflow publish it.
3. Signature, in all four places: the `/*! … */` banner, the credits comment in the shadow DOM,
   the static and instance `credits` property, and a credit line in the control tray.
4. Element conventions: closed shadow root; fills its container's width at 16:10 unless sized;
   settings as attributes taking `0`–`1` or `0%`–`100%`; a `controls` attribute shows the tray;
   sound off unless the `sound` attribute is set; full teardown on disconnect (animation frame,
   listeners, audio, WebGL context).
5. Verify: `npm install && npm run build`, open `packages/<piece>/demo.html` through
   `python3 -m http.server` (several instances, attribute changes, remove and re-add, no console
   errors), check the source page still works, and run `npm pack --dry-run` to confirm only
   `dist/`, `LICENSE`, `README.md` and `package.json` ship.
6. Add a row to the Packages table in the root `README.md`.

## Releasing

1. Bump `version` in `packages/<piece>/package.json` (patch for fixes, minor for new attributes
   or looks, major if an attribute changes meaning or is removed) and commit.
2. Tag and push: `git tag <piece>@<version> && git push origin main <piece>@<version>`.
3. The Publish package workflow builds and publishes it. Check the Actions tab, then confirm the
   package shows as Private under the repo's Packages.

## Installing a piece elsewhere

One-time, per machine: a GitHub personal access token (classic) with `read:packages`, saved as
`GITHUB_TOKEN`. Per project, an `.npmrc`:

```
@akatori-design:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Then `npm install @akatori-design/<piece>` and `import '@akatori-design/<piece>';`.
A package linked to this repo inherits its access, so anyone who can read the repo can install
it. To let someone install a piece without seeing the source, open the package's settings on
GitHub, turn off "Inherit access from source repository", and give that person read access to
the package only.
