# @akatori-design/rain-on-glass

Rain running down a fogged window, as a drop-in `<rain-on-glass>` web component. Drops land,
merge, drip and refract the view behind the glass, streams run in heavy rain, and viewers can
wipe the glass with three fingers (a thumb on a phone). Built with WebGL 2. It works in plain HTML, React, Vue,
Svelte, Framer, Webflow and anywhere else that renders HTML.

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
   npm install @akatori-design/rain-on-glass
   ```

## Use

```js
import '@akatori-design/rain-on-glass';
```

```html
<rain-on-glass controls></rain-on-glass>
<rain-on-glass rainfall="30%" scene="night" style="height: 100vh"></rain-on-glass>
```

The element fills its container's width at a 16:10 ratio. Give it a `height` or `aspect-ratio`
in CSS to change that.

Below 640px wide (a phone) drops fall twice as big, so they still read on a small screen, and
the wipe is a single thumb instead of three fingers.

### Attributes

| Attribute | Values | Default |
| --- | --- | --- |
| `controls` | present or absent: shows the control tray | absent |
| `rainfall` | `0`–`1` or `0%`–`100%`. Streams run above 80% | `65%` |
| `condensation` | `0`–`1` or `0%`–`100%` | `0%` |
| `refraction` | `0`–`1` or `0%`–`100%` | `43%` |
| `fog`, `humidity` | `0`–`1` or `0%`–`100%` | `50%` |
| `scene` | `dusk` or `night` | `dusk` |
| `src` | URL of an image or video to show behind the glass (it must allow CORS) | none |
| `sound` | present or absent: plays rain sound after the viewer's first click or key press | absent |
| `paused` | present or absent | absent |

### Methods and properties

- `element.wipe()` clears the glass.
- `element.credits` and `customElements.get('rain-on-glass').credits` return who made it.

### In React

```jsx
import '@akatori-design/rain-on-glass';

export function Hero() {
  return <rain-on-glass rainfall="40%" style={{ height: 480 }} />;
}
```

## Credits

Every copy carries its author: the copyright notice at the top of the file, a credits comment
inside the element (visible in browser DevTools), the `credits` property, and a credit line in
the control tray. The licence does not allow removing any of them.
