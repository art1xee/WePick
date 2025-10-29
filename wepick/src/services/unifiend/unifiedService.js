// unifiedService.js - Единая точка входа для всех типов контента

import { fetchMovies, fetchTVShows } from "../tmdb/tmdbService.js";
import { fetchAnime } from "../jikan/jikanService.js"; // <--- ИСПРАВЛЕНО имя импорта

function preferencesFromParticipants(participants) {
  return participants.flatMap((p) => p.likes || []);
}

function hasAnimePref(preferences) {
  const lower = preferences.map((s) => String(s).toLowerCase());
  return lower.some((p) =>
    ["аниме", "anime", "японское", "manga", "анiме"].includes(p)
  );
}

// function for shuffling arrays
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Вспомогательная функция для получения контента TMDb (нужна для логики ослабления фильтров)
 */
const _fetchTMDBContent = async (
  likes,
  dislikes,
  decade,
  contentType,
  language
) => {
  return contentType === "series"
    ? await fetchTVShows(likes, dislikes, decade, language)
    : await fetchMovies(likes, dislikes, decade, language);
};

/**
 * Unified fetch: Jikan для аниме, TMDb для остального
 */
export async function fetchContentForParticipantsUnified(
  participants,
  contentType,
  language = "en-US"
) {
  // 1. indetification all users
  const user = participants.find((p) => !p.isCharacter);
  const character = participants.find((p) => p.isCharacter);
  let didWeaken = false;

  // 2. merging all likes & dislikes
  let allLikes = [...new Set(participants.flatMap((p) => p.likes || []))];
  let allDislikes = [...new Set(participants.flatMap((p) => p.dislikes || []))];
  const decade = participants[0]?.decade || 2000;

  // 3. if we have a reminder "anime" or chosen type "anime" - using JIKAN api
  if (hasAnimePref(allLikes) || contentType === "anime") {
    const jikanResults = await fetchAnime(allLikes, allDislikes, decade, 60);

    const shuffled = shuffleArray(jikanResults);

    return {
      results: shuffled.slice(0, 20),
      didWeakenFilters: false,
      characterName: character?.name || null,
    };
  }

  // =================================================================
  // ИНАЧЕ - TMDb с логикой ослабления фильтров
  // =================================================================

  // ПОПЫТКА 1: Строгий поиск со ВСЕМИ предпочтениями
  let results = await _fetchTMDBContent(
    allLikes,
    allDislikes,
    decade,
    contentType,
    language
  );

  // ПОПЫТКА 2: Ослабленный поиск (если нет результатов И есть персонаж)
  if (results.length === 0 && character) {
    console.warn(
      "Нет результатов с полными фильтрами TMDb. Повторный поиск без жанров персонажа."
    );
    // Повторный запрос только с предпочтениями пользователя
    results = await _fetchTMDBContent(
      user?.likes || [],
      user?.dislikes || [],
      decade,
      contentType,
      language
    );
    didWeaken = true;
  }

  // Маппинг результатов TMDb в унифицированный формат
  const mapped = (results || []).map((r) => ({
    id: r.id,
    title: r.title || r.name,
    overview: r.overview || null,
    rating: r.vote_average ?? r.rating ?? null,
    poster: r.poster_path
      ? `https://image.tmdb.org/t/p/w500${r.poster_path}`
      : r.poster || null,
    year: r.release_date
      ? Number(r.release_date.slice(0, 4))
      : r.first_air_date
      ? Number(r.first_air_date.slice(0, 4))
      : null,
    source: "tmdb",
    raw: r,
  }));

  const shuffled = shuffleArray(mapped);

  return {
    results: shuffled.slice(0, 20),
    didWeakenFilters: didWeaken,
    characterName: character?.name || null,
  };
}
