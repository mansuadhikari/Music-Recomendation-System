from fastapi import FastAPI
from app.data_loader import load_songs
from app.recommender import RecommenderEngine
from app.routers import songs

app = FastAPI(title="Music Recommendation API", version="0.1.0")

df = load_songs()
app.state.engine = RecommenderEngine(df)

app.include_router(songs.router)

@app.get("/")
def root():
    return {"status": "ok", "songs_loaded": len(df)}