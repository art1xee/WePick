import React, { useEffect, useState } from "react";
import { getByGenres } from "../api/tmdb";

export default function Results({ movies, onRestart }) {
  const [tmdbResults, setTmdbResults] = useState([]);
  const [idx, setIdx] = useState(0);

  // пример: получить из TMDB по жанрам "action, romance"
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getByGenres("movie", [28, 10749]); // ID жанров TMDB
        setTmdbResults(res.results);
      } catch (e) {
        console.error("TMDB error", e);
      }
    }
    fetchData();
  }, []);

  if (!tmdbResults.length)
    return <div className="screen"><p>Завантаження...</p></div>;

  const current = tmdbResults[idx];
  const next = () => setIdx((i) => (i + 1) % tmdbResults.length);

  return (
    <div className="screen">
      <h2>Зустріньте свою кінопару!</h2>
      <h3>{current.title} ({current.release_date?.slice(0,4)})</h3>
      <img
        src={`https://image.tmdb.org/t/p/w500${current.poster_path}`}
        alt={current.title}
        style={{ borderRadius: 12, maxWidth: "100%", marginBottom: 10 }}
      />
      <p>{current.overview}</p>
      <div style={{ marginTop: 10 }}>
        <a
          href={`https://www.imdb.com/title/${current.imdb_id ?? ""}`}
          target="_blank"
          rel="noreferrer"
          className="btn"
        >
          Більше детальній
        </a>
        <button onClick={next} className="btn" style={{ marginLeft: 8 }}>
          Виділили — показати інше
        </button>
      </div>
    </div>
  );
}
