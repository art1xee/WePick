import { JIKAN_GENRE_MAPPING } from "../../constants/genres.js";
const JIKAN_BASE_URL = "https://api.jikan.moe/v4";

const getDecadeDateRange = (decade) => {
  if (!decade) return {};
  const startYear = decade;
  const endYear = decade + 9;
  return {
    yearGte: `${startYear}-01-01`,
    yearLte: `${endYear}-12-31`,
  };
};

/**
 * @param {Array<string>} genresNames - массив строк, представляющих жанры (лайки).
 */
function genresToJikanIds(genresNames) {
  const validGenres = Array.isArray(genresNames) ? genresNames : [];

  return validGenres
    .map((name) => {
      const id = JIKAN_GENRE_MAPPING[name];
      if (id === undefined) {
        console.warn(`Jikan genre mapping missing for: ${name}`);
      }
      return id;
    })
    .filter((id) => id);
}

/**
 * ✅ ИСПРАВЛЕНО: добавлен параметр dislikes
 * @param {Array<string>} likes
 * @param {Array<string>} dislikes
 * @param {number} decade - The decade to filter by (e.g., 2000 for 2000-2009)
 * @param {number} limit
 */
export async function fetchAnime(
  likes = [],
  dislikes = [],
  decade,
  limit = 60
) {
  console.log("fetchAnime params:", { likes, dislikes, decade });
  const genreIds = genresToJikanIds(likes);

  const genreQuery = genreIds.length > 0 ? `&genres=${genreIds.join(",")}` : "";
  const dateRange = getDecadeDateRange(decade);
  const dateQuery =
    dateRange.yearGte && dateRange.yearLte
      ? `&start_date=${dateRange.yearGte}&end_date=${dateRange.yearLte}`
      : "";

  const url = `${JIKAN_BASE_URL}/anime?order_by=score&sort=desc&limit=${limit}${genreQuery}`;

  console.log("Requesting Jikan URL:", url);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Jikan API Error: ${response.statusText}`);
    }
    const data = await response.json();

    if (!Array.isArray(data.data)) {
      console.warn(
        "Jikan API did not return a valid data array. Response:",
        data
      );
      return [];
    }

    return data.data.map((a) => ({
      id: a.mal_id,
      title: a.title_russian || a.title_english || a.title,
      overview: a.synopsis || null,
      rating: a.score ?? null,
      poster: a.images?.webp?.image_url || a.images?.jpg?.image_url || null,
      year: a.year ?? null,
      // type: a.type || null,
      // episodes: a.episodes || null,
      // malUrl: `https://myanimelist.net/anime/${a.mal_id}`,
      source: "jikan",
      raw: a,
    }));
  } catch (error) {
    console.error("Ошибка при загрузке аниме из Jikan API:", error);
    throw error;
  }
}
