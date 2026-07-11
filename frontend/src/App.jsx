import { useEffect, useState } from "react";
import { getSongs, getRecommendations, searchSongs } from "./api/client";
import SongCard from "./components/SongCard";
import RecommendationDrawer from "./components/RecommendationDrawer";

const PAGE_SIZE = 30;

function App() {
  const [allSongs, setAllSongs] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getSongs()
      .then((res) => setAllSongs(res.data))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults(null);
      return;
    }
    const timeout = setTimeout(() => {
      searchSongs(searchQuery)
        .then((res) => setSearchResults(res.data))
        .catch((err) => setError(err.message));
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleSelect = (song) => {
    setSelectedSong(song);
    setDrawerOpen(true);
    setLoadingRecs(true);
    getRecommendations(song.id, 5)
      .then((res) => setRecommendations(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoadingRecs(false));
  };

  const closeDrawer = () => setDrawerOpen(false);

  if (error) return <div style={{ padding: 40, color: "var(--text)" }}>Error: {error}</div>;

  const displayedSongs = searchResults !== null
    ? searchResults
    : allSongs.slice(0, visibleCount);

  const hasMore = searchResults === null && visibleCount < allSongs.length;

  return (
    <div style={{ minHeight: "100vh", padding: "48px 32px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ marginBottom: 8, color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Content-based recommendation engine
        </div>
        <h1 style={{ fontSize: 28, margin: "0 0 20px" }}>Pick a song to see its audio fingerprint</h1>

        <input
          type="text"
          placeholder="Search by title or artist…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            maxWidth: 480,
            padding: "12px 16px",
            marginBottom: 24,
            background: "var(--surface)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "var(--radius)",
            color: "var(--text)",
            fontSize: 14,
            fontFamily: "var(--font-body)",
            outline: "none",
          }}
        />

        {searchResults !== null && (
          <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 16, fontFamily: "var(--font-mono)" }}>
            {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          {displayedSongs.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              selected={selectedSong?.id === song.id}
              onSelect={handleSelect}
            />
          ))}
        </div>

        {hasMore && (
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            style={{
              marginTop: 24,
              padding: "10px 20px",
              background: "var(--surface)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "var(--radius)",
              color: "var(--text)",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              fontSize: 14,
            }}
          >
            Load more ({allSongs.length - visibleCount} remaining)
          </button>
        )}

        {searchResults !== null && searchResults.length === 0 && (
          <div style={{ color: "var(--text-muted)", marginTop: 20, fontSize: 14 }}>
            No songs found for "{searchQuery}"
          </div>
        )}
      </div>

      <RecommendationDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        sourceSong={selectedSong}
        recommendations={recommendations}
        loading={loadingRecs}
      />
    </div>
  );
}

export default App;