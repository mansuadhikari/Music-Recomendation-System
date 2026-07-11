const FEATURES = [
    { key: "danceability", label: "D" },
    { key: "energy", label: "E" },
    { key: "valence", label: "V" },
    { key: "acousticness", label: "A" },
    { key: "tempo", label: "T" },
];

// tempo isn't 0-1 like the others, so normalize roughly for display (60-200bpm range)
function normalize(key, value) {
    if (key === "tempo") return Math.min(Math.max((value - 60) / 140, 0), 1);
    return Math.min(Math.max(value, 0), 1);
}

export default function Fingerprint({ song, size = "sm", color = "var(--accent)" }) {
    const barHeight = size === "lg" ? 48 : 24;
    const barWidth = size === "lg" ? 8 : 4;

    return (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: barHeight }}>
            {FEATURES.map(({ key }) => {
                const value = normalize(key, song[key]);
                return (
                    <div
                        key={key}
                        title={`${key}: ${song[key]}`}
                        style={{
                            width: barWidth,
                            height: `${Math.max(value * barHeight, 3)}px`,
                            background: color,
                            borderRadius: 2,
                            opacity: 0.5 + value * 0.5,
                        }}
                    />
                );
            })}
        </div>
    );
}