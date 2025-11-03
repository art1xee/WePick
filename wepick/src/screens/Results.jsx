import React, { useState } from "react";

//localization obj for various texts on the page based on language.
const labels = {
  ua: {
    title: "Зустріньте свою кінопару!",
    info_button: "Більше деталей..",
    more_button: "Бачили - показати інше",
    reload_button: "Оновити підбір",
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
    reload_button: "Обновить подборку",
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
    reload_button: "Refresh",
    restart_button: "Start over",
    reload_button: "Reload search",
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

/**
 * Generated a URL to an external stie (MyAnimeList or IMDB) for more details about the content.
 * @param {obj} movie - the movie or anime obj
 * @param {*} contentType - the type of content ('anime', 'movie' etc.)
 * @returns {string} A URL for detailed information.
 */
const linksAboutContent = (movie, contentType) => {
  // if it is anime and has direct MAL URL, use it.
  if (contentType === "anime" && movie.malUrl) {
    return movie.malUrl;
  }
  // if it is anime wihout a direct URL, creare a search query for MAL.
  if (contentType === "anime") {
    const searchQuery = encodeURIComponent(movie.title);
    return `https://myanimelist.net/anime.php?q=${searchQuery}`;
  }
  // for movies and series, create a search qeury for IMDb.
  const searchQuery = encodeURIComponent(`${movie.title} ${movie.year}`);
  return `https://www.imdb.com/find?q=${searchQuery}`;
};

/**
 * A simple component to disply a loading animation and text.
 * @param {obj} props - component props.
 * @param {obj} props.text - localized text obj.
 */

const LoadingScreen = ({ text }) => (
  <div className="result-screen">
    <div className="loading-animation">
      <div className="film-logo" style={{ fontSize: "100px" }}>
        🎬
      </div>
      <h2>{text.loading}</h2>
    </div>
  </div>
);

/**
 * A component to display when no result are found.
 * @param {obj} props - component props.
 * @param {obj} props.text - localized text object.
 * @param {function} props.onRestart - callback to start the process over.
 */
const NoResult = ({ text, onRestart }) => (
  <div className="result-noresult-screen">
    <h2 className="result-noresult-title">{text.no_results}</h2>
    <p>{text.no_results_desc}</p>
    <div style={{ margin: "30px" }}>
      <button onClick={onRestart} className="btn btn-active">
        {text.restart_button}
      </button>
    </div>
  </div>
);

/**
 * A component to display a wirning message if one exist.
 * @param {obj} props - Component props.
 * @param {obj} props.message - the warning message to display
 */
const WarningMessage = ({ message }) =>
  message && <div className="result-warning-message">{message}</div>;

/**
 * A header component for the results screen.
 * @param {obj} props - Component props
 * @param {string} props.title - the main title text.
 * @param {string} props.warningMessage - an optional warning message
 */
const ResultHeader = ({ title, warningMessage }) => (
  <>
    <h2 className="result-title">{title}</h2>
    <WarningMessage message={warningMessage} />
  </>
);

/**
 * A component that displays the detail of a single movie\anime result.
 * @param {obj} props - component props.
 * @param {obj} props.current - the movie/anime object to display
 * @param {string} props.contentType - The type of content.
 * @param {object} props.text - localized text object
 */
const ResultCard = ({ current, contentType, text }) => (
  <div className="result-content">
    <h3 className="result-name">
      {current.title}
      {current.year && ` (${current.year})`}
    </h3>
    {/* display poster image or a placeholder if not available*/}
    {current.poster ? (
      <img src={current.poster} alt={current.title} className="result-poster" />
    ) : (
      <div className="poster-placehholder">🎬</div>
    )}

    <div className="result-info">
      {/* display rating if available */}

      {current.rating && (
        <p>
          <strong>{text.rating}</strong> ⭐ {current.rating.toFixed(1)}/10
        </p>
      )}
      {/*displays content type for anime*/}
      {contentType === "anime" && current.type && (
        <p>
          <strong>{text.type}</strong>
          {current.type}
        </p>
      )}

      {/* displays episodes count for anime*/}
      {contentType === "anime" && current.episodes && (
        <p>
          <strong>{text.episodes}</strong> {current.episodes}
        </p>
      )}
    </div>
  </div>
);

/**
 * A component that holds all the action buttons for the result screen.
 * @param {obj} props - component props.
 * @param {string} props.detailLinks - URL for the detail button.
 * @param {obj} props.text - lcoalized text object
 * @param {function} props.onNext - callback to show the next result
 * @param {function} props.onReload - callback to reload the search
 * @param {function} props.onRestart - callback to start over.
 * @returns
 */
const ResultActions = ({ detailsLinks, text, onNext, onReload, onRestart }) => (
  <div className="result-actions" style={{ marginTop: "30px" }}>
    {/* button to show the next item in the results list */}
    <div className="result-more-button">
      <button
        onClick={onNext}
        className="btn btn-active"
        style={{ marginRight: "10px" }}
      >
        {text.more_button}
      </button>
    </div>

    {/* button to trigger a new search woth the same preferences */}
    <div className="result-reload-button">
      <button
        onClick={onReload}
        className="btn btn-active"
        style={{ marginRight: "10px" }}
      >
        {text.reload_button}
      </button>
    </div>
    {/* button to ga back to the very first screen */}
    <div className="result-restart-button">
      <button onClick={onRestart} className="btn btn-reset">
        {text.restart_button}
      </button>
    </div>
  </div>
);

//================== RESULT SCREEN COMPONENT ==========================

/**
 * The main component for displaying the results of the content search.
 * It handles loading states, no-result states, and cycles through the matched content.
 * @param {object} props - component props.
 * @param {array} props.movie - an array of movie/anime objects.
 * @param {function} props.onRestart - callback ro restart the entire flow.
 * @param {function} props.onReload - callback to fetch a new set of results with the same preferences.
 * @param {string} props.lang - the current language code.
 * @param {boolean} props.loading - flag indicating if the content is currently being fetched
 * @param {boolean} props.didWeakenFiltes - flas indicating if search filters were relaxed
 * @param {boolean} props.characterName - the name of the character partner, for warning message.
 * @param {string} props.contentType - the type of content being displayed.
 */
export default function Results({
  movies = [],
  onRestart,
  onReload, // Принимаем onReload
  lang = "ua",
  loading = false,
  didWeakenFilters = false,
  characterName = null,
  contentType = null,
}) {
  // state to keep track of the current index on the movies array.
  const [idx, setIdx] = useState(0);
  // get the localized text object for the current language.
  const text = labels[lang];

  // if loading, show the loading screen and stop.
  if (loading) {
    return <LoadingScreen text={text} />;
  }

  // if there are no movies, show 'No result' screen and stop.
  if (!movies || movies.length === 0) {
    return <NoResult text={text} onRestart={onRestart} />;
  }

  // the currently displayed movie object.
  const current = movies[idx];
  // function to advance to the next movie, looping back to the start if at the end.
  const next = () => setIdx((i) => (i + 1) % movies.length);

  // format the warning message if filters were weakened, inserting the character`s name.
  const warningMessage = didWeakenFilters
    ? text.weakened_filters_warning.replace(
        "{characterName}",
        characterName || "персонажа"
      )
    : null;

  // getting the external details link for the current item.
  const detailsLinks = linksAboutContent(current, contentType);

  // main render of the result screen.
  return (
    <div className="result-screen">
      {/* render the header with title and optional warning */}
      <ResultHeader title={text.title} warningMessage={warningMessage} />
      {/* render the catd with the movie/anime details */}

      <ResultCard current={current} contentType={contentType} text={text} />

      {/* displays the current position in the result list (e.g., "1 / 10")*/}
      <div className="result-index">
        {idx + 1} / {movies.length}
      </div>

      {/* render the action buttons */}
      <ResultActions
        text={text}
        onNext={next}
        onReload={onReload}
        onRestart={onRestart}
      />
    </div>
  );
}
