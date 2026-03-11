import { useEffect, useState } from "react";
import AddBook from "./components/AddBook";
import BookList from "./components/BookList";
import Recommendations from "./components/Recommendations";
import SelfInquiryGame from "./components/SelfInquiryGame";
import { listBooks } from "./api";

export default function App() {
  const [books, setBooks] = useState([]);
  const [showGame, setShowGame] = useState(false);

  const fetchBooks = async () => {
    try {
      const data = await listBooks();
      setBooks(data);
    } catch {
      // server might not be up yet
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  if (showGame) {
    return <SelfInquiryGame onBack={() => setShowGame(false)} />;
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.logo}>📚 ממליץ הספרים</h1>
        <p style={styles.subtitle}>הזן ספרים שקראת, קבל המלצות מותאמות אישית</p>
        <button style={styles.gameBtn} onClick={() => setShowGame(true)}>
          ✦ חדר החקירה – משחק תלת מימדי
        </button>
      </header>

      <main style={styles.main}>
        <div style={styles.leftCol}>
          <AddBook onAdded={fetchBooks} />
          <BookList books={books} onDeleted={fetchBooks} />
        </div>
        <div style={styles.rightCol}>
          <Recommendations bookCount={books.length} />
        </div>
      </main>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f5f0eb" },
  header: { background: "#4a3728", color: "#fff", padding: "24px 40px", textAlign: "center" },
  logo: { fontSize: "2rem", fontWeight: 800, marginBottom: 6 },
  subtitle: { fontSize: "1rem", color: "#c5a88a", fontWeight: 400, marginBottom: 14 },
  gameBtn: {
    display: "inline-block",
    marginTop: 10,
    background: "linear-gradient(135deg, #ffd700, #ff9500)",
    color: "#1a1a00",
    border: "none",
    borderRadius: 24,
    padding: "10px 26px",
    fontSize: "0.95rem",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 0 18px rgba(255,215,0,0.35)",
    letterSpacing: "0.02em",
    direction: "rtl",
  },
  main: {
    maxWidth: 1100,
    margin: "32px auto",
    padding: "0 20px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 24,
  },
  leftCol: {},
  rightCol: {},
};
