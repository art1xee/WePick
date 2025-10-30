import { JIKAN_GENRE_MAPPING } from "../../constants/genres.js";
const JIKAN_BASE_URL = "https://api.jikan.moe/v4";

/**
 * Конвертирует жанры в их Jikan ID.
 */
function genresToJikanIds(genresNames) {
  const validGenres = Array.isArray(genresNames) ? genresNames : [];

  return validGenres
    .map((name) => {
      const id = JIKAN_GENRE_MAPPING[name];
      if (id === undefined) {
        console.warn(`⚠️ Jikan genre mapping missing for: ${name}`);
      }
      return id;
    })
    .filter((id) => id);
}

/**
 * Загружает аниме с Jikan API по жанрам и фильтрам.
 * @param {Array<string>} likes - предпочтительные жанры
 * @param {Array<string>} dislikes - нежелательные жанры (пока не используется)
 * @param {number} decade - десятилетие (например, 2000 для 2000–2009)
 * @param {number} limit - общий лимит
 */
export async function fetchAnime(
  likes = [],
  dislikes = [],
  decade,
  limit = 60
) {
  console.log("fetchAnime params:", { likes, dislikes, decade });
  const genreIds = genresToJikanIds(likes);

  if (genreIds.length === 0) {
    console.warn("⚠️ Нет подходящих жанров, возвращаю пустой массив");
    return [];
  }

  try {
    const results = [];

    // Ограничим количество запросов (Jikan не любит спам)
    const limitedGenres = genreIds.slice(0, 5);

    // Делаем последовательные запросы (чтобы не ловить 429 Too Many Requests)
    for (const id of limitedGenres) {
      const url = `${JIKAN_BASE_URL}/anime?order_by=score&sort=desc&limit=${Math.ceil(
        limit / limitedGenres.length
      )}&genres=${id}`;

      console.log("🔹 Requesting:", url);
      const response = await fetch(url);
      if (!response.ok) {
        console.error(
          `❌ Jikan API Error ${response.status}: ${response.statusText}`
        );
        continue;
      }

      const data = await response.json();
      if (Array.isArray(data.data)) {
        results.push(...data.data);
      }
    }

    // Удаляем дубликаты
    const unique = Array.from(
      new Map(results.map((a) => [a.mal_id, a])).values()
    );

    // Фильтруем по десятилетию (если указано)
    let filtered = unique;
    if (decade) {
      const endYear = decade + 9;
      filtered = unique.filter((a) => {
        const year =
          a.year ||
          (a.aired?.from ? new Date(a.aired.from).getFullYear() : null) ||
          a.aired?.prop?.from?.year;
        return year && year >= decade && year <= endYear;
      });
      console.log(
        `📅 Отфильтровано ${filtered.length} аниме (${decade}-${endYear})`
      );
    }

    // Приводим к единому виду
    return filtered.map((a) => ({
      id: a.mal_id,
      title: a.title_english || a.title || a.title_japanese,
      overview: a.synopsis || null,
      rating: a.score ?? null,
      poster: a.images?.webp?.image_url || a.images?.jpg?.image_url || null,
      year: a.year ?? null,
      source: "jikan",
      raw: a,
    }));
  } catch (error) {
    console.error("💥 Ошибка при загрузке аниме из Jikan API:", error);
    return [];
  }
}
