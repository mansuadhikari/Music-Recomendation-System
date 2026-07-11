from fastapi import APIRouter, HTTPException, Request, Query
from app.schemas import Song, RecommendationResponse

router = APIRouter(prefix="/songs", tags=["songs"])

FEATURE_COLS = ["id", "title", "artist", "genre", "danceability", "energy", "valence", "acousticness", "tempo"]


@router.get("/", response_model=list[Song])
def list_songs(request: Request):
    engine = request.app.state.engine
    df = engine.df
    return df[FEATURE_COLS].to_dict(orient="records")


@router.get("/search", response_model=list[Song])
def search_songs(request: Request, q: str = Query(..., min_length=1, description="Search term for title or artist")):
    engine = request.app.state.engine
    df = engine.df
    q_lower = q.lower()
    mask = (
        df["title"].str.lower().str.contains(q_lower, na=False)
        | df["artist"].str.lower().str.contains(q_lower, na=False)
    )
    results = df[mask]
    return results[FEATURE_COLS].to_dict(orient="records")


@router.get("/genre/{genre_name}", response_model=list[Song])
def filter_by_genre(genre_name: str, request: Request):
    engine = request.app.state.engine
    df = engine.df
    mask = df["genre"].str.lower().str.contains(genre_name.lower(), na=False)
    results = df[mask]
    if results.empty:
        raise HTTPException(status_code=404, detail=f"No songs found for genre '{genre_name}'")
    return results[FEATURE_COLS].to_dict(orient="records")


@router.get("/{song_id}", response_model=Song)
def get_song(song_id: int, request: Request):
    engine = request.app.state.engine
    df = engine.df
    row = df[df["id"] == song_id]
    if row.empty:
        raise HTTPException(status_code=404, detail="Song not found")
    return row.iloc[0][FEATURE_COLS].to_dict()


@router.get("/{song_id}/recommend", response_model=list[RecommendationResponse])
def recommend(song_id: int, request: Request, top_n: int = 5):
    engine = request.app.state.engine
    results = engine.recommend(song_id, top_n)
    if results is None:
        raise HTTPException(status_code=404, detail="Song not found")
    return [
        {
            "song": {col: getattr(row, col) for col in FEATURE_COLS},
            "similarity_score": round(float(score), 4),
        }
        for row, score in results
    ]