import { JIKAN_GENRE_MAPPING } from "../../constants/genres.js";
const JIKAN_BASE_URL = "https://api.jikan.moe/v4";

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

  // Правильный формат для множественных жанров
  const genreQuery =
    genreIds.length > 0 ? genreIds.map((id) => `&genres=${id}`).join("") : "";

  // Фильтр по десятилетию (только начальный год)
  const yearQuery = decade ? `&start_date=${decade}` : "";

  // Убираем end_date, так как Jikan API его не поддерживает в таком формате
  const url = `${JIKAN_BASE_URL}/anime?order_by=score&sort=desc&limit=${limit}${genreQuery}${yearQuery}`;

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

    // Фильтруем результаты по десятилетию на клиенте
    let filtered = data.data;
    if (decade) {
      const endYear = decade + 9;
      filtered = data.data.filter((a) => {
        const year =
          a.year ||
          (a.aired?.from ? new Date(a.aired.from).getFullYear() : null);
        return year && year >= decade && year <= endYear;
      });
    }

    return filtered.map((a) => ({
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
