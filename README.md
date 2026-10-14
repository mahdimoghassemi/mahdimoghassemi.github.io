# Mahdi Moghassemi

My personal site. A chibi version of me stands on a dotted globe, jumps into a scroll-driven 3D climb through every place I have worked, lands next to my toolbox, and DJs in the nav bar when you turn the music on.

Built with Next.js (static export), React, TypeScript, Three.js and Tailwind CSS. Deployed to GitHub Pages.

## Run it

```bash
npm ci
npm run dev
```

| Script              | What it does                        |
| ------------------- | ----------------------------------- |
| `npm run dev`       | Dev server on http://localhost:3000 |
| `npm run build`     | Static site in `out/`               |
| `npm run lint`      | ESLint                              |
| `npm run typecheck` | TypeScript, no emit                 |
| `npm run format`    | Prettier                            |

Stop the dev server before running `npm run build`; both write to `.next/`, and a build under a running dev server leaves it stuck in a reload loop until restarted.

## What is on the page

- **Bit field**: a full-page grid of 0s and 1s that lights up around the cursor and ripples on click (`components/bit-field.tsx`).
- **Globe**: dotted Earth from `world-atlas`, with the UAE highlighted and me standing on it. Drag to spin, click me to jump (`lib/three/globe-scene.ts`).
- **The climb**: one platform per job, with stairs between them and each company's logo extruded in 3D above it. Scrolling walks me up level by level; the side card tells the story (`lib/three/journey-scene.ts`).
- **Toolbox**: a laptop whose screen follows the skill group you hover, plus me on a pad next to the list (`lib/three/laptop-scene.ts`, `perch-scene.ts`).
- **DJ**: the music toggle in the nav. Logos, lights and the DJ bounce on the kick, detected live from the track (`lib/audio/music.ts`).

## Project layout

```
app/                 layout, page, global styles and tokens
components/          one client component per interactive section
components/ui/       shadcn/ui primitives (Base UI)
lib/content.ts       all copy: profile, journey, skills
lib/three/           plain Three.js scenes, each returns a dispose function
lib/audio/music.ts   track playback and beat detection
public/logos/        company logos as SVG
public/music/        background track
```

Every 3D scene is a framework-free module that receives a canvas and returns a cleanup function. Components load it with a dynamic `import()` inside `useEffect`, so Three.js stays out of the first page load, and scenes stop rendering while off screen.

## Editing content

- **Text, jobs, skills**: `lib/content.ts`. Adding an entry to `journey` adds a platform, stairs and a logo to the climb.
- **Logos**: drop an SVG in `public/logos/` and point the job's `logo` at it with `asset("/logos/name.svg")`. Each `<path>` keeps its own fill colour; optional `data-depth`, `data-z` and `data-bevel` attributes control how thick it is, how far forward it sits and how rounded its edges are.
- **Music**: replace `public/music/sea-breeze.mp3` and update the credit in the footer (`app/page.tsx`).

## Deploy

Pushing to `master` runs `.github/workflows/deploy.yml`, which builds the static site and publishes it to GitHub Pages.

1. In the repo, set **Settings → Pages → Source** to **GitHub Actions**.
2. Name the repo `mahdimoghassemi.github.io` to serve it at the root. Any other name serves it under `/<repo>`; the base path is picked up automatically from the repository name.

## Credits

Music: "Sea Breeze" by Roa, via chosic.com.
