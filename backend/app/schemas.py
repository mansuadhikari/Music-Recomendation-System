from pydantic import BaseModel

class Song(BaseModel):
    id: int
    title: str
    artist: str
    genre: str
    danceability: float
    energy: float
    valence: float
    acousticness: float
    tempo: float

class RecommendationResponse(BaseModel):
    song: Song
    similarity_score: float