import { fetchAnime } from "../jikan/jikanService.js";
import { TMDB_GENRE_MAPPING } from "../../constants/genres.js";

// API key and base URL for the movie Database (TMDb)
const TMDB_KEY = import.meta.env.VITE_TMDB_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

/** 
Generates start and end date strings for a given deacade for use in API queries.
@param {number} decade - the starting year of the decade (e.g., 1990)
@returns {{yearGte:string, yearLte: string}} An object with date string
*/
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
 * Converts an array of genre names to their corresponding TMDb genre IDs.
 * @param {string[]} genresName - an array of genre names.
 * @returns {number[]} an array of TMDb genre IDs.
 */
const genresToIds = (genresName) => {
  if (!genresName || genresName.length === 0) return [];
  return genresName.map((name) => TMDB_GENRE_MAPPING[name]).filter(Boolean);
};

/**
 * A helper function to fetch and aggregate results from multiple pages of the TMDb API.
 * @param {}
 * @param {string} baseUrl - the base URL for the API endpiont (e.g.,".../discover/movie")
 * @param {URLSearchParams} params - the query parameters for the request
 * @param {number} [maxPages=3] - the meximum number of pages to fetch
 * @returns {Promise<Array<object>>} - a promise that resolve to an array of all fetched results.
 */
const fetchMultiplePages = async (baseUrl, params, maxPages = 3) => {
  const allResults = [];

  // loop from page 1 up to the specified max number of pages.
  for (let page = 1; page <= maxPages; page++) {
    try {
      // create a new set of parameters for the current page.
      const pageParams = new URLSearchParams({
        ...Object.fromEntries(params.entries()),
        page: page.toString(),
      }).toString();

      const response = await fetch(`${baseUrl}?${pageParams}`);
      const data = await response.json();

      // if the page contains results, add them to the aggregate array.
      if (data.results && data.results.length > 0) {
        allResults.push(...data.results);
      } else {
        // if a page has no results, stop fetching further pages.
        break;
      }

      // add a small delay between requests to avoid hitting the API rate limit.
      await new Promise((resolve) => setTimeout(resolve, 250));
    } catch (error) {
      console.error(`Ошибка при загрузке страницы ${page}:`, error);
      // if an error occurus on one page, stop and return what has been fetched so far.
      break;
    }
  }

  return allResults;
};

/**
 * Fetched a list of movies from TMDb based on user preferences.
 * @param {string[]} likes - an array of liked genre names
 * @param {string[]} dislikes - an array of dislikes genre name
 * @param {number} decade - the desire decade
 * @param {string} [language="en-US"] - the language for the results.
 * @returns {Promise<Array<object>>} a promise resolving to an array of standardized movie onjects
 */
export const fetchMovies = async (
  likes,
  dislikes,
  decade,
  language = "en-US"
) => {
  try {
    // convert genre names to IDs and get the date range for the decade
    const likeIds = genresToIds(likes);
    const dislikeIds = genresToIds(dislikes);
    const dateRange = getDecadeDateRange(decade);

    // construct the query parameters for the API request.
    const params = new URLSearchParams({
      api_key: TMDB_KEY,
      sort_by: "popularity.desc",
      with_genres: likeIds.join(","),
      without_genres: dislikeIds.join(","),
      ...(dateRange.yearGte && {
        // add date range parameters if a decade was specified
        "primary_release_date.gte": dateRange.yearGte,
      }),
      ...(dateRange.yearLte && {
        "primary_release_date.lte": dateRange.yearLte,
      }),
      vote_count_gte: "100", // filter out movies with very few votes
      language,
    });

    // ✅ fetch up to 3 pages of results (approx. 60 movies)
    const results = await fetchMultiplePages(
      `${BASE_URL}/discover/movie`,
      params,
      3
    );

    // map the raw API data to the applications`s standardized format.
    return results.map((m) => ({
      id: m.id,
      title: m.title,
      overview: m.overview,
      rating: m.vote_average,
      // construct the full URL for the poster image.
      poster: m.poster_path
        ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
        : null,
      year: m.release_date ? m.release_date.split("-")[0] : "N/A",
    }));
  } catch (error) {
    console.error("Ошибка при загрузке фильмов:", error);
    return [];
  }
};

/**
 * Fetched a list of TV shows from TMDb based on user preferences.
 * @param {string[]} likes - an array of liked genre names.
 * @param {string[]} dislikes - an array of dislikes ganre names.
 * @param {number} decade - the desired decade.
 * @param {string} [language="en-US"] - the language for the results.
 * @returns {Promise<Array<object>>} A promise resolving to an array of standardized TV show objects.
 */
export const fetchTVShows = async (
  likes,
  dislikes,
  decade,
  language = "en-US"
) => {
  try {
    const likeIds = genresToIds(likes);
    const dislikeIds = genresToIds(dislikes);
    const dateRange = getDecadeDateRange(decade);

    // construct query parameters, using TV-specific date fields.
    const params = new URLSearchParams({
      api_key: TMDB_KEY,
      sort_by: "popularity.desc",
      with_genres: likeIds.join(","),
      without_genres: dislikeIds.join(","),
      ...(dateRange.yearGte && { "first_air_date.gte": dateRange.yearGte }),
      ...(dateRange.yearLte && { "first_air_date.lte": dateRange.yearLte }),
      vote_count_gte: "100",
      language,
    });

    // fetch up to 3 pages of results (approx. 60 TV shows)
    const results = await fetchMultiplePages(
      `${BASE_URL}/discover/tv`,
      params,
      3
    );

    // map the raw API data to the application`s standardized format.
    return results.map((s) => ({
      id: s.id,
      title: s.name || s.original_name,
      overview: s.overview,
      rating: s.vote_average,
      poster: s.poster_path
        ? `https://image.tmdb.org/t/p/w500${s.poster_path}`
        : null,
      year: s.first_air_date ? s.first_air_date.split("-")[0] : "N/A",
    }));
  } catch (error) {
    console.error("Ошибка при загрузке сериалов:", error);
    return [];
  }
};

// default export containing the main fetch functions.
export default {
  fetchMovies,
  fetchTVShows,
  getDecadeDateRange,
};
