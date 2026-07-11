# Music Recommendation System — Frontend

A React (Vite) web interface for the content-based music recommendation API. Users browse songs in a card grid, and selecting a song opens a slide-in drawer showing similar tracks based on audio-feature similarity, with a visual "fingerprint" representing each song's audio profile.

---

## Tech Stack

- **React** (via Vite) — UI framework
- **Axios** — API client for calling the FastAPI backend
- **Plain CSS + inline styles** — no UI framework, custom design tokens (see `src/index.css`)

---

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── client.js               # Axios instance + API calls (getSongs, searchSongs, getRecommendations)
│   ├── components/
│   │   ├── Fingerprint.jsx         # 5-bar visual glyph representing a song's audio features
│   │   ├── SongCard.jsx            # Card shown in the song grid
│   │   └── RecommendationDrawer.jsx # Slide-in panel showing recommendations for a selected song
│   ├── App.jsx                     # Main app: song grid, search, pagination, drawer state
│   ├── index.css                   # Design tokens (colors, fonts) and base styles
│   └── main.jsx                    # React entrypoint
├── index.html                      # Includes Google Fonts links (Space Grotesk, Inter, JetBrains Mono)
├── .env.example                    # Template for local .env (committed)
├── .env                            # Local environment config (not committed)
├── package.json
└── vite.config.js
```

---

## 1. Setup

### 1.1 Enter the frontend folder

```bash
cd Music-Recomendation-System/frontend
```

### 1.2 Install dependencies

```bash
npm install
```

### 1.3 Configure environment variables

Copy the example env file:

```bash
# Windows
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

`.env` contents:

```
VITE_API_BASE_URL=http://127.0.0.1:8000
```

This points the frontend at the backend API. Vite only exposes env vars prefixed with `VITE_` to the app — this is a Vite requirement, not a project-specific choice.

**Important:** The backend must have this frontend's dev server URL listed in its own `CORS_ORIGINS` (see `backend/README.md`, Section 4), or all API requests will be blocked by the browser.

---

## 2. Running the Frontend

The backend must be running first (see `backend/README.md`, Section 3):

```bash
# in backend/, in a separate terminal
uvicorn app.main:app --reload
```

Then start the frontend dev server:

```bash
npm run dev
```

Vite will print a local URL, typically:

```
http://localhost:5173
```

Open that in the browser. You should see the full song grid load, with a search bar and "Load more" pagination.

---

## 3. How the UI Works

### Song grid (main view)

- Songs load 30 at a time (`PAGE_SIZE` in `App.jsx`); click "Load more" to reveal additional songs without loading all 2000 at once.
- Each `SongCard` shows the title, artist, genre, and a small **Fingerprint** — five bars, one per audio feature (danceability, energy, valence, acousticness, tempo), scaled to reflect that song's actual values.

### Search

- The search bar debounces input (waits 300ms after typing stops) before calling `GET /songs/search?q=...`, to avoid firing a request on every keystroke.
- While a search query is active, the grid shows search results instead of the paginated list.

### Recommendation drawer

- Clicking a song card calls `GET /songs/{id}/recommend` and opens a slide-in drawer from the right (mobile navigation-drawer style), with a dimmed backdrop.
- The drawer shows the selected song's fingerprint at the top (large), followed by each recommended song with its own fingerprint (in a different color) and similarity score as a percentage — so the visual bar heights can be compared side by side, not just the raw score number.
- Close the drawer by clicking the **×** button, clicking the backdrop, or pressing **Escape**.

### Fingerprint component

`Fingerprint.jsx` takes a song object and renders five bars. Danceability, energy, valence, and acousticness are already 0–1 in the source data; tempo (typically 60–200 BPM) is normalized to a comparable 0–1 range for display purposes only — the actual similarity calculation on the backend uses `MinMaxScaler`, not this display normalization.

---

## 4. API Integration

All backend calls live in `src/api/client.js`:

```javascript
export const getSongs = () => apiClient.get("/songs/");
export const getRecommendations = (songId, topN = 5) =>
  apiClient.get(`/songs/${songId}/recommend`, { params: { top_n: topN } });
export const searchSongs = (query) =>
  apiClient.get("/songs/search", { params: { q: query } });
```

The base URL comes from `VITE_API_BASE_URL` in `.env`. To point the frontend at a different backend (e.g. a deployed instance), change this value and restart the dev server (Vite only reads `.env` on startup).

---

## 5. Design System

Defined in `src/index.css` as CSS custom properties:

| Token             | Value     | Usage                                              |
| ----------------- | --------- | -------------------------------------------------- |
| `--bg`            | `#14121F` | Page background                                    |
| `--surface`       | `#1E1B2E` | Card / panel background                            |
| `--surface-hover` | `#262239` | Hover state                                        |
| `--accent`        | `#F2A65A` | Primary interactive color, source-song fingerprint |
| `--data`          | `#5EEAD4` | Recommendation fingerprints, similarity scores     |
| `--text`          | `#F5F3F7` | Primary text                                       |
| `--text-muted`    | `#9A93AC` | Secondary text                                     |

Fonts: **Space Grotesk** (headings), **Inter** (body text), **JetBrains Mono** (scores, data readouts, labels) — loaded via Google Fonts in `index.html`.

---

## 6. Troubleshooting

| Problem                                 | Fix                                                                                                                                                                                |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CORS error in browser console           | Confirm the backend's `CORS_ORIGINS` (in `backend/.env`) includes this frontend's exact dev server URL (check both `localhost` and `127.0.0.1` variants), then restart the backend |
| "Songs loaded: 0" or network error      | Confirm the backend is running (`http://127.0.0.1:8000/docs` should load) and `VITE_API_BASE_URL` in `frontend/.env` matches the backend's actual URL                              |
| Fonts not loading / fallback font shown | Check the Google Fonts `<link>` tags are present in `index.html` and you have an internet connection (fonts are loaded from Google's CDN, not bundled locally)                     |
| Env var changes not taking effect       | Vite only reads `.env` on server startup — restart `npm run dev` after editing `.env`                                                                                              |
| Search feels slow/laggy while typing    | Expected — there's a 300ms debounce before the search request fires; this is intentional to avoid excessive API calls                                                              |

---

## 7. Notes

- No state management library (Redux, Zustand, etc.) is used — the app's state is small enough that React's built-in `useState`/`useEffect` are sufficient.
- No routing library — this is a single-view app (song grid + drawer), so client-side routing wasn't needed.
- Styling is done via inline styles and CSS custom properties rather than a CSS framework (e.g. Tailwind) or CSS Modules, to keep the setup minimal for a college project scope.
