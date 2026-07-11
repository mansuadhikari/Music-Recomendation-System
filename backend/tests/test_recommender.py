import pytest
import pandas as pd
from app.recommender import RecommenderEngine

@pytest.fixture
def sample_df():
    data = {
        "id": [1, 2, 3, 4],
        "title": ["Song A", "Song B", "Song C", "Song D"],
        "artist": ["Artist X", "Artist X", "Artist Y", "Artist Z"],
        "genre": ["pop", "pop", "rock", "jazz"],
        "danceability": [0.8, 0.75, 0.3, 0.5],
        "energy": [0.7, 0.65, 0.9, 0.2],
        "valence": [0.6, 0.55, 0.3, 0.4],
        "acousticness": [0.1, 0.15, 0.05, 0.8],
        "tempo": [120, 118, 150, 90],
    }
    return pd.DataFrame(data)

def test_engine_builds_similarity_matrix(sample_df):
    engine = RecommenderEngine(sample_df)
    assert engine.similarity.shape == (4, 4)

def test_recommend_excludes_self(sample_df):
    engine = RecommenderEngine(sample_df)
    results = engine.recommend(song_id=1, top_n=3)
    ids = [row.id for row, score in results]
    assert 1 not in ids

def test_same_genre_similar_features_ranks_higher(sample_df):
    engine = RecommenderEngine(sample_df)
    results = engine.recommend(song_id=1, top_n=3)
    top_result_id = results[0][0].id
    assert top_result_id == 2  # same genre + closest audio features

def test_unknown_song_returns_none(sample_df):
    engine = RecommenderEngine(sample_df)
    assert engine.recommend(song_id=999) is None

def test_top_n_limits_results(sample_df):
    engine = RecommenderEngine(sample_df)
    results = engine.recommend(song_id=1, top_n=2)
    assert len(results) <= 2