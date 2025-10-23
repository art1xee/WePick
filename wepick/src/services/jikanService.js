// jikanService.js - Сервис для работы с Jikan API (MyAnimeList)

const JIKAN_BASE_URL = "https://api.jikan.moe/v4";

// Маппинг жанров на Jikan API genre IDs
const JIKAN_GENRE_MAPPING = {
  // Основные жанры
  Action: 1,
  Бойовик: 1,
  Боевик: 1,

  Adventure: 2,
  Пригоди: 2,
  Приключения: 2,

  Comedy: 4,
  Комедія: 4,
  Комедия: 4,

  Drama: 8,
  Драма: 8,

  Romance: 22,
  Романтика: 22,

  Fantasy: 10,
  Фентезі: 10,
  Фэнтези: 10,

  "Sci-Fi": 24,
  "Наукова фантастика": 24,
  "Научная фантастика": 24,

  Mystery: 7,
  "Містика / Детектив": 7,
  "Мистика / Детектив": 7,

  Horror: 14,
  Жахи: 14,
  Ужасы: 14,

  Thriller: 41,
  Трилер: 41,
  Триллер: 41,

  Sports: 30,
  Спорт: 30,

  Supernatural: 37,
  Надприродне: 37,
  Сверхъестественное: 37,

  // Дополнительные жанры специфичные для аниме
  Psychological: 40,
  Психологічний: 40,
  Психологический: 40,

  Superhero: 31,
  Супергерої: 31,
  Супергерои: 31,

  "Slice of Life": 36,
  Повсякденість: 36,
  Повседневность: 36,

  School: 23,
  Шкільний: 23,
  Школьный: 23,

  "Mecha / Robots": 18,
  "Меха / Роботи": 18,
  "Меха / Роботы": 18,

  Vampire: 32,
  Вампірський: 32,
  Вампирский: 32,

  "Dark Fantasy": 10,
  "Темне фентезі": 10,
  "Тёмное фэнтези": 10,

  "Rom-Com": 4, // Comedy + Romance
  "Романтична комедія": 4,
  "Романтическая комедия": 4,
};

// Преобразование названий жанров в Jikan IDs
const genresToJikanIds = (genresNames) => {
  if (!genresNames || genresNames.length === 0) return [];
  return genresNames.map((name) => JIKAN_GENRE_MAPPING[name]).filter(Boolean);
};

// Функция задержки для соблюдения rate limit (Jikan имеет ограничение 3 req/sec)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Получить аниме по фильтрам
export const fetchAnime = async (likes, dislikes, decade) => {
  try {
    const likeIds = genresToJikanIds(likes);

    // Jikan API не поддерживает exclude жанров напрямую,
    // поэтому мы будем фильтровать результаты после получения
    const dislikeIds = genresToJikanIds(dislikes);

    // Формируем параметры запроса
    const params = new URLSearchParams({
      order_by: "score",
      sort: "desc",
      min_score: "6", // Минимальный рейтинг
      limit: "25", // Получаем больше для последующей фильтрации
    });

    // Добавляем жанры если есть
    if (likeIds.length > 0) {
      params.append("genres", likeIds.join(","));
    }

    // Фильтр по декаде (год начала)
    if (decade) {
      const startYear = decade;
      const endYear = decade + 9;
      params.append("start_date", `${startYear}-01-01`);
      params.append("end_date", `${endYear}-12-31`);
    }

    // Запрос к Jikan API
    const response = await fetch(`${JIKAN_BASE_URL}/anime?${params}`);

    if (!response.ok) {
      throw new Error(`Jikan API error: ${response.status}`);
    }

    const data = await response.json();

    // Задержка для соблюдения rate limit
    await delay(350); // ~3 запроса в секунду

    // Фильтруем результаты, исключая нежелательные жанры
    let results = data.data || [];

    if (dislikeIds.length > 0) {
      results = results.filter((anime) => {
        const animeGenreIds = anime.genres.map((g) => g.mal_id);
        // Проверяем, что ни один из нежелательных жанров не присутствует
        return !dislikeIds.some((dislikeId) =>
          animeGenreIds.includes(dislikeId)
        );
      });
    }

    // Преобразуем в единый формат
    return results.map((anime) => ({
      id: anime.mal_id,
      title: anime.title || anime.title_english,
      overview: anime.synopsis || "Описание недоступно",
      rating: anime.score || 0,
      poster:
        anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
      year:
        anime.year ||
        (anime.aired?.from ? new Date(anime.aired.from).getFullYear() : "N/A"),
      malUrl: anime.url, // URL на MyAnimeList
      type: anime.type, // TV, Movie, OVA, etc.
      episodes: anime.episodes,
    }));
  } catch (error) {
    console.error("Ошибка при загрузке аниме из Jikan API:", error);
    return [];
  }
};

// Поиск аниме по названию (для резервного варианта)
export const searchAnime = async (query) => {
  try {
    const params = new URLSearchParams({
      q: query,
      limit: "10",
      order_by: "score",
      sort: "desc",
    });

    const response = await fetch(`${JIKAN_BASE_URL}/anime?${params}`);

    if (!response.ok) {
      throw new Error(`Jikan API error: ${response.status}`);
    }

    const data = await response.json();
    await delay(350);

    return (data.data || []).map((anime) => ({
      id: anime.mal_id,
      title: anime.title || anime.title_english,
      overview: anime.synopsis || "Описание недоступно",
      rating: anime.score || 0,
      poster:
        anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
      year:
        anime.year ||
        (anime.aired?.from ? new Date(anime.aired.from).getFullYear() : "N/A"),
      malUrl: anime.url,
      type: anime.type,
      episodes: anime.episodes,
    }));
  } catch (error) {
    console.error("Ошибка поиска аниме:", error);
    return [];
  }
};

export default {
  fetchAnime,
  searchAnime,
};
