// unifiedService.js - Acts as a single entry point for fetching all types of content.

import { fetchMovies, fetchTVShows } from "../tmdb/tmdbService.js";
import { fetchAnime } from "../jikan/jikanService.js";

/**
 * Checks if the user preferences contain any keywords related to anime.
 * @param {string[]} preferences - An array of user preference strings.
 * @returns {boolean} True if an anime-related keyword is found.
 */
function hasAnimePref(preferences) {
  const lower = preferences.map((s) => String(s).toLowerCase());
  return lower.some((p) =>
    ["аниме", "anime", "японское", "manga", "анiме"].includes(p)
  );
}

/**
 * A utility function to shuffle an array in place using the Fisher-Yates algorithm.
 * @param {Array} array - The array to be shuffled.
 * @returns {Array} The shuffled array.
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * An internal helper function to fetch content from TMDb, abstracting the choice between movies and series.
 * This is used for the filter-weakening logic.
 * @param {string[]} likes - Liked genre names.
 * @param {string[]} dislikes - Disliked genre names.
 * @param {number} decade - The desired decade.
 * @param {string} contentType - The type of content ("series" or "movie").
 * @param {string} language - The language for the API results.
 * @returns {Promise<Array<object>>} A promise resolving to an array of TMDb results.
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
 * The main unified fetch function. It determines whether to use the Jikan API (for anime)
 * or the TMDb API (for movies/series) and includes a fallback mechanism to broaden the search if necessary.
 * @param {Array<object>} participants - An array of participant objects with their preferences.
 * @param {string} contentType - The selected type of content ("movie", "series", or "anime").
 * @param {string} [language="en-US"] - The language for the results.
 * @returns {Promise<object>} A promise resolving to an object containing the results, a flag for weakened filters, and the character's name.
 */
export async function fetchContentForParticipantsUnified(
  participants,
  contentType,
  language = "en-US"
) {
  // 1. Identify the user and the character (if any) from the participants list.
  const user = participants.find((p) => !p.isCharacter);
  const character = participants.find((p) => p.isCharacter);
  let didWeaken = false; // Flag to indicate if filters were relaxed.

  // 2. Merge all likes and dislikes from all participants into unique lists.
  let allLikes = [...new Set(participants.flatMap((p) => p.likes || []))];
  let allDislikes = [...new Set(participants.flatMap((p) => p.dislikes || []))];
  const decade = participants[0]?.decade || 2000;

  // 3. If "anime" is preferred or explicitly selected, use the Jikan API.
  if (hasAnimePref(allLikes) || contentType === "anime") {
    const jikanResults = await fetchAnime(allLikes, allDislikes, decade, 60);
    const shuffled = shuffleArray(jikanResults);

    // Return the results in the standardized format.
    return {
      results: shuffled.slice(0, 20), // Limit to 20 results.
      didWeakenFilters: false, // Jikan search does not use the weakening logic.
      characterName: character?.name || null,
    };
  }

  // =================================================================
  // Otherwise, use TMDb with a filter-weakening fallback strategy.
  // =================================================================

  // ATTEMPT 1: Strict search using preferences from all participants.
  let results = await _fetchTMDBContent(
    allLikes,
    allDislikes,
    decade,
    contentType,
    language
  );

  // ATTEMPT 2: If the strict search yields no results AND there's a character partner,
  // weaken the filters by searching again with only the human user's preferences.
  if (results.length === 0 && character) {
    console.warn(
      "No results with full TMDb filters. Retrying without character's genre preferences."
    );
    results = await _fetchTMDBContent(
      user?.likes || [],
      user?.dislikes || [],
      decade,
      contentType,
      language
    );
    didWeaken = true; // Set the flag to true to notify the UI.
  }

  // Map the TMDb results to the application's unified data format.
  const mapped = (results || []).map((r) => ({
    id: r.id,
    title: r.title || r.name,
    overview: r.overview || null,
    rating: r.vote_average ?? r.rating ?? null,
    // Use the poster path from TMDb or a poster URL from another source if available.
    poster: r.poster_path
      ? `https://image.tmdb.org/t/p/w500${r.poster_path}`
      : r.poster || null,
    // Extract the year from the release date.
    year: r.release_date
      ? Number(r.release_date.slice(0, 4))
      : r.first_air_date
      ? Number(r.first_air_date.slice(0, 4))
      : null,
    source: "tmdb",
    raw: r, // Keep the original raw data.
  }));

  const shuffled = shuffleArray(mapped);

  // Return the final structured result.
  return {
    results: shuffled.slice(0, 20), // Limit to 20 results.
    didWeakenFilters: didWeaken,
    characterName: character?.name || null,
  };
}
