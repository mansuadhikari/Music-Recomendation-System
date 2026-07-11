# Music Recommendation System

A full-stack, content-based music recommendation app. Pick a song, and the system finds tracks with the closest audio-feature profile — danceability, energy, valence, acousticness, and tempo — using **cosine similarity**, not collaborative filtering or listening-history data.

- **Backend:** FastAPI + Pandas + Scikit-learn
- **Frontend:** React (Vite) + Axios

---

## Project Structure

```
Music-Recomendation-System/
├── backend/                 # FastAPI recommendation API
│   ├── app/
│   │   ├── main.py          # App entrypoint, CORS, engine setup
│   │   ├── config.py        # Environment-based settings
│   │   ├── schemas.py       # Pydantic response models
│   │   ├── recommender.py   # Scaling + cosine similarity engine
│   │   ├── data_loader.py   # Loads songs.csv into a DataFrame
│   │   └── routers/
│   │       └── songs.py     # /songs endpoints
│   ├── data/
│   │   └── songs.csv        # Processed dataset (committed)
│   ├── scripts/
│   │   ├── prepare_dataset.py
│   │   └── evaluate.py      # Genre-consistency metric
│   ├── tests/
│   │   └── test_recommender.py
│   ├── requirements.txt
│   └── README.md            # Full backend docs
│
└── frontend/                 # React (Vite) web interface
    ├── src/
    │   ├── api/client.js     # Axios calls to the backend
    │   ├── components/
    │   │   ├── Fingerprint.jsx
    │   │   ├── SongCard.jsx
    │   │   └── RecommendationDrawer.jsx
    │   ├── App.jsx           # Song grid, search, pagination, drawer state
    │   └── index.css         # Design tokens and base styles
    ├── package.json
    └── README.md              # Full frontend docs
```

Detailed setup, configuration, and troubleshooting for each half of the app live in their own READMEs:

- [`backend/README.md`](./backend/README.md)
- [`frontend/README.md`](./frontend/README.md)

This root README covers how the two pieces fit together and how to get the whole app running end to end.

---

## How It Works

1. **Dataset** — a processed sample (up to 2000 songs) from the Kaggle _Spotify Tracks Dataset_, with audio features per track.
2. **Feature scaling** — `MinMaxScaler` normalizes danceability, energy, valence, acousticness, and tempo to a 0–1 range so no single feature dominates.
3. **Similarity** — `cosine_similarity` scores every song pair based on their scaled feature vectors.
4. **Recommendation** — for a chosen song, the backend returns the top-N most similar tracks (excluding the song itself).
5. **Frontend** — users browse a song grid, search, and click a song to open a drawer showing its top recommendations, each visualized as a 5-bar "fingerprint" of its audio profile.

This is **content-based filtering**: recommendations come from the songs' own characteristics, not from other users' behavior.

---

## Quick Start (Full Stack)

You'll run two servers in two terminals: the FastAPI backend and the Vite frontend dev server.

### 1. Clone the repo

```bash
git clone <repo-url>
cd Music-Recomendation-System
```

### 2. Backend

```bash
cd backend
python3 -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env   # Windows: copy .env.example .env

uvicorn app.main:app --reload
```

The API runs at `http://127.0.0.1:8000`, with interactive docs at `http://127.0.0.1:8000/docs`.

> The dataset (`data/songs.csv`) is already included, so no Kaggle download is required to run the project as-is. See `backend/README.md` §2 if you want to regenerate it from raw data.

### 3. Frontend (in a separate terminal)

```bash
cd frontend
npm install
cp .env.example .env   # Windows: copy .env.example .env

npm run dev
```

The app runs at `http://localhost:5173`.

### 4. Open the app

Visit `http://localhost:5173` in your browser. You should see the song grid load, with a search bar and "Load more" pagination. Click any song to see its top recommendations.

---

## Connecting Frontend and Backend

The two apps talk to each other over HTTP and must be configured to allow it:

| Setting             | Location        | Purpose                                                                                                    |
| ------------------- | --------------- | ---------------------------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | `frontend/.env` | Tells the frontend where the backend API lives (default `http://127.0.0.1:8000`)                           |
| `CORS_ORIGINS`      | `backend/.env`  | Whitelists which frontend origins may call the API (default `http://localhost:5173,http://127.0.0.1:5173`) |

If you change ports, hosts, or deploy either service, update **both** values and restart both servers — env vars are only read at startup.

`localhost` and `127.0.0.1` are treated as different origins by browsers, so if you're unsure which one your dev server uses, include both in `CORS_ORIGINS`.

---

## API Overview

| Method | Endpoint                             | Description                                      |
| ------ | ------------------------------------ | ------------------------------------------------ |
| GET    | `/`                                  | Health check — status and number of songs loaded |
| GET    | `/songs/`                            | List all songs                                   |
| GET    | `/songs/search?q=...`                | Case-insensitive search by title or artist       |
| GET    | `/songs/genre/{genre_name}`          | Filter songs by genre (substring match)          |
| GET    | `/songs/{song_id}`                   | Get a single song by ID                          |
| GET    | `/songs/{song_id}/recommend?top_n=5` | Get top-N similar songs for a given song ID      |

Full request/response details and examples are in `backend/README.md` §5.

---

## Testing & Evaluation

```bash
cd backend
pytest tests/ -v          # Automated tests for the recommendation engine
python scripts/evaluate.py  # Genre-consistency metric (proxy for recommendation quality)
```

The evaluation script checks how often the top-3 recommendations for a song share its genre — using only audio-feature similarity, with no genre passed into the model — as evidence the engine captures genuine content-based patterns rather than producing degenerate output.

---

## Tech Stack Summary

| Layer             | Technology                                          |
| ----------------- | --------------------------------------------------- |
| API framework     | FastAPI                                             |
| Data processing   | Pandas                                              |
| Similarity engine | Scikit-learn (`MinMaxScaler`, `cosine_similarity`)  |
| Config            | Pydantic Settings                                   |
| Server            | Uvicorn                                             |
| Testing           | Pytest                                              |
| UI framework      | React (Vite)                                        |
| API client        | Axios                                               |
| Styling           | Plain CSS + custom design tokens (no CSS framework) |

---

## Troubleshooting

Most issues are one of:

- **CORS errors** — `CORS_ORIGINS` in `backend/.env` doesn't include the frontend's exact URL. Fix it, then restart the backend.
- **"Songs loaded: 0" / network errors** — the backend isn't running, or `VITE_API_BASE_URL` in `frontend/.env` doesn't match the backend's actual address.
- **`FileNotFoundError: songs.csv`** — run `python scripts/prepare_dataset.py` in `backend/`, or confirm `data/songs.csv` exists.
- **Env var changes not applying** — both Uvicorn (`--reload`) and Vite only read `.env` at startup; restart the affected server.

See each service's README for the full troubleshooting table (`backend/README.md` §9, `frontend/README.md` §6).

---

## Notes

- Dataset is capped at 2000 songs by default — the similarity matrix is `n × n`, so this keeps memory usage and startup time reasonable. Larger datasets would need a nearest-neighbor approach (e.g. `sklearn.neighbors.NearestNeighbors`) instead of a full pairwise matrix.
- This is a content-based filtering system using feature scaling + cosine similarity — not a trained predictive model.
- Built as a college project; no auth, database, or deployment infrastructure is included.
