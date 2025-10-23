// tmdbService.js или где у вас вся логика API

const TMDB_KEY = import.meta.env.VITE_TMDB_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

const GENRE_MAPPING = {
  // Основные жанры (работают для всех языков через ID)
  Action: 28,
  Бойовик: 28,
  Боевик: 28,

  Adventure: 12,
  Пригоди: 12,
  Приключения: 12,

  Comedy: 35,
  Комедія: 35,
  Комедия: 35,

  Drama: 18,
  Драма: 18,

  Romance: 10749,
  Романтика: 10749,

  Fantasy: 14,
  Фентезі: 14,
  Фэнтези: 14,

  "Sci-Fi": 878,
  "Наукова фантастика": 878,
  "Научная фантастика": 878,

  Mystery: 9648,
  "Містика / Детектив": 9648,
  "Мистика / Детектив": 9648,

  Horror: 27,
  Жахи: 27,
  Ужасы: 27,

  Thriller: 53,
  Трилер: 53,
  Триллер: 53,

  Crime: 80,
  Кримінал: 80,
  Криминал: 80,

  Family: 10751,
  Сімейний: 10751,
  Семейный: 10751,

  Musical: 10402,
  Мюзикл: 10402,

  Documentary: 99,
  Документальний: 99,
  Документальный: 99,

  Western: 37,
  Вестерн: 37,

  War: 10752,
  Військовий: 10752,
  Военный: 10752,

  Historical: 36,
  Історичний: 36,
  Исторический: 36,
};
// Преобразуем названия жанров в TMDb IDs
const genresToIds = (genresName) => {
  if (!genresName || genresName.length === 0) return [];

  return genresName.map((name) => GENRE_MAPPING[name]).filter(Boolean);
};

// ============================= ФИЛЬМЫ =============================
export const fetchMovies = async (
  likes,
  dislikes,
  decade,
  language = "en-US"
) => {
  try {
    const likeIds = genresToIds(likes);
    const dislikeIds = genresToIds(dislikes);

    const params = new URLSearchParams({
      api_key: TMDB_KEY,
      sort_by: "popularity.desc",
      with_genres: likeIds.join(","),
      without_genres: dislikeIds.join(","),
      vote_count_gte: "100",
      language,
    }).toString();

    const response = await fetch(`${BASE_URL}/discover/movie?${params}`);
    const data = await response.json();

    return data.results.map((m) => ({
      id: m.id,
      title: m.title,
      overview: m.overview,
      rating: m.vote_average,
      poster: m.poster_path
        ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
        : null,
      year: m.release_date ? m.release_date.split("-")[0] : "N/A",
    }));
  } catch (error) {
    console.error("Ошибка при загрузке фильмов:", error);
    return [];
  }
};

// ============================= СЕРИАЛЫ =============================
export const fetchTVShows = async (
  likes,
  dislikes,
  decade,
  language = "en-US"
) => {
  try {
    const likeIds = genresToIds(likes);
    const dislikeIds = genresToIds(dislikes);

    const params = new URLSearchParams({
      api_key: TMDB_KEY,
      sort_by: "popularity.desc",
      with_genres: likeIds.join(","),
      without_genres: dislikeIds.join(","),
      vote_count_gte: "100",
      language,
    }).toString();

    const response = await fetch(`${BASE_URL}/discover/tv?${params}`);
    const data = await response.json();

    return data.results.map((s) => ({
      id: s.id,
      title: s.name || s.original_name,
      overview: s.overview,
      rating: s.vote_average,
      poster: s.poster_path
        ? `https://image.tmdb.org/t/p/w500${s.poster_path}`
        : null,
      year: s.first_air_date ? s.first_air_date.split("-")[0] : "N/A",
    }));
  } catch (error) {
    console.error("Ошибка при загрузке сериалов:", error);
    return [];
  }
};

// ============================= АНИМЕ =============================
// фильтруем по оригинальному языку: 'ja' (японский)
export const fetchAnime = async (
  likes,
  dislikes,
  decade,
  language = "ja-JP"
) => {
  try {
    const likeIds = genresToIds(likes);
    const dislikeIds = genresToIds(dislikes);

    const params = new URLSearchParams({
      api_key: TMDB_KEY,
      sort_by: "popularity.desc",
      with_genres: likeIds.join(","),
      without_genres: dislikeIds.join(","),
      with_original_language: "ja",
      vote_count_gte: "50",
      language,
    }).toString();

    // Аниме обычно идут в "tv"
    const response = await fetch(`${BASE_URL}/discover/tv?${params}`);
    const data = await response.json();

    return data.results.map((a) => ({
      id: a.id,
      title: a.name || a.original_name,
      overview: a.overview,
      rating: a.vote_average,
      poster: a.poster_path
        ? `https://image.tmdb.org/t/p/w500${a.poster_path}`
        : null,
      year: a.first_air_date ? a.first_air_date.split("-")[0] : "N/A",
    }));
  } catch (error) {
    console.error("Ошибка при загрузке аниме:", error);
    return [];
  }
};

// ============================= ДВУХУРОВНЕВЫЙ ПОИСК =============================
const _fetchContent = async (
  contentType,
  likes,
  dislikes,
  decade,
  language
) => {
  if (contentType === "anime")
    return fetchAnime(likes, dislikes, decade, language);
  if (contentType === "series")
    return fetchTVShows(likes, dislikes, decade, language);
  return fetchMovies(likes, dislikes, decade, language);
};

export const fetchContentForParticipants = async (
  participants,
  contentType,
  language = "en-US"
) => {
  const user = participants.find((p) => !p.isCharacter);
  const character = participants.find((p) => p.isCharacter);

  let allLikes = [...new Set(participants.flatMap((p) => p.likes || []))];
  let allDislikes = [...new Set(participants.flatMap((p) => p.dislikes || []))];
  const decade = participants[0]?.decade || 2000;

  let results = await _fetchContent(
    contentType,
    allLikes,
    allDislikes,
    decade,
    language
  );
  let didWeaken = false;

  if (results.length === 0 && character) {
    console.warn("Нет результатов — ослабляем фильтры");
    results = await _fetchContent(
      contentType,
      user?.likes || [],
      user?.dislikes || [],
      decade,
      language
    );
    didWeaken = true;
  }

  return {
    results,
    didWeakenFilters: didWeaken,
    characterName: character ? character.name : null,
  };
};

export default {
  fetchMovies,
  fetchTVShows,
  fetchAnime,
  fetchContentForParticipants,
};
