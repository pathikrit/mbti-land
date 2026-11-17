# MBTI Zombie Apocalypse: Camp Chaos

An interactive, offensively stereotypical diorama of how each MBTI type would handle the zombie apocalypse.
Play it at **https://pathikrit.github.io/mbti-land/**

Click survivors and zombies to hear what they have to say (each has several lines), poke the scenery,
open the INTJ bunker, set off traps, and fill in the field guide by finding all 15 surviving types and all 16 zombie types.

## Controls

| Input | Action |
| --- | --- |
| Click | Talk to a person or zombie, or poke an object |
| Drag / WASD / arrows | Pan |
| Scroll / `+` `-` | Zoom |
| Right-drag / `Q` `E` | Rotate |
| `B` | Breach drill |
| `T` | Fire one of INTJ's traps |
| `N` | Day / night |
| `C` `L` `M` | Toggle ambient chatter, name tags, sound |
| Space | Make someone on screen talk |

## Running locally

No build step. Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

Three.js and the fonts load from a CDN, so you need to be online.

## Layout

| File | What it holds |
| --- | --- |
| `js/cast.js` | Every character: position, outfit, pose and dialogue. Edit this to change what people say. |
| `js/people.js`, `js/anim.js` | The blocky character builder and its procedural poses |
| `js/camp.js`, `js/outside.js`, `js/scenery.js` | The world: camp, bunker, lab, jeep, drone and clutter |
| `js/events.js` | Traps, explosions, the breach drill, day/night, ambient chatter, keyboard |
| `js/ui.js`, `js/sfx.js` | Speech bubbles, field guide, buttons; synthesised sound effects |
| `js/main.js` | Boot, camera, picking and the frame loop |
| `js/kit.js` | Small helpers for building things out of boxes |

Built with [Three.js](https://threejs.org/). Pushing to `main` deploys to GitHub Pages.
