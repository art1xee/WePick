import { fetchAnime } from "../jikan/jikanService.js";
import { TMDB_GENRE_MAPPING } from "../../constants/genres.js";

const TMDB_KEY = import.meta.env.VITE_TMDB_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

const getDecadeDateRange = (decade) => {
  if (!decade) return {};
  const startYear = decade;
  const endYear = decade + 9;
  return {
    yearGte: `${startYear}-01-01`,
    yearLte: `${endYear}-12-31`,
  };
};

// Преобразуем названия жанров в TMDb IDs
const genresToIds = (genresName) => {
  if (!genresName || genresName.length === 0) return [];
  return genresName.map((name) => TMDB_GENRE_MAPPING[name]).filter(Boolean);
};

// ✅ НОВОЕ: Вспомогательная функция для получения нескольких страниц
const fetchMultiplePages = async (baseUrl, params, maxPages = 3) => {
  const allResults = [];

  for (let page = 1; page <= maxPages; page++) {
    try {
      const pageParams = new URLSearchParams({
        ...Object.fromEntries(params.entries()),
        page: page.toString(),
      }).toString();

      const response = await fetch(`${baseUrl}?${pageParams}`);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        allResults.push(...data.results);
      } else {
        break; // Если нет результатов, прекращаем загрузку
      }

      // Небольшая задержка между запросами для избежания rate limit
      await new Promise((resolve) => setTimeout(resolve, 250));
    } catch (error) {
      console.error(`Ошибка при загрузке страницы ${page}:`, error);
      break;
    }
  }

  return allResults;
};

// ✅ ОБНОВЛЕНО: Получаем больше фильмов (до 60 результатов)
export const fetchMovies = async (
  likes,
  dislikes,
  decade,
  language = "en-US"
) => {
  try {
    const likeIds = genresToIds(likes);
    const dislikeIds = genresToIds(dislikes);
    const dateRange = getDecadeDateRange(decade);

    const params = new URLSearchParams({
      api_key: TMDB_KEY,
      sort_by: "popularity.desc",
      with_genres: likeIds.join(","),
      without_genres: dislikeIds.join(","),
      ...(dateRange.yearGte && {
        "primary_release_date.gte": dateRange.yearGte,
      }),
      ...(dateRange.yearLte && {
        "primary_release_date.lte": dateRange.yearLte,
      }),
      vote_count_gte: "100",
      language,
    });

    // ✅ Получаем 3 страницы результатов (до 60 фильмов)
    const results = await fetchMultiplePages(
      `${BASE_URL}/discover/movie`,
      params,
      3
    );

    return results.map((m) => ({
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

// ✅ ОБНОВЛЕНО: Получаем больше сериалов (до 60 результатов)
export const fetchTVShows = async (
  likes,
  dislikes,
  decade,
  language = "en-US"
) => {
  try {
    const likeIds = genresToIds(likes);
    const dislikeIds = genresToIds(dislikes);
    const dateRange = getDecadeDateRange(decade);

    const params = new URLSearchParams({
      api_key: TMDB_KEY,
      sort_by: "popularity.desc",
      with_genres: likeIds.join(","),
      without_genres: dislikeIds.join(","),
      ...(dateRange.yearGte && { "first_air_date.gte": dateRange.yearGte }),
      ...(dateRange.yearLte && { "first_air_date.lte": dateRange.yearLte }),
      vote_count_gte: "100",
      language,
    });

    // ✅ Получаем 3 страницы результатов (до 60 сериалов)
    const results = await fetchMultiplePages(
      `${BASE_URL}/discover/tv`,
      params,
      3
    );

    return results.map((s) => ({
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

export default {
  fetchMovies,
  fetchTVShows,
  getDecadeDateRange,
};
