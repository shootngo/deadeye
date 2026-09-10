# Deadeye

Phone-first hunting **sight-in / scope-zero logger** PWA for **Frank Mulkey** ([shootngo](https://github.com/shootngo)). Same idea as Nickey / Buck and Bacon / Stashr: static GitHub Pages, Add to Home Screen, large tap targets, no login.

**Phase 1 is this repo.** Cloud sync, sharing, ballistics solvers, and Alexa are out of scope.

## What it is

Deadeye keeps **crossbow**, **rifle**, and **red-dot** zeros on the phone you take to the range:

- **Multi scope profiles** — name, optic type, weapon notes, and per-dot yardages (red dots = a single POA / zero distance)
- **Traditional zeroing hints** — conventional ladders by optic type (crossbow 20–60, rifle BDC-style 100–500, red-dot 50-yard POA). Labeled **suggested**. You can override every number; nothing is forced
- **Range sessions** — date, bolt or load, notes, optional target photo, linked to a profile. The zeros/dots used that day are snapshotted on the session
- **Documents pocket** — hunting license and land permits only (e.g. Butler Lake). Photo or PDF, local-first. **No driver’s license / wallet IDs**
- **No in-app sharing** — no share sheets, no public links, no export-to-social

Branding: bone-white deer skull in blaze-orange crosshairs, dots on the vertical post, charcoal background.

## Live URL

After Frank merges to `main` and enables Pages (root of `main`):

**https://shootngo.github.io/deadeye/**

Until Pages is on, use the repo / PR. Local:

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080/`.

### Enable GitHub Pages (from `main` / root)

1. Merge the Phase 1 PR into `main`.
2. Repo **Settings → Pages**.
3. **Source:** Deploy from a branch.
4. **Branch:** `main` · **folder:** `/ (root)`.
5. Save. First publish takes a minute. `404.html` and `.nojekyll` are already in the root.

PWA `start_url` / `scope` are relative (`./`), so Add to Home Screen works on that Pages path. App `id` is `/deadeye/` so it will not collide with Nickey, Nestor, Stashr, or Buck and Bacon. Service worker cache is `deadeye-v1`.

On Android Chrome: menu → **Install app** / Add to Home screen. After the first visit the shell works offline.

## Data stays on-device

There is **no account and no cloud**. Profiles and session notes live in `localStorage`. Target photos and pocket files live in **IndexedDB** on that phone/browser. Clearing site data for `shootngo.github.io` (or this origin locally) wipes Deadeye. Nothing is uploaded, synced, or shared from the app.

## Design

Charcoal (`#161616`), blaze orange (`#FF6600`), bone (`#F3EDE3`). Icons: `favicon.png`, `favicon-48.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, plus `splash.jpg` / `splash.png`.

## Develop

```bash
npm test          # traditional yardage-hint checks
python3 -m http.server 8080
```

No build step. Vanilla HTML/CSS/ES modules, service worker `deadeye-v1`.

## Phase 1 — parked, do not build here

- Cloud sync / Firebase / accounts
- Sharing or social export
- Ballistics solver beyond traditional yardage hints
- Alexa / voice
