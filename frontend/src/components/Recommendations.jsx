import Fingerprint from "./Fingerprint";

export default function Recommendations({ sourceSong, recommendations }) {
    if (!sourceSong) return null;

    return (
        <div >
            <div style={{ marginBottom: 20 }}>
                <div style={{ color: "var(--text-muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)" }}>
                    Audio fingerprint match
                </div>
                <h2 style={{ margin: "4px 0 0" }}>{sourceSong.title}</h2>
                <div style={{ color: "var(--text-muted)" }}>{sourceSong.artist}</div>
                <div style={{ marginTop: 10 }}>
                    <Fingerprint song={sourceSong} size="lg" />
                </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {recommendations.map((rec) => (
                    <div
                        key={rec.song.id}
                        style={{
                            background: "var(--surface)",
                            borderRadius: "var(--radius)",
                            padding: "14px 18px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 16,
                        }}
                    >
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 500, fontSize: 14 }}>{rec.song.title}</div>
                            <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{rec.song.artist} · {rec.song.genre}</div>
                        </div>
                        <Fingerprint song={rec.song} color="var(--data)" />
                        <div style={{
                            fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--data)",
                            minWidth: 48, textAlign: "right",
                        }}>
                            {(rec.similarity_score * 100).toFixed(1)}%
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}