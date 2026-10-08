# Rain on Glass

A WebGL2 simulation of rain on a window, in one HTML file with no dependencies.

## What it does

- **Drops** land at random, sag under their own weight, and merge into one drop holding their combined volume when they come within a pixel. Small and mid-size drops stay put; a drop slides only once it holds more water than the glass can carry, then runs down as one U-shaped body at a speed proportional to its volume, losing water as it goes until it comes to rest.
- **Physics**: running drops stick and slip, caught by the glass until their weight tears them free (small ones often, heavy ones hardly ever); resting drops are domes when small and sag more as they grow; a runner swerves toward water it swallows; spray flies downwind; condensation forms as micro-mist after a wipe and matures into beads; humidity sets how fast the glass fogs and drops evaporate.
- **Refraction**: every drop and stream acts as a small lens showing an inverted view of the street, with dark rims and soft highlights.
- **Condensation** fogs the glass; running water clears channels through it, and it slowly forms back.
- **Streams** pour from the top of the pane only above 70% rainfall; at any rainfall, a running drop that gathers enough water opens a stream of its own, which runs on that water for a while and then drains. Streams keep an even width between a minimum and a maximum, never lean more than about 35° off vertical, and bend in smooth curves with the odd short kink where the front snags on the glass. They reshape like rivers while water flows: bends erode on their outer bank, growing outward and widening there, and a stretch that leans too far sags back toward vertical. Every change in width is gradual. A drop that touches a stream joins it, swelling it where it joined and adding to the water below. Streams that touch, or a tip that stops beside another stream, merge into one thicker stream. Cut off from their water, by a wipe or when the heavy rain stops, streams drain from the top down and the thread they leave behind pinches off into a line of beads.
- **Wiping**: drag to wipe as if with three fingers. The fingertips wipe clean while the lower fingers only smear; the fingers tilt with the arm. Pushed water stays on the glass as a strip against the side of the fingers you are moving toward, sagging to its lower end as it fills; on a long wipe a large drop breaks off that end and runs down, and the rest breaks into drops when you lift. Holding your fingers still makes water flow around them.
- **Wipe lines** hold water back: drops spread along the line until they break through, and streams pool at the edge, then fall straight down. The resistance fades as the glass fogs over.
- **Splashes**: the heavier the rain, the harder drops hit. A hard hit shatters the instant it lands into a smaller centre and a radial ring of beads; the jolt shakes nearby drops and can knock loose ones that were close to sliding.
- **Weather**: the rain swells and eases over tens of seconds, gusts of wind slant running water, rain falls fast and out of focus beyond the glass, and a heavy downpour brings lightning that lights up every drop.
- **The pane**: an invisible map of grime makes drops pin and snag unevenly, condensation gather in patches and streams wander and split; water collects in a ridge along the bottom edge and drips off.
- **Optics**: out-of-focus lights open into round bokeh discs and glow, drops show a faint color fringe, and a dim reflection of the room sits on the glass. Moving the mouse shifts the view outside slightly, as if you moved your head.
- **Sound** (starts on your first click; toggle in the panel): a knock for each drop that lands over a wash of rain, both following how heavy the rain is, plus the trickle of running streams, the swish and squeak of a wipe, and thunder after lightning.

## Controls

Rainfall, condensation, refraction, fog and humidity sliders (starting at 65% rainfall, no condensation and 43% refraction), a choice of view outside, wipe glass, pause, sound, and "Use a photo or video" to look through your own image or video clip (or drop one onto the page).

## Run it

Open `index.html` in a browser that supports WebGL 2.
