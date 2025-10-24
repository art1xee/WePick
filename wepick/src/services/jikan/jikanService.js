// jikanService.js - Сервис для работы с Jikan API (MyAnimeList)

const JIKAN_BASE_URL = "https://api.jikan.moe/v4";

// Маппинг жанров на Jikan API genre IDs
const JIKAN_GENRE_MAPPING = {
  // Основные жанры (дополните по необходимости)
  Action: 1,
  Бойовик: 1,
  Боевик: 1,

  Adventure: 2,
  Пригоди: 2,
  Приключения: 2,

  Comedy: 4,
  Комедия: 4,
  Комедія: 4,

  Drama: 8,
  Драма: 8,

  Fantasy: 10,
  Фэнтези: 10,
  Фентезі: 10,

  Romance: 22,
  Романтика: 22,

  SciFi: 24,
  "Наукова фантастика": 24,
  "Научная фантастика": 24,

  Horror: 14,
  Ужасы: 14,
  Жахи: 14,

  SliceOfLife: 36, // Повседневность
  Повседневность: 36,

  Sports: 30, // Спорт
  Спорт: 30,
};

/**
 * Преобразует массив строк (лайков/жанров) в массив Jikan ID.
 * @param {Array<string>} genresNames - массив строк, представляющих жанры (лайки).
 */
function genresToJikanIds(genresNames) {
  // 🔥 ИСПРАВЛЕНИЕ ОШИБКИ: Гарантируем, что genresNames является массивом
  const validGenres = Array.isArray(genresNames) ? genresNames : [];

  return validGenres
    .map((name) => JIKAN_GENRE_MAPPING[name])
    .filter((id) => id); // Отфильтровываем undefined (жанры, которые не нашлись)
}

/**
 * Получает аниме с Jikan API по жанрам (лайкам).
 * @param {Array<string>} likes - массив предпочтений (жанров).
 * @param {number} limit - максимальное количество результатов.
 */
export async function fetchAnime(likes = [], limit = 20) {
  const genreIds = genresToJikanIds(likes);

  // Строим строку запроса жанров
  const genreQuery = genreIds.length > 0 ? `&genres=${genreIds.join(",")}` : "";

  const url = `${JIKAN_BASE_URL}/anime?order_by=score&sort=desc&limit=${limit}${genreQuery}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Jikan API Error: ${response.statusText}`);
    }
    const data = await response.json();

    // Маппинг результатов Jikan в унифицированный формат
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
    // Добавим бросок ошибки для отладки
    throw error;
  }
}
