import { deleteBook } from "../api";
import { useState } from "react";

export default function BookList({ books, onDeleted }) {
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await deleteBook(id);
      onDeleted();
    } finally {
      setDeleting(null);
    }
  };

  if (books.length === 0) {
    return (
      <div style={styles.empty}>
        <p>עדיין לא הוספת ספרים. התחל להוסיף ספרים שקראת!</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📚 הספרים שקראתי ({books.length})</h2>
      <ul style={styles.list}>
        {books.map((book) => (
          <li key={book.id} style={styles.item}>
            <div style={styles.bookInfo}>
              <span style={styles.bookTitle}>{book.title}</span>
              <span style={styles.bookAuthor}>{book.author}</span>
            </div>
            <button
              style={styles.deleteBtn}
              onClick={() => handleDelete(book.id)}
              disabled={deleting === book.id}
              title="מחק ספר"
            >
              {deleting === book.id ? "..." : "✕"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  container: { background: "#fff", borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  title: { fontSize: "1.2rem", marginBottom: 16, color: "#4a3728" },
  empty: { background: "#fff", borderRadius: 12, padding: 24, marginBottom: 24, textAlign: "center", color: "#888", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  list: { listStyle: "none", display: "flex", flexDirection: "column", gap: 8 },
  item: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "#fdf8f4", borderRadius: 8, border: "1.5px solid #ede3d8" },
  bookInfo: { display: "flex", flexDirection: "column", gap: 2 },
  bookTitle: { fontWeight: 600, color: "#2c2c2c" },
  bookAuthor: { fontSize: "0.85rem", color: "#888" },
  deleteBtn: { background: "none", border: "none", color: "#ccc", fontSize: "1rem", padding: "4px 8px", borderRadius: 4, transition: "color 0.2s" },
};
