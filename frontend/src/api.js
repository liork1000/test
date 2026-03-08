import axios from "axios";

const api = axios.create({ baseURL: "" });

export const parseBook = (rawText) =>
  api.post("/books/parse", { raw_text: rawText }).then((r) => r.data);

export const addBook = (title, author) =>
  api.post("/books/", { title, author }).then((r) => r.data);

export const listBooks = () => api.get("/books/").then((r) => r.data);

export const deleteBook = (id) => api.delete(`/books/${id}`);

export const getRecommendations = (count) =>
  api.post("/recommendations/", { count }).then((r) => r.data);
