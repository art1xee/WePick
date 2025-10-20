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

// Получить фильмы по жанрам и декаде
export const fetchMovies = async (
  likes,
  dislikes,
  decade,
  language = "en-US"
) => {
  // ... (ваш существующий код fetchMovies)
  try {
    const likeIds = genresToIds(likes);
    const dislikeIds = genresToIds(dislikes);
    // ... (остальной код fetchMovies) ...
    const response = await fetch(`${BASE_URL}/discover/movie?${params}`);
    const data = await response.json();
    return data.results.map(/* ... */);
  } catch (error) {
    console.error("Ошибка при загрузке фильмов:", error);
    return [];
  }
};

// Получить сериалы
export const fetchTVShows = async (
  likes,
  dislikes,
  decade,
  language = "en-US"
) => {
  // ... (ваш существующий код fetchTVShows)
  try {
    const likeIds = genresToIds(likes);
    const dislikeIds = genresToIds(dislikes);
    // ... (остальной код fetchTVShows) ...
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
    return data.results.map(/* ... */);
  } catch (error) {
    console.error("Ошибка при загрузке сериалов:", error);
    return [];
  }
};

// =================================================================
// НОВАЯ ЛОГИКА TMDb SERVICE (с двухуровневым поиском)
// =================================================================

// ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ для выполнения запроса к API
const _fetchContent = async (
  contentType,
  allLikes,
  allDislikes,
  decade,
  language
) => {
  let results = [];
  if (contentType === "movie" || contentType === "anime") {
    results = await fetchMovies(allLikes, allDislikes, decade, language);
  } else if (contentType === "series") {
    results = await fetchTVShows(allLikes, allDislikes, decade, language);
  }
  return results.sort((a, b) => b.rating - a.rating).slice(0, 20);
};

// Получить контент для двух участников (обновлено для двухуровневого поиска)
export const fetchContentForParticipants = async (
  participants,
  contentType,
  language = "en-US"
) => {
  // 1. Идентифицируем участников
  const user = participants.find((p) => !p.isCharacter);
  const character = participants.find((p) => p.isCharacter);

  let didWeaken = false;

  // 2. Объединяем ВСЕ лайки и дизлайки (Попытка 1)
  let allLikes = [...new Set(participants.flatMap((p) => p.likes || []))];
  let allDislikes = [...new Set(participants.flatMap((p) => p.dislikes || []))];

  // Берем декаду первого участника
  const decade = participants[0]?.decade || 2000;

  // ПОПЫТКА 1: Строгий поиск
  let results = await _fetchContent(
    contentType,
    allLikes,
    allDislikes,
    decade,
    language
  );

  // ПОПЫТКА 2: Ослабленный поиск (если нет результатов И есть персонаж)
  if (results.length === 0 && character) {
    console.warn(
      "Нет результатов с полными фильтрами. Повторный поиск без жанров персонажа."
    );

    // Пересчитываем лайки/дизлайки, ИСКЛЮЧАЯ те, что от персонажа
    const userLikes = user?.likes || [];
    const userDislikes = user?.dislikes || [];

    allLikes = [...new Set(userLikes)];
    allDislikes = [...new Set(userDislikes)];

    // Повторный запрос
    results = await _fetchContent(
      contentType,
      allLikes,
      allDislikes,
      decade,
      language
    );

    didWeaken = true;
  }

  // Возвращаем объект, чтобы передать результаты и флаг
  return {
    results,
    didWeakenFilters: didWeaken,
    characterName: character ? character.name : null,
  };
};

export default {
  fetchMovies,
  fetchTVShows,
  fetchContentForParticipants,
};
