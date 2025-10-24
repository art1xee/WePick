import { JIKAN_GENRE_MAPPING } from "../../constants/genres.js";

const JIKAN_BASE_URL = "https://api.jikan.moe/v4";

/**
 * @param {Array<string>} genresNames - массив строк, представляющих жанры (лайки).
 */
function genresToJikanIds(genresNames) {
  const validGenres = Array.isArray(genresNames) ? genresNames : [];

  return validGenres
    .map((name) => JIKAN_GENRE_MAPPING[name])
    .filter((id) => id); // Отфильтровываем undefined (жанры, которые не нашлись)
}

/**
 *
 * @param {Array<string>} likes
 * @param {number} limit
 */
export async function fetchAnime(likes = [], limit = 20) {
  const genreIds = genresToJikanIds(likes);

  const genreQuery = genreIds.length > 0 ? `&genres=${genreIds.join(",")}` : "";

  const url = `${JIKAN_BASE_URL}/anime?order_by=score&sort=desc&limit=${limit}${genreQuery}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Jikan API Error: ${response.statusText}`);
    }
    const data = await response.json();

    return data.data.map((a) => ({
      id: a.mal_id,
      title: a.title_russian || a.title_english || a.title,
      overview: a.synopsis || null,
      rating: a.score ?? null,
      poster: a.images?.webp?.image_url || a.images?.jpg?.image_url || null,
      year: a.year ?? null,
      source: "jikan",
      raw: a,
    }));
  } catch (error) {
    console.error("Ошибка при загрузке аниме из Jikan API:", error);
    throw error;
  }
}
