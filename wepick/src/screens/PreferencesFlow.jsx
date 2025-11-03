import React, { useState } from "react";
import { GENRES } from "../constants/genres";
import { ADDITIONAL } from "../constants/genres";

//localization obj for various text on the page.
const labels = {
  ua: {
    title_dislikes: "{name} Обери 3 жанри, які тобі НЕ по душі.",
    title_like: "{name} Обери 3 жанри, які тобі до ВПОДОБИ.",
    next: "Далі!",
    decade: "{name} Обери декаду:",
    save: "Зберегти!",
  },
  ru: {
    title_dislikes: "{name} Выбери 3 жанра, которые тебе НЕ по душе.",
    title_like: "{name} Выбери 3 жанра, которые тебе НРАВЯТСЯ.",
    next: "Далее!",
    decade: "{name} Выбери декаду:",
    save: "Сохранить!",
  },
  en: {
    title_dislikes: "{name} Select 3 genres that you do NOT like.",
    title_like: "{name} Select 3 genres that you LIKE.",
    next: "Next!",
    decade: "{name} Select a decade:",
    save: "Save!",
  },
};

/**
 * A helper function to create dislikes and like genre lists from constants.
 * @param {string} lang - The current language code.
 * @returns {{dislikeOptions: string[], likeOptions: string[]}} - An obj containing two arrays of genres.
 */
const getCombinedGenres = (lang) => {
  return {
    // takes the first 16 genres for the dislikes step.
    dislikeOptions: GENRES[lang].slice(0, 16),
    // combines base and additional genres, then takes the first 16 for the like step.
    likeOptions: [...GENRES[lang], ...ADDITIONAL[lang]].slice(0, 16),
  };
};

// a shared style for genre cards to ensure visual consistency.
const UNIFIED_GENRE_CARD_STYLE = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  minHeight: "60px",
  padding: "5px",
  whiteSpace: "normal",
  cursor: "pointer",
};

/**
 * A multi-step component for users to select their dislikes genres, liked genres, and a preferred decade.
 * @param {obj} props - The component`s props.
 * @param {string} props.lang - The current language code.
 * @param {obj} props.participant - An obj containing the user`s exiting preferences
 * @param {func} props.onSave - a callback function to save the final preferences.
 * @param {string} props.userName - the name of the user to personalize the titles.
 * @returns {JSX.Element} - the rendered component.
 */

