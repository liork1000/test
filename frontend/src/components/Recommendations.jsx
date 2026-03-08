import { useState } from "react";
import { getRecommendations } from "../api";

export default function Recommendations({ bookCount }) {
  const [count, setCount] = useState(5);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRecommend = async () => {
    setLoading(true);
    setError("");
    setRecs([]);
    try {
      const data = await getRecommendations(count);
      setRecs(data);
    } catch {
      setError("שגיאה בקבלת המלצות. נסה שוב.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>✨ המלצות אישיות</h2>

      <div style={styles.controls}>
        <label style={styles.label}>כמה המלצות?</label>
        <input
          type="number"
          min={1}
          max={20}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          style={styles.countInput}
        />
        <button
          style={styles.btn}
          onClick={handleRecommend}
          disabled={loading}
        >
          {loading ? "מחשב המלצות..." : "המלץ לי"}
        </button>
      </div>

      {bookCount === 0 && !loading && recs.length === 0 && (
        <p style={styles.hint}>הוסף ספרים שקראת לקבלת המלצות מותאמות אישית</p>
      )}

      {error && <p style={styles.error}>{error}</p>}

      {loading && (
        <div style={styles.loadingBox}>
          <p>🤔 Claude חושב על ספרים מושלמים עבורך...</p>
        </div>
      )}

      {recs.length > 0 && (
        <ul style={styles.recList}>
          {recs.map((rec, i) => (
            <li key={i} style={styles.recItem}>
              <div style={styles.recHeader}>
                <div style={styles.recCover}>
                  {rec.cover_url ? (
                    <img src={rec.cover_url} alt={rec.title} style={styles.coverImg} />
                  ) : (
                    <div style={styles.coverPlaceholder}>📖</div>
                  )}
                </div>
                <div style={styles.recInfo}>
                  <span style={styles.recTitle}>{rec.title}</span>
                  <span style={styles.recAuthor}>{rec.author}</span>
                  <p style={styles.recReason}>{rec.reason}</p>
                  {rec.description && (
                    <p style={styles.recDesc}>{rec.description}</p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const styles = {
  container: { background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  title: { fontSize: "1.2rem", marginBottom: 16, color: "#4a3728" },
  controls: { display: "flex", gap: 10, alignItems: "center", marginBottom: 16, flexWrap: "wrap" },
  label: { fontSize: "0.95rem", color: "#555" },
  countInput: { width: 70, padding: "8px 10px", border: "2px solid #e5d5c5", borderRadius: 8, textAlign: "center", fontSize: "1rem" },
  btn: { padding: "10px 24px", background: "#8b5e3c", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: "1rem" },
  hint: { color: "#aaa", fontStyle: "italic", textAlign: "center", padding: "16px 0" },
  error: { color: "#ef4444", margin: "8px 0" },
  loadingBox: { textAlign: "center", padding: 24, color: "#8b5e3c", fontSize: "1.1rem" },
  recList: { listStyle: "none", display: "flex", flexDirection: "column", gap: 16, marginTop: 8 },
  recItem: { background: "#fdf8f4", border: "1.5px solid #ede3d8", borderRadius: 10, padding: 16 },
  recHeader: { display: "flex", gap: 16 },
  recCover: { flexShrink: 0 },
  coverImg: { width: 60, height: 90, objectFit: "cover", borderRadius: 4, boxShadow: "0 2px 6px rgba(0,0,0,0.15)" },
  coverPlaceholder: { width: 60, height: 90, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", background: "#e5d5c5", borderRadius: 4 },
  recInfo: { display: "flex", flexDirection: "column", gap: 4 },
  recTitle: { fontWeight: 700, fontSize: "1.05rem", color: "#2c2c2c" },
  recAuthor: { fontSize: "0.85rem", color: "#888" },
  recReason: { fontSize: "0.9rem", color: "#5a4030", fontStyle: "italic", marginTop: 4 },
  recDesc: { fontSize: "0.8rem", color: "#aaa", marginTop: 4 },
};
