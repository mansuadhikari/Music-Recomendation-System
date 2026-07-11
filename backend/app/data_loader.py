import pandas as pd
from pathlib import Path

DATA_PATH = Path(__file__).parent.parent / "data" / "songs.csv"

def load_songs() -> pd.DataFrame:
    return pd.read_csv(DATA_PATH)