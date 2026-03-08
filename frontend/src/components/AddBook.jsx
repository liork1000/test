import { useState } from "react";
import { parseBook, addBook } from "../api";

export default function AddBook({ onAdded }) {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleParse = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    setParsed(null);
    try {
      const result = await parseBook(text.trim());
      setParsed(result);
    } catch {
      setError("שגיאה בניתוח הספר. נסה שוב.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!parsed) return;
    setLoading(true);
    try {
      await addBook(parsed.title, parsed.author);
      setText("");
      setParsed(null);
      onAdded();
    } catch {
      setError("שגיאה בשמירת הספר.");
    } finally {
      setLoading(false);
    }
  };

  const confidenceColor = {
    high: "#22c55e",
    medium: "#f59e0b",
    low: "#ef4444",
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>הוסף ספר שקראת</h2>
      <div style={styles.inputRow}>
        <input
          style={styles.input}
          value={text}
          onChange={(e) => { setText(e.target.value); setParsed(null); }}
          placeholder='לדוגמה: "הנסיך הקטן של אנטואן" או "ספר של יואב בלום"'
          onKeyDown={(e) => e.key === "Enter" && handleParse()}
          disabled={loading}
        />
        <button style={styles.btn} onClick={handleParse} disabled={loading || !text.trim()}>
          {loading ? "מנתח..." : "נתח"}
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {parsed && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={{ color: confidenceColor[parsed.confidence] || "#888" }}>
              ● {parsed.confidence === "high" ? "בטוח" : parsed.confidence === "medium" ? "סביר" : "לא בטוח"}
            </span>
          </div>
          <div style={styles.fields}>
            <label style={styles.label}>שם הספר</label>
            <input
              style={styles.fieldInput}
              value={parsed.title}
              onChange={(e) => setParsed({ ...parsed, title: e.target.value })}
            />
            <label style={styles.label}>מחבר</label>
            <input
              style={styles.fieldInput}
              value={parsed.author}
              onChange={(e) => setParsed({ ...parsed, author: e.target.value })}
            />
            {parsed.notes && <p style={styles.notes}>{parsed.notes}</p>}
          </div>
          <div style={styles.actions}>
            <button style={styles.confirmBtn} onClick={handleConfirm} disabled={loading}>
              {loading ? "שומר..." : "✔ אשר והוסף"}
            </button>
            <button style={styles.cancelBtn} onClick={() => setParsed(null)}>
              ✕ בטל
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { background: "#fff", borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  title: { fontSize: "1.2rem", marginBottom: 16, color: "#4a3728" },
  inputRow: { display: "flex", gap: 8 },
  input: { flex: 1, padding: "10px 14px", border: "2px solid #e5d5c5", borderRadius: 8, fontSize: "1rem", background: "#fdf8f4" },
  btn: { padding: "10px 20px", background: "#8b5e3c", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600 },
  error: { color: "#ef4444", marginTop: 8 },
  card: { marginTop: 16, background: "#fdf8f4", border: "2px solid #e5d5c5", borderRadius: 10, padding: 16 },
  cardHeader: { marginBottom: 12, fontSize: "0.9rem" },
  fields: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: "0.85rem", color: "#888", marginBottom: -4 },
  fieldInput: { padding: "8px 12px", border: "1.5px solid #d5c5b5", borderRadius: 6, background: "#fff", fontSize: "1rem" },
  notes: { fontSize: "0.85rem", color: "#888", fontStyle: "italic" },
  actions: { display: "flex", gap: 8, marginTop: 16 },
  confirmBtn: { flex: 1, padding: "10px 0", background: "#22c55e", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600 },
  cancelBtn: { padding: "10px 16px", background: "#f5f0eb", border: "1.5px solid #d5c5b5", borderRadius: 8, color: "#666" },
};
