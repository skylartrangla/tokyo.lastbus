# Last Bus

> A procedural night-scene experiment exploring how weather, lighting, sound, and small environmental details change the feeling of waiting for the last bus.

**Last Bus** is an interactive Tokyo bus-stop mood study made with Three.js. Change the rain, fog, lighting, traffic, ambient sound, scene seed, and time of night-then enter Photo Mode to compose and save a frame.

## Features

- Procedural rain, fog, puddles, traffic, and environmental variation
- Adjustable streetlight color and vending-machine glow
- Five-hour night-to-dawn lighting cycle
- Browser-generated rain, electrical hum, and distant traffic audio
- Deterministic scene seeds
- Cinematic camera drift and interactive Photo Mode
- Screenshot export
- Responsive controls for desktop and mobile
- No build step and no bundled assets

## Run locally

The project uses JavaScript modules, so serve it through a local web server instead of opening `index.html` directly.

```bash
npx serve .
```

Then open the local URL printed in the terminal.

## Deploy to GitHub Pages

1. Push these files to a GitHub repository.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and `/ (root)`, then save.

The site will be available at `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`.

## Replacing placeholders with your own models

The primitive assets are grouped and named in `src/main.js`, including:

- `PLACEHOLDER_VENDING_MACHINE`
- `PLACEHOLDER_STREETLIGHT`
- `PLACEHOLDER_CAR`

To replace one, import `GLTFLoader` from `three/addons/loaders/GLTFLoader.js`, load your optimized `.glb`, and add it at the corresponding group position. Keep the existing lights if you want the current mood controls to continue working.

Recommended web-asset targets:

- GLB/GLTF with embedded textures
- Draco or Meshopt compression
- 2K textures for hero assets, 1K or lower for background props
- Under 5–8 MB per hero asset where possible
- Mesh names that describe the object and material slot

## Controls

- **Rain / Fog** - atmospheric density
- **Streetlight** - lamp hue
- **Machine glow** - vending-machine emission
- **Time of night** - midnight through 5:00 AM
- **Passing traffic** - visible vehicle frequency and speed
- **Ambient sound** - generated rain, hum, and traffic mix
- **Scene seed** - puddle placement, city variation, and car timing
- **Photo Mode** - orbit, zoom, hide the interface, and export PNG

## Tech

Three.js · WebGL · Web Audio API · HTML · CSS · JavaScript

---

Made as a flexible base for gradually replacing procedural geometry with original 3D artwork.
