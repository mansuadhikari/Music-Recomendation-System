# Music Recommendation System — Backend

A content-based music recommendation API built with **FastAPI**, using audio-feature similarity (danceability, energy, valence, acousticness, tempo) and **cosine similarity** to recommend songs similar to a selected track.

---

## Tech Stack

- **FastAPI** — web framework and API layer
- **Pandas** — data loading and processing
- **Scikit-learn** — `MinMaxScaler` for feature normalization, `cosine_similarity` for recommendation scoring
- **Uvicorn** — ASGI server
- **Pytest** — automated testing

---

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app entrypoint, CORS, engine setup
│   ├── schemas.py           # Pydantic response models
│   ├── recommender.py       # Core recommendation engine (scaling + cosine similarity)
│   ├── data_loader.py       # Loads songs.csv into a DataFrame
│   └── routers/
│       └── songs.py         # All /songs endpoints
├── data/
│   ├── raw_kaggle.csv       # Original Kaggle dataset (not committed — see setup below)
│   └── songs.csv            # Processed dataset used by the app (committed)
├── scripts/
│   ├── prepare_dataset.py   # Transforms raw_kaggle.csv → songs.csv
│   └── evaluate.py          # Prints genre-consistency metric for the recommender
├── tests/
│   └── test_recommender.py  # Automated tests for the recommendation engine
├── pytest.ini
├── requirements.txt
└── .env                     # (not committed)
```

---

## 1. Setup

### 1.1 Clone and enter the backend folder

```bash
git clone <repo-url>
cd Music-Recomendation-System/backend
```

### 1.2 Create and activate a virtual environment

```bash
python3 -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 1.3 Install dependencies

```bash
pip install -r requirements.txt
```

---

## 2. Dataset Setup

The processed dataset (`data/songs.csv`) is already included in this repo, so **you can skip straight to Section 3 (Running the Server)** if you just want to run the project as-is.

If you want to regenerate the dataset from scratch (e.g. to use a larger sample, or refresh the data):

### 2.1 Download the raw dataset