export default function PreferencesFlow({
  lang = "ua",
  participant,
  onSave,
  userName,
}) {
  // prepeares the genre lists based on the current language/
  const { dislikeOptions, likeOptions } = getCombinedGenres(lang);

  // state to manage the current step of the flow ('dislikes' or 'likes')
  const [step, setStep] = useState("dislikes");
  // state to store the user`s selected dislikes genres, initialized with existing preferences.
  const [dislikes, setDislikes] = useState(participant.dislikes || []);
  // state to store the user`s selected liked genres, initialized with exesting preferences.
  const [likes, setLikes] = useState(participant.likes || []);
  // state to store the user`s selected decade, initialized with exesting preferences.
  const [decade, setDecade] = useState(participant.decade || 2000);

  /**
   * A generic toggle function to add or remove a value from an array, with size limit.
   * @param {array} arr - the source array.
   * @param {func} set - the state setter function for the array.
   * @param {*} val - the value to add or remove.
   * @param {number} limit - the maximum number of items allowed in the array.
   * @returns
   */
  const addToggle = (arr, set, val, limit) => {
    //if value exists, remove it
    if (arr.includes(val)) {
      set(arr.filter((x) => x !== val));
    } else {
      // if the value doesn`t exist, add it, but only if the limit is not reached.
      if (arr.length >= limit) return;
      set((prev) => [...prev, val]);
    }
  };

  /**
   * Handles clicks on genre cards in the "likes" step.
   * Prevents a user from liking a genre they have already marked as disliked
   * @param {string} genre - the genre that was clicked
   * @returns
   */
  const handleLikeGenreClick = (genre) => {
    if (dislikes.includes(genre)) {
      // show an error if the user tries to like a disliked genre.
      const errorMessages = {
        ua: "Цей жанр вже обраний як небажаний!",
        ru: "Этот жанр уже выбран как нежелательный!",
        en: "This genre has already been selected as disliked!",
      };
      alert(errorMessages[lang]);
      return;
    }
    // otherwise, toggle the genre in the 'likes' list.
    addToggle(likes, setLikes, genre, 3);
  };
  /**
   * Determines the appropriate Css class for a genre card based on it`s state
   * @param {string} genre - the genre to get the class name for.
   * @returns {string} the css class name.
   */

  const getGenreClassName = (genre) => {
    if (step === "likes" && dislikes.includes(genre)) {
      return "genre-disabled"; //disabled if it`s a disliked genre in the 'likes' step.
    }
    if (step === "likes" && likes.includes(genre)) {
      return "genre-selected-like"; // selected type for liked genres.
    }
    if (step === "dislikes" && dislikes.includes(genre)) {
      return "genre-selected-dislike"; // selected styles for disliked genres.
    }
    return "genre-card"; // dedault style.
  };

  /**
   * Gets and formats a localized label, replacing a placeholder with the user`s name.
   * @param {string} key - the key of the label retrieve.
   * @returns {string} the formatted, localized label
   */

  const getLabel = (key) => {
    const labelSet = labels[lang];
    const template = labelSet[key];

    if (!template) {
      console.warn(`⚠️ Label key "${key}" не найден для языка "${lang}"`);
      return "";
    }
    // replace {name} placeholder with the actual user name.
    return template.replace("{name}", userName || "(невідоме ім'я)");
  };

  // an array of decades for the decade selector dropdown
  const decades = [
    1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020,
  ];

  return (
    <div className="genres-screen">
      {/* conditional rendering for the 'dislikes' selection step */}
      {step === "dislikes" && (
        <>
          <h3>{getLabel("title_dislikes")}</h3>
          <div className="grid-4">
            {/* renders the grid of dislikeable genres */}
            {dislikeOptions.map((g) => (
              <div
                key={g}
                className={`char-card ${getGenreClassName(g)}`}
                style={UNIFIED_GENRE_CARD_STYLE}
                onClick={() => addToggle(dislikes, setDislikes, g, 3)}
              >
                <div
                  className="genre-text"
                  style={{ fontSize: "1em", padding: 0 }}
                >
                  {g}
                </div>
              </div>
            ))}
          </div>
          <div className="center-btn-grid" style={{ marginTop: 40 }}>
            {/* button to proceed to the next step */}
            <button
              className={`btn ${
                dislikes.length === 3 ? "btn-active" : "btn-disabled"
              }`}
              disabled={dislikes.length !== 3} // enabled only when exactly 3 genres are selected.
              onClick={() => setStep("likes")}
            >
              {labels[lang].next}
            </button>
          </div>
        </>
      )}

      {/* conditional rendering for the 'likes' and 'decade' selection step */}
      {step === "likes" && (
        <>
          <h3>{getLabel("title_like")}</h3>
          <div className="grid-4">
            {/* renders the grid of likeable genres */}
            {likeOptions.map((g) => (
              <div
                key={g}
                className={`char-card ${getGenreClassName(g)}`}
                style={UNIFIED_GENRE_CARD_STYLE}
                onClick={() => handleLikeGenreClick(g)}
              >
                <div
                  className="genre-text"
                  style={{ fontSize: "1em", padding: 0 }}
                >
                  {g}
                </div>
              </div>
            ))}
          </div>

          {/* container for the decade seelctor */}
          <div className="decade-chooser-container" style={{ marginTop: 40 }}>
            <label className="decade-spinner-label">{getLabel("decade")}</label>
            <select
              className="decade-spinner"
              value={decade}
              onChange={(e) => setDecade(Number(e.target.value))}
            >
              {/* renders the list of decades as option */}
              {decades.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          {/* container for the final 'save' button */}
          <div className="center-btn" style={{ marginTop: 40 }}>
            <button
              className={`btn ${
                likes.length === 3 ? "btn-active" : "btn-disabled"
              }`}
              disabled={likes.length !== 3} // enabled only when exactly 3 genres are selected.
              onClick={() => onSave({ likes, dislikes, decade })} // triggers the save callback with all preferences.
            >
              {labels[lang].save}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
