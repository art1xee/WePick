import { JIKAN_GENRE_MAPPING } from "../../constants/genres.js";
// base url for the JIKAN (MAL) API.
const JIKAN_BASE_URL = "https://api.jikan.moe/v4";

/**
 * Converts an array of genre names into their corresponding Jikan API genre IDs.
 * @param {string[]} genreNames - An array of genre names (e.g., ["Action", "Comedy"])
 * @returns {number[]} An Array of Jikan genre IDs.
 */
function genresToJikanIds(genresNames) {
  // ensure the input is a valid array.
  const validGenres = Array.isArray(genresNames) ? genresNames : [];

  return validGenres
    .map((name) => {
      // find the ID from the mapping constant.
      const id = JIKAN_GENRE_MAPPING[name];
      // if a genre name doesn`t have a corresponding ID, log a warning
      if (id === undefined) {
        console.warn(`⚠️ Jikan genre mapping missing for: ${name}`);
      }
      return id;
    })
    .filter((id) => id); // filter out any undefined/null IDs
}

/**
 * Fetched a list of anime from the Jikan API based on specified genres and decade.
 * @param {string[]} [likes=[]] - an array of preffered genre names.
 * @param {string[]} [dislikes[]] - an array of dislikes genre names (currently unused by the funnction)
 * @param {number} decade - the starting year of the desire decade (e.g., 2000-20009).
 * @param {number} [limit=60] - the total number of results to aim for.
 * @returns {Preomise<Array<object>>} - a promise that resolve to an array of standardized anime objects.
 */
export async function fetchAnime(
  likes = [],
  dislikes = [],
  decade,
  limit = 60
) {
  console.log("fetchAnime params:", { likes, dislikes, decade });
  // convert the liked genre names to their Jikan API IDs
  const genreIds = genresToJikanIds(likes);

  // if no valid genre IDs could be found, return an empty array to avoid unnecessary API calls.
  if (genreIds.length === 0) {
    console.warn("⚠️ Нет подходящих жанров, возвращаю пустой массив");
    return [];
  }

  try {
    const results = [];

    // Оto avoid overhelming the Jikan API, limit requests to the first 5 matched genres.
    const limitedGenres = genreIds.slice(0, 5);

    // make sequential API requests for each genre to avoid "429 Too many Requests" errors.,
    for (const id of limitedGenres) {
      // Construct the URL for the API request.
      const url = `${JIKAN_BASE_URL}/anime?order_by=score&sort=desc&limit=${Math.ceil(
        limit / limitedGenres.length
      )}&genres=${id}`;

      console.log("🔹 Requesting:", url);
      const response = await fetch(url);
      // if the API return a non-OK status, log the error and skip to the next genre.
      if (!response.ok) {
        console.error(
          `❌ Jikan API Error ${response.status}: ${response.statusText}`
        );
        continue;
      }

      const data = await response.json();
      // if the response contsins data, add it to our result array.
      if (Array.isArray(data.data)) {
        results.push(...data.data);
      }
    }

    // remove duplicate anime that might have been returned from different genre queries.
    const unique = Array.from(
      new Map(results.map((a) => [a.mal_id, a])).values()
    );

    // filter the unique results by the specified decade, if provided.
    let filtered = unique;
    if (decade) {
      const endYear = decade + 9;
      filtered = unique.filter((a) => {
        // extract the year from various possible fields in the API response.
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

    // map the filtered results to the application`s standartized object strurcture.
    return filtered.map((a) => ({
      id: a.mal_id,
      title: a.title_english || a.title || a.title_japanese,
      overview: a.synopsis || null,
      rating: a.score ?? null,
      poster: a.images?.webp?.image_url || a.images?.jpg?.image_url || null,
      year: a.year ?? null,
      source: "jikan",
      raw: a, // keep the original raw data for potential furute use.
    }));
  } catch (error) {
    // catch any network or other unexpected errors during the fetch process.
    console.error("💥 Ошибка при загрузке аниме из Jikan API:", error);
    return [];
  }
}
