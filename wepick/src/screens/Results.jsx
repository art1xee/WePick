import React, { useEffect, useState } from "react";
import { getByGenres } from "../api/tmdb";

const labels = {
  ua:{
    title: "Зустріньте свою кінопару!",
    info_button: "Більше детальній",
    more_button: "Бачили - показати інше",
    loading: "Завантаження...",
  },
  ru:{
    title: "Встретьте свою кино-пару!",
    info_button: "Больше деталей",
    more_button: "Видели - показать другое",
    loading: "Загрузка...",
  },
  en:{
    title: "Meet your movie match!",
    info_button: "More details",
    more_button: "Seen it - show another",
    loading: "Loading...",
  }


}



export default function Results({ movies, 
  onRestart, 
  lang = "ua", 

}) {
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
    return <div className="screen"><p>{labels[lang].loading}</p></div>;

  const current = tmdbResults[idx];
  const next = () => setIdx((i) => (i + 1) % tmdbResults.length);

  return (
    <div className="result-screen">
      <h2>{labels[lang].title}</h2>
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
          {labels[lang].info_button}
        </a>
        <button onClick={next} className="btn" style={{ marginLeft: 8 }}>
          {labels[lang].more_button}
        </button>
      </div>
    </div>
  );
}
