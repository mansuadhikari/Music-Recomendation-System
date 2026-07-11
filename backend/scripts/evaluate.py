import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from app.data_loader import load_songs
from app.recommender import RecommenderEngine

df = load_songs()
engine = RecommenderEngine(df)

genre_matches = 0
total_checked = 0

for song_id in df["id"]:
    results = engine.recommend(song_id, top_n=3)
    if not results:
        continue
    source_genre = df[df["id"] == song_id]["genre"].values[0]
    for row, score in results:
        total_checked += 1
        if row.genre == source_genre:
            genre_matches += 1

match_rate = genre_matches / total_checked if total_checked else 0
print(f"Genre match rate in top-3 recommendations: {match_rate:.2%}")
print(f"Total songs evaluated: {len(df)}")
print(f"Total recommendations checked: {total_checked}")