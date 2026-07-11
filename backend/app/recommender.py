import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics.pairwise import cosine_similarity

AUDIO_FEATURES = ["danceability", "energy", "valence", "acousticness", "tempo"]

class RecommenderEngine:
    def __init__(self, df: pd.DataFrame):
        self.df = df.reset_index(drop=True)

        available_features = [f for f in AUDIO_FEATURES if f in self.df.columns]
        scaler = MinMaxScaler()
        self.matrix = scaler.fit_transform(self.df[available_features])
        self.similarity = cosine_similarity(self.matrix)

    def recommend(self, song_id: int, top_n: int = 5):
        idx = self.df.index[self.df["id"] == song_id]
        if len(idx) == 0:
            return None
        idx = idx[0]
        scores = list(enumerate(self.similarity[idx]))
        scores = sorted(scores, key=lambda x: x[1], reverse=True)
        scores = [s for s in scores if s[0] != idx][:top_n]
        return [(self.df.iloc[i], score) for i, score in scores]