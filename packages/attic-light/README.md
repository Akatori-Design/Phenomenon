# @akatori-design/attic-light

Sunlight falling through a gap in an attic roof, with dust drifting in the beam, as a drop-in
`<attic-light>` web component. About 262,000 specks of dust ride a simulated 3D airflow, glow
where the light catches them and blur into soft discs away from the focus. Viewers stir the air
with the pointer and sweep dust out of the beam by dragging. Built with WebGL 2. It works in plain
HTML, React, Vue, Svelte, Framer, Webflow and anywhere else that renders HTML.

By **Hiro · Akatori Design** · © 2026 · Private package: see [LICENSE](LICENSE).

## Install

This package lives on GitHub Packages and is private. You need to have been given access, and
a GitHub personal access token (classic) with the `read:packages` scope.

1. Add an `.npmrc` next to your project's `package.json`:

   ```
   @akatori-design:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
   ```

2. Set `GITHUB_TOKEN` in your shell or CI to your token. Never commit the token itself.

3. Install:

   ```bash
   npm install @akatori-design/attic-light
   ```

## Use

```js
import '@akatori-design/attic-light';
```

```html
<attic-light controls></attic-light>
<attic-light dust="40%" sunlight="70%" style="height: 100vh"></attic-light>
```

The element fills its container's width at a 16:10 ratio. Give it a `height` or `aspect-ratio`
in CSS to change that.

### Attributes

| Attribute | Values | Default |
| --- | --- | --- |
| `controls` | present or absent: shows a small control tray | absent |
| `dust` | `0`–`1` or `0%`–`100%`: the share of dust specks in the air | `100%` |
| `sunlight` | `0`–`1` or `0%`–`100%`: brightness of the beam. 50% is the tuned look | `50%` |
| `haze` | `0`–`1` or `0%`–`100%`: how strongly the air in the beam glows. 50% is the tuned look | `50%` |
| `paused` | present or absent | absent |

The effect has no sound.

### Methods and properties

- `element.reset()` puts the starting dust back in the air.
- `element.credits` and `customElements.get('attic-light').credits` return who made it.

### In React

```jsx
import '@akatori-design/attic-light';

export function Hero() {
  return <attic-light dust="60%" style={{ height: 480 }} />;
}
```

## Browser support

Needs WebGL 2 with float render targets: current Chrome, Edge, Safari and Firefox. Where that is
missing, the element shows a short message instead of the effect.

## Credits

Every copy carries its author: the copyright notice at the top of the file, a credits comment
inside the element (visible in browser DevTools), the `credits` property, and a credit line in
the control tray. The licence does not allow removing any of them.
