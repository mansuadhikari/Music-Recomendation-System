import { useEffect } from "react";
import Fingerprint from "./Fingerprint";

export default function RecommendationDrawer({ open, onClose, sourceSong, recommendations, loading }) {
    // close on Escape key
    useEffect(() => {
        const handler = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(2px)",
                    opacity: open ? 1 : 0,
                    pointerEvents: open ? "auto" : "none",
                    transition: "opacity 0.25s ease",
                    zIndex: 40,
                }}
            />

            {/* Drawer panel */}
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    right: 0,
                    height: "100vh",
                    width: "min(420px, 100vw)",
                    background: "var(--surface)",
                    borderLeft: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "-8px 0 32px rgba(0,0,0,0.35)",
                    transform: open ? "translateX(0)" : "translateX(100%)",
                    transition: "transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)",
                    zIndex: 50,
                    overflowY: "auto",
                    padding: "28px",
                }}
            >
                <button
                    onClick={onClose}
                    aria-label="Close"
                    style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-muted)",
                        fontSize: 22,
                        cursor: "pointer",
                        padding: 4,
                        lineHeight: 1,
                        marginBottom: 20,
                    }}
                >
                    ×
                </button>

                {sourceSong && (
                    <>
                        <div style={{ marginBottom: 24 }}>
                            <div style={{ color: "var(--text-muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)" }}>
                                Audio fingerprint match
                            </div>
                            <h2 style={{ margin: "4px 0 0", fontSize: 22 }}>{sourceSong.title}</h2>
                            <div style={{ color: "var(--text-muted)" }}>{sourceSong.artist}</div>
                            <div style={{ marginTop: 12 }}>
                                <Fingerprint song={sourceSong} size="lg" />
                            </div>
                        </div>

                        {loading && (
                            <div style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
                                Analyzing fingerprint…
                            </div>
                        )}

                        {!loading && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {recommendations.map((rec) => (
                                    <div
                                        key={rec.song.id}
                                        style={{
                                            background: "var(--surface-hover)",
                                            borderRadius: "var(--radius)",
                                            padding: "14px 16px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            gap: 12,
                                        }}
                                    >
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontWeight: 500, fontSize: 14 }}>{rec.song.title}</div>
                                            <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{rec.song.artist} · {rec.song.genre}</div>
                                        </div>
                                        <Fingerprint song={rec.song} color="var(--data)" />
                                        <div style={{
                                            fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--data)",
                                            minWidth: 44, textAlign: "right",
                                        }}>
                                            {(rec.similarity_score * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}