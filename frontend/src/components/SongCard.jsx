import Fingerprint from "./Fingerprint";

export default function SongCard({ song, onSelect, selected }) {
  return (
    <button
      onClick={() => onSelect(song)}
      style={{
        background: selected ? "var(--accent-soft)" : "var(--surface)",
        border: selected ? "1px solid var(--accent)" : "1px solid transparent",
        borderRadius: "var(--radius)",
        padding: "16px",
        textAlign: "left",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        color: "var(--text)",
        transition: "background 0.15s ease",
      }}
      onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = "var(--surface-hover)"; }}
      onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = "var(--surface)"; }}
    >
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15 }}>
        {song.title}
      </div>
      <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{song.artist}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <span style={{
          fontSize: 11, color: "var(--data)", fontFamily: "var(--font-mono)",
          textTransform: "uppercase", letterSpacing: "0.05em",
        }}>
          {song.genre}
        </span>
        <Fingerprint song={song} />
      </div>
    </button>
  );
}