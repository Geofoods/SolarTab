# Devlog — SolarTab

Notes from building SolarTab, a custom new tab page using NASA's APOD API, guided by the course curriculum.

## Day 1 — The idea

Goal: a new tab page that feels like your own personal space dashboard. The NASA APOD API gives a stunning new picture every single day, so it's the perfect wallpaper source. Stack decision: no frameworks — plain HTML/CSS/JS on a Vite scaffold, because the point of this project is to understand the fundamentals (DOM, fetch, events, storage) with nothing in between.

## Day 1 — JavaScript: the fetch flow

The whole logic lives in `src/main.js`. The lesson hammered home the four-step mental model for talking to an API:

1. **Send a request** — `fetch(url)`
2. **Get a response** — the raw HTTP response
3. **Parse it** — `response.json()` turns the "envelope" into usable data
4. **Render it** — put it on the page with `innerHTML`

Key lightbulb moments:

- Backticks vs quotes: `` `${API_KEY}` `` interpolates; `"${API_KEY}"` is literal text.
- `.then()` chains are a pipeline, not floating blocks.
- Setting `innerHTML` **replaces** everything — so the pattern of build-your-HTML-in-a-variable-then-set-once avoids wiping out previous content.
- `data.media_type` is never guaranteed to be `image` — NASA sometimes returns a video, and sometimes the video is a YouTube link. The `<img>` tag only works for photos, so the code branches:
  - `image` → `<img>`
  - url contains `youtube` → `<iframe>`
  - anything else → `<video controls>`
- `.catch()` turns silent failures (bad key, no internet) into a visible message. Without it you just stare at a blank page.

## Day 1 — Styling

The design brief was "no plain templates." The signature elements:

- **Pseudo-elements** `body::before` / `body::after` with `content: ''` create side decorations without touching HTML.
- **`clip-path: polygon()`** cuts the strips into a zigzag. Drawing ~40 points by hand was tedious but really locked in how the coordinate pairs work: `x% y%` around the shape.
- **Glassmorphism** — `backdrop-filter: blur()` over the wallpaper for readable, modern panels.
- Orbitron for the display clock, Black Ops One for body text, via Google Fonts.
- A `@media (max-width: 600px)` query hides the side strips so they never overlap content on phones.

## Day 2 — Turning it into a real new tab page

The starter was just "show today's APOD." To make it a *product* (and hit the project requirements), I expanded the scope:

- **Live clock** updating every second, plus a greeting that changes with the time of day.
- **Search bar** — submits Google search in a new tab.
- **Quick links** — a bookmarks grid with add/remove, persisted to `localStorage` so your links survive refreshes.
- **Favorites** — a star button saves the current APOD per-date, also in `localStorage`.
- **Date navigation** — step through the archive or pick any date back to 1995-06-16 (the earliest APOD). Prev/next buttons disable at the ends.
- **Read-more toggle** — long explanations get clamped to three lines with a toggle, so the footer card stays compact.
- The image becomes the **full-screen wallpaper** with an overlay for readability; videos render as a player card instead.

Gotchas hit along the way:

- Referencing a `const` before its declaration line (temporal dead zone) throws at runtime — reordered the defaults.
- `toISOString()` returns UTC, which can shift a date in negative timezones — switched to formatting dates manually with local time.
- The deployed build only works if the API key is available at build time — added a `DEMO_KEY` fallback and a GitHub Actions secret so the pipeline is reproducible.

## Day 2 — Deployment

GitHub Actions workflow builds with the `VITE_NASA_API_KEY` secret and deploys to Pages automatically on every push to `main`. Live at `https://geofoods.github.io/SolarTab/`.

## What's next

- A "favorites" gallery view to revisit saved pictures
- Search engine picker (Google / Bing / DuckDuckGo)
- Weather widget to make it a full dashboard
- Setting the page as an actual browser new-tab (via a small extension wrapper)

## Reflection

This project made the fetch flow finally *click*. Each of the four steps maps to a line of code I wrote myself, and turning it into a real interactive page showed how far a little vanilla JS can go. The custom clip-path + glassmorphism styling is what makes it feel like *mine* rather than a tutorial output.