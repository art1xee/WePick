import React, { useEffect, useState } from "react";
import { getByGenres } from "../api/tmdb";

const labels = {
  ua: {
    title: "Зустріньте свою кінопару!",
    info_button: "Більше деталей..",
    more_button: "Бачили - показати інше",
    loading: "Завантаження...",
    name: "Назва: ",
    no_results: "На жаль, нічого не знайдено. Спробуйте інші параметри."
  },
  ru: {
    title: "Встретьте свою кино-пару!",
    info_button: "Больше деталей..",
    more_button: "Видели - показать другое",
    loading: "Загрузка...",
    name: "Название: ",
    no_results: "К сожалению, ничего не найдено. Попробуйте другие параметры."
  },
  en: {
    title: "Meet your movie match!",
    info_button: "More details..",
    more_button: "Seen it - show another",
    loading: "Loading...",
    name: "Name: ",
    no_results: "Sorry, nothing found. Try different parameters."
  }
};

// Маппинг жанров на TMDB ID
const GENRE_MAPPING = {
  // Основные жанры
  "Action": 28, "Бойовик": 28, "Боевик": 28,
  "Adventure": 12, "Пригоди": 12, "Приключения": 12,
  "Comedy": 35, "Комедія": 35, "Комедия": 35,
  "Drama": 18, "Драма": 18,
  "Romance": 10749, "Романтика": 10749,
  "Fantasy": 14, "Фентезі": 14, "Фэнтези": 14,
  "Sci-Fi": 878, "Наукова фантастика": 878, "Научная фантастика": 878,
  "Mystery": 9648, "Містика / Детектив": 9648, "Мистика / Детектив": 9648,
  "Horror": 27, "Жахи": 27, "Ужасы": 27,
  "Thriller": 53, "Трилер": 53, "Триллер": 53,
  "Crime": 80, "Кримінал": 80, "Криминал": 80,
  "Family": 10751, "Сімейний": 10751, "Семейный": 10751,
  "Musical": 10402, "Мюзикл": 10402,
  "Documentary": 99, "Документальний": 99, "Документальный": 99,
  "Western": 37, "Вестерн": 37,
  "War": 10752, "Військовий": 10752, "Военный": 10752,
  "Historical": 36, "Історичний": 36, "Исторический": 36,
  "Sports": 9805, "Спорт": 9805,
};

export default function Results({ 
  movies, 
  onRestart, 
  lang = "ua",
  participants = [],
  contentType = "movie"
}) {
  const [tmdbResults, setTmdbResults] = useState([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(false);

        // Собираем все лайки пользователей
        const allLikes = participants.flatMap(p => p.likes || []);
        
        // Конвертируем названия жанров в TMDB ID
        const genreIds = [...new Set(
          allLikes
            .map(genre => GENRE_MAPPING[genre])
            .filter(id => id !== undefined)
        )];

        console.log('🎬 Searching for genres:', allLikes);
        console.log('🎬 TMDB Genre IDs:', genreIds);

        // Если нет жанров, используем популярные
        if (genreIds.length === 0) {
          console.log('⚠️ No genre IDs found, fetching popular content');
          const res = await getPopularContent(contentType);
          setTmdbResults(res.results || []);
        } else {
          // Запрашиваем по жанрам
          const res = await getByGenres(contentType, genreIds);
          console.log('✅ TMDB Response:', res);
          
          if (res.results && res.results.length > 0) {
            // Фильтруем по декаде если указана
            let filtered = res.results;
            
            const decades = participants
              .map(p => p.decade)
              .filter(d => d !== null && d !== undefined);
            
            if (decades.length > 0) {
              filtered = filtered.filter(movie => {
                const year = movie.release_date?.slice(0, 4);
                const movieDecade = Math.floor(year / 10) * 10;
                return decades.some(d => movieDecade === d || Math.abs(movieDecade - d) <= 10);
              });
            }
            
            setTmdbResults(filtered.length > 0 ? filtered : res.results);
          } else {
            setError(true);
          }
        }
      } catch (e) {
        console.error("❌ TMDB error:", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [participants, contentType]);

  // Функция для получения популярного контента (fallback)
  async function getPopularContent(type) {
    const url = `https://api.themoviedb.org/3/discover/${type}`;
    const params = new URLSearchParams({
      api_key: import.meta.env.VITE_TMDB_KEY,
      sort_by: 'popularity.desc',
      page: '1'
    });
    
    const res = await fetch(`${url}?${params}`);
    if (!res.ok) throw new Error("TMDB fetch error");
    return await res.json();
  }

  if (loading) {
    return (
      <div className="result-screen">
        <p>{labels[lang].loading}</p>
      </div>
    );
  }

  if (error || !tmdbResults.length) {
    return (
      <div className="result-screen">
        <h2 className="result-title">😔</h2>
        <p>{labels[lang].no_results}</p>
        <button onClick={onRestart} className="btn-reset" style={{ marginTop: 20 }}>
          {lang === 'ua' ? 'Почати спочатку' : lang === 'ru' ? 'Начать сначала' : 'Start over'}
        </button>
      </div>
    );
  }

  const current = tmdbResults[idx];
  const next = () => setIdx((i) => (i + 1) % tmdbResults.length);

  return (
    <div className="result-screen">
      <h2 className="result-title">{labels[lang].title}</h2>
      <h3 className="result-name">
        {labels[lang].name}
        {current.title || current.name} ({(current.release_date || current.first_air_date)?.slice(0, 4)})
      </h3>
      
      {current.poster_path ? (
        <img
          src={`https://image.tmdb.org/t/p/w500${current.poster_path}`}
          alt={current.title || current.name}
          style={{ borderRadius: 12, maxWidth: "40%", marginBottom: 10 }}
        />
      ) : (
        <div className="poster-placeholder">
          {lang === 'ua' ? 'Немає постера' : lang === 'ru' ? 'Нет постера' : 'No poster'}
        </div>
      )}
      
      <div style={{ marginTop: 10 }}>
        <a
          href={`https://www.themoviedb.org/${contentType}/${current.id}`}
          target="_blank"
          rel="noreferrer"
          className="btn-info"
        >
          {labels[lang].info_button}
        </a>
        <button onClick={next} className="btn-more" style={{ marginLeft: 8 }}>
          {labels[lang].more_button}
        </button>
      </div>
    </div>
  );
}