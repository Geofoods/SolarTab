# SolarTab 🌌

A custom new tab page powered by **NASA's Astronomy Picture of the Day** (APOD) API. Every time you open it, today's space photo becomes your wallpaper, paired with a live clock, web search, and your own quick links.

Built with plain HTML, CSS, and JavaScript on a [Vite](https://vitejs.dev) scaffold — no frameworks, no templates.

## Features

- 🖼️ **NASA APOD wallpaper** — today's astronomy picture fills the screen
- 🕐 **Live clock** with a time-aware greeting ("Good morning, explorer")
- 🔍 **Web search bar** that opens Google in a new tab
- 🔗 **Customizable quick links** — add, remove, and persist your own bookmarks (localStorage)
- ⭐ **Favorites** — save APODs you love, stored per-date in localStorage
- 📅 **Browse the archive** — step through past pictures day by day (back to 1995) or jump to any date
- 🎬 **Image / YouTube / direct video support** — APOD is not always a photo
- 💾 **Resilient loading & error states**
- 📱 Responsive layout with a mobile-friendly breakpoint

## Tech Stack

- HTML, CSS (custom design, `clip-path` shapes, glassmorphism), vanilla JS
- [Vite](https://vitejs.dev) — dev server + production build
- [NASA APOD API](https://api.nasa.gov/)
- [Google Fonts](https://fonts.google.com/) — Orbitron & Black Ops One
- Deployed to **GitHub Pages** via GitHub Actions

## Getting Started

### Prerequisites

- Node.js 20+
- A free NASA API key from <https://api.nasa.gov/> (instant signup)

### Setup

```bash
git clone https://github.com/Geofoods/SolarTab.git
cd SolarTab
npm install
```

Copy the example env file and add your key:

```bash
cp .env.example .env
# edit .env  →  VITE_NASA_API_KEY=your-key-here
```

Start the dev server:

```bash
npm run dev
```

Open the printed local URL (usually `http://localhost:5173/SolarTab/`). No key? No problem — the app falls back to NASA's public `DEMO_KEY`, which works but has strict rate limits (30 req/hour).

### Production build

```bash
npm run build    # outputs to dist/
npm run preview  # preview the build locally
```

## Deployment

This repo ships a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and publishes to GitHub Pages on every push to `main`.

1. Enable **Pages** → *Source: GitHub Actions* in your repo Settings.
2. Add the repo secret `VITE_NASA_API_KEY` (Settings → Secrets and variables → Actions) with your NASA key.
3. Push to `main`. The workflow builds with the secret and deploys automatically.

The live site lives at `https://geofoods.github.io/SolarTab/`.

### A note on the API key

This is a client-side only app, so `VITE_NASA_API_KEY` is inlined into the shipped JavaScript bundle and is technically visible in the browser. It is fine for this project's scope and rate limits, but for production you would proxy requests through a backend. The `DEMO_KEY` fallback keeps the deployed page functional even if the secret is missing.

## How it works

`src/main.js` follows the classic fetch flow:

1. Show a loading state
2. `fetch()` the APOD endpoint with the current date
3. Parse the JSON response (`response.json()`)
4. Render the result — title, explanation, and the correct media tag (`<img>`, `<video>`, or a YouTube `<iframe>`)
5. `catch` any network/API errors and surface them instead of a blank page

Everything else (clock, search, quick links, favorites, date navigation) is plain DOM + event listeners with `localStorage` persistence.

## Project Structure

```
SolarTab/
├── .github/workflows/deploy.yml   # GitHub Pages deploy
├── index.html                     # app skeleton
├── src/
│   ├── main.js                    # all logic
│   └── style.css                  # custom UI
├── devlog.md                      # build journey notes
├── vite.config.js                 # base path /SolarTab/
└── .env.example
```

## Credits

- Astronomy data: [NASA APOD](https://apod.nasa.gov/)
- Course: guided build with the fetch/APOD learning path