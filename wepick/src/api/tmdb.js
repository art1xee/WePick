const TMDB_KEY = import.meta.env.VITE_TMDB_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

// универсальный запрос
export async function tmdbFetch(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  params.api_key = TMDB_KEY;
  Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));

  const res = await fetch(url);
  if (!res.ok) throw new Error("TMDB fetch error");
  return await res.json();
}

// получить список популярных фильмов / сериалов / аниме
export async function getPopularContent(type = "movie", page = 1) {
  return tmdbFetch(`/discover/${type}`, {
    sort_by: "popularity.desc",
    page,
    with_original_language: "en",
  });
}

// поиск по жанрам
export async function getByGenres(type = "movie", genreIds = []) {
  return tmdbFetch(`/discover/${type}`, {
    with_genres: genreIds.join(","),
    sort_by: "vote_average.desc",
    vote_count_gte: 100,
  });
}

// получить жанры
export async function getGenres(type = "movie") {
  const res = await tmdbFetch(`/genre/${type}/list`);
  return res.genres;
}
