import React, { useState } from "react";

const labels = {
  ua: {
    title: "Зустріньте свою кінопару!",
    info_button: "Більше деталей..",
    more_button: "Бачили - показати інше",
    restart_button: "Почати спочатку",
    loading: "Завантаження...",
    name: "Назва: ",
    year: "Рік: ",
    rating: "Рейтинг: ",
    overview: "Опис:",
    no_results: "Немає результатів 😢",
    no_results_desc: "Спробуйте змінити свої вподобання",
    weakened_filters_warning:
      "⚠️ Ми розширили пошук. Фільтри жанрів для {characterName} були проігноровані, щоб знайти хоч якийсь контент.",
    type: "Тип: ",
    episodes: "Епізоди: ",
  },
  ru: {
    title: "Встретьте свою кино-пару!",
    info_button: "Больше деталей..",
    more_button: "Видели - показать другое",
    restart_button: "Начать сначала",
    loading: "Загрузка...",
    name: "Название: ",
    year: "Год: ",
    rating: "Рейтинг: ",
    overview: "Описание:",
    no_results: "Нет результатов 😢",
    no_results_desc: "Попробуйте изменить свои предпочтения",
    weakened_filters_warning:
      "⚠️ Мы расширили поиск. Фильтры жанров для {characterName} были проигнорированы, чтобы найти хоть какой-то контент.",
    type: "Тип: ",
    episodes: "Эпизоды: ",
  },
  en: {
    title: "Meet your movie match!",
    info_button: "More details..",
    more_button: "Seen it - show another",
    restart_button: "Start over",
    loading: "Loading...",
    name: "Name: ",
    year: "Year: ",
    rating: "Rating: ",
    overview: "Overview:",
    no_results: "No results found 😢",
    no_results_desc: "Try changing your preferences",
    weakened_filters_warning:
      "⚠️ We broadened the search. Genre filters for {characterName} were ignored to find any content.",
    type: "Type: ",
    episodes: "Episodes: ",
  },
};

const linksAboutContent = (movie, contentType) => {
  // if it is anime and has direct MAL link
  if (contentType === "anime" && movie.malUrl) {
    return movie.malUrl;
  }
  // if it is anime but no malUrl, search on MAL
  if (contentType === "anime") {
    const searchQuery = encodeURIComponent(movie.title);
    return `https://myanimelist.net/anime.php?q=${searchQuery}`;
  }
  // for movies and series use a IMDB
  const searchQuery = encodeURIComponent(`${movie.title} ${movie.year}`);
  return `https://www.imdb.com/find?q=${searchQuery}`;
};

const LoadingScreen = ({text}) => (
  <div className="result-screen">
    <div className="loading-animation">
      <div className="film-logo" style={{ fontSize: "100px" }}>
        🎬
      </div>
      <h2>{text.loading}</h2>
    </div>
  </div>
);

const NoResult = ({ text, onRestart }) => (
  <div className="result-screen">
    <h2 className="result-title">{text.no_results}</h2>
    <p style={{ fontSize: "14px", marginTop: "20px" }}>
      {text.no_results_desc}
    </p>
    <div style={{ margin: "30px" }}>
      <button onClick={onRestart} className="btn btn-active">
        {text.restart_button}
      </button>
    </div>
  </div>
);

const WarningMessage = ({ message }) =>
  message && <div className="result-warning-message">{message}</div>;

const ResultHeader = ({ title, warningMessage }) => (
  <>
    <h2 className="result-title">{title}</h2>
    <WarningMessage message={warningMessage} />
  </>
);

const ResultCard = ({ current, contentType, text }) => (
  <div className="result-content">
    <h3 className="result-name">
      {current.title}
      {current.year && ` (${current.year})`}
    </h3>

    {current.poster ? (
      <img
        src={current.poster}
        alt={current.title}
        className="result-poster"
        style={{
          borderRadius: "12px",
          maxWidth: "400px",
          width: "100%",
          marginBottom: "20px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
        }}
      />
    ) : (
      <div
        className="poster-placehholder"
        style={{
          width: "400px",
          height: "600px",
          marginBottom: "20px",
        }}
      >
        🎬
      </div>
    )}

    <div
      className="result-info"
      style={{
        textAlign: "center",
        color: "#111",
        maxWidth: "400px",
        margin: "0 auto",
      }}
    >
      {current.rating && (
        <p style={{ fontSize: "14px", marginBottom: "10px" }}>
          <strong>{text.rating}</strong> ⭐ {current.rating.toFixed(1)}/10
        </p>
      )}
                {/*content type display*/}
      {contentType === "anime" && current.type && (
        <p style={{fontSize:"14px", marginBottom:"10px"}}>
          <strong>{text.type}</strong>{current.type}
        </p>
      )}

                {/*episodes display*/}
      {contentType==="anime" && current.episodes &&(
        <p style={{fontSize:"14px", marginBottom:"10px"}}>
          <strong>{text.episodes}</strong> {current.episodes}
        </p>
      )}
    </div>
  </div>
);

const ResultActions = ({ detailsLinks, text, onNext, onRestart }) => (
  <div className="result-actions" style={{ marginTop: "30px" }}>
    <a
      href={detailsLinks}
      target="_blank"
      rel="noreferrer"
      className="btn btn-active"
      style={{ marginRight: "10px" }}
    >
      {text.info_button}
    </a>

    <button
      onClick={onNext}
      className="btn btn-active"
      style={{ marginRight: "10px" }}
    >
      {text.more_button}
    </button>

    <button onClick={onRestart} className="btn btn-reset">
      {text.restart_button}
    </button>
  </div>
);


//================== RESULT SCREEN COMPONENT ==========================
export default function Results({
  movies = [],
  onRestart,
  lang = "ua",
  loading = false,
  didWeakenFilters = false,
  characterName = null,
  contentType = null,
}) {
  const [idx, setIdx] = useState(0);
  const text = labels[lang];

  // show loading screen
  if (loading) {
    return <LoadingScreen text={text} />;
  }

  // if we dont have any content to show
  if (!movies || movies.length === 0) {
    return <NoResult text={text} onRestart={onRestart} />;
  }

  const current = movies[idx];
const next = () => setIdx((i) => (i + 1) % movies.length);

// formating a wanring message if filters were weakened
const warningMessage = didWeakenFilters
  ? text.weakened_filters_warning.replace(
      "{characterName}",
      characterName || "персонажа"
    )
  : null;

// getting links about content
  const detailsLinks = linksAboutContent(current, contentType);

// main render
  return (
  <div className="result-screen">
    <ResultHeader title={text.title} warningMessage={warningMessage} />
    <ResultCard current={current} contentType={contentType} text={text} />
    <ResultActions
      detailsLinks={detailsLinks}
      text={text}
      onNext={next}
      onRestart={onRestart}
    />
    <div className="result-index">
      {idx + 1} / {movies.length}
    </div>
  </div>
  )
}


