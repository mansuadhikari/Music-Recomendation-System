from pydantic import BaseModel

class Song(BaseModel):
    id: int
    title: str
    artist: str
    genre: str

class RecommendationResponse(BaseModel):
    song: Song
    similarity_score: float