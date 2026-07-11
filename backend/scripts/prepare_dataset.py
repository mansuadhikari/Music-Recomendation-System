import pandas as pd
from pathlib import Path

RAW_PATH = Path(__file__).parent.parent / "data" / "raw_kaggle.csv"
OUT_PATH = Path(__file__).parent.parent / "data" / "songs.csv"

def bucket(value, low_label, mid_label, high_label, low=0.33, high=0.66):
    if pd.isna(value):
        return ""
    if value < low:
        return low_label
    elif value < high:
        return mid_label
    else:
        return high_label

def build_keywords(row):
    tags = []
    tags.append(bucket(row.get("danceability"), "chill", "moderate_dance", "very_danceable"))
    tags.append(bucket(row.get("energy"), "low_energy", "mid_energy", "high_energy"))
    tags.append(bucket(row.get("valence"), "melancholic", "neutral_mood", "upbeat"))
    tags.append(bucket(row.get("acousticness"), "electronic", "mixed", "acoustic_sound"))
    tempo = row.get("tempo")
    if pd.notna(tempo):
        if tempo < 90:
            tags.append("slow_tempo")
        elif tempo < 130:
            tags.append("mid_tempo")
        else:
            tags.append("fast_tempo")
    return " ".join(t for t in tags if t)

def main():
    df = pd.read_csv(RAW_PATH)

    df = df.rename(columns={
        "track_name": "title",
        "artists": "artist",
        "track_genre": "genre",
    })

    feature_cols = ["danceability", "energy", "valence", "acousticness", "tempo"]
    keep_cols = ["title", "artist", "genre"] + [c for c in feature_cols if c in df.columns]

    df = df[keep_cols].dropna()
    df = df.drop_duplicates(subset=["title", "artist"])
    df = df.head(2000)
    df.insert(0, "id", range(1, len(df) + 1))

    df.to_csv(OUT_PATH, index=False)
    print(f"Wrote {len(df)} songs to {OUT_PATH}")


if __name__ == "__main__":
    main()