1. Create a free account at [kaggle.com](https://www.kaggle.com) if you don't have one.
2. Download the dataset: **Spotify Tracks Dataset** by maharshipandya
   `https://www.kaggle.com/datasets/maharshipandya/-spotify-tracks-dataset`
3. Extract the downloaded ZIP — you'll get a single CSV file.

### 2.2 Rename and place the file

Rename the extracted CSV to `raw_kaggle.csv` and move it into `backend/data/`:

```
backend/data/raw_kaggle.csv
```

Expected columns include: `track_name`, `artists`, `track_genre`, `danceability`, `energy`, `valence`, `acousticness`, `tempo` (plus other columns which are ignored).

### 2.3 Run the transform script

```bash
python scripts/prepare_dataset.py
```

This reads `data/raw_kaggle.csv`, extracts and cleans the relevant columns, deduplicates, caps the sample at 2000 songs (for fast startup + reasonable similarity-matrix size), assigns sequential IDs, and writes the result to `data/songs.csv`.

**Note:** `raw_kaggle.csv` is excluded from git via `.gitignore` (large file, easily re-downloaded). Only the processed `songs.csv` is version-controlled.

---

## 3. Running the Server

From inside `backend/`, with the virtual environment active:

```bash
uvicorn app.main:app --reload
```

If `uvicorn` isn't recognized as a command (common on Windows), use:

```bash
python -m uvicorn app.main:app --reload
```

The server starts at:

```
http://127.0.0.1:8000
```

### Interactive API docs (Swagger)

```
http://127.0.0.1:8000/docs
```

Use this to explore and test every endpoint directly in the browser — no separate tool (Postman, curl) needed.

---

## 4. API Endpoints

| Method | Endpoint                             | Description                                              |
| ------ | ------------------------------------ | -------------------------------------------------------- |
| GET    | `/`                                  | Health check — returns status and number of songs loaded |
| GET    | `/songs/`                            | List all songs                                           |
| GET    | `/songs/search?q=...`                | Case-insensitive search by title or artist               |
| GET    | `/songs/genre/{genre_name}`          | Filter songs by genre (substring match)                  |
| GET    | `/songs/{song_id}`                   | Get a single song by ID                                  |
| GET    | `/songs/{song_id}/recommend?top_n=5` | Get top-N similar songs for a given song ID              |

### Example

```
GET /songs/1/recommend?top_n=5
```

```json
[
  {
    "song": {
      "id": 797,
      "title": "Pop Virus",
      "artist": "Gen Hoshino",
      "genre": "acoustic"
    },
    "similarity_score": 0.9983
  }
]
```

---

## 5. How the Recommendation Engine Works

1. **Feature extraction** — audio features (`danceability`, `energy`, `valence`, `acousticness`, `tempo`) are pulled from each song's row.
2. **Vectorization / scaling** — `MinMaxScaler` normalizes all features to a 0–1 range so no single feature (e.g. tempo, which has larger raw values) dominates the similarity calculation.
3. **Similarity calculation** — `cosine_similarity` computes a similarity score between every pair of songs based on their scaled feature vectors.
4. **Ranking** — for a given song, all other songs are sorted by similarity score, and the top-N are returned (excluding the song itself).

This is a **content-based filtering** approach — recommendations are based on song characteristics, not other users' listening behavior (no collaborative filtering).

---

## 6. Testing

Run the automated test suite:

```bash
pytest tests/ -v
```

This validates core recommender behavior:

- The similarity matrix builds with the correct shape
- A song never recommends itself
- Songs with closer feature profiles rank higher
- Unknown song IDs return `None` gracefully
- `top_n` correctly limits the number of results

Tests use a small fixture dataset independent of `songs.csv`, so they remain stable even if the real dataset changes.

---

## 7. Evaluating Recommendation Quality

Since there's no user feedback data to validate against, `evaluate.py` measures **genre consistency** as a proxy metric — the percentage of top-3 recommendations that share the same genre as the source song, using audio-feature similarity alone (no genre passed into the model):

```bash
python scripts/evaluate.py
```

Example output:

```
Genre match rate in top-3 recommendations: 64.75%
Total songs evaluated: 2000
Total recommendations checked: 6000
```

A result well above random chance (with 125+ genres in the dataset, random chance would be under 1%) shows that audio-feature similarity alone captures meaningful genre-related patterns — evidence the model is doing genuine content-based matching rather than trivial or degenerate output.

---

## 8. Troubleshooting

| Problem                                               | Fix                                                                                                                                 |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `uvicorn: command not found`                          | Use `python -m uvicorn app.main:app --reload`, or confirm the venv is active (`pip show uvicorn` should return version info)        |
| `FileNotFoundError: songs.csv`                        | Run `python scripts/prepare_dataset.py` after placing `raw_kaggle.csv` in `data/`, or confirm `songs.csv` already exists in `data/` |
| `ModuleNotFoundError: No module named 'app'` (pytest) | Ensure `pytest.ini` exists in `backend/` with `pythonpath = .`, and run `pytest` from inside `backend/`                             |
| CORS errors from the frontend                         | Confirm the frontend's dev server URL is listed in `allow_origins` in `app/main.py`                                                 |
| `/openapi.json` returns 500                           | Check for unresolved type hints or forward references in router function signatures                                                 |

---

## 9. Notes

- Dataset is capped at 2000 songs by default. Increasing this significantly increases memory usage, since the similarity matrix grows quadratically (`n × n`) — a 100,000-song dataset would require an unreasonably large in-memory matrix. For larger datasets, a nearest-neighbor approach (e.g. `sklearn.neighbors.NearestNeighbors`) would be more appropriate than a full pairwise similarity matrix.
- This project uses **feature scaling + cosine similarity**, not a trained ML model (no `.fit()` on a predictive target). This is a standard, legitimate content-based filtering technique, commonly categorized under machine learning tooling (via scikit-learn) even without a training/optimization loop.
