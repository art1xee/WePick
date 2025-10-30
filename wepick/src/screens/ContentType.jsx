import React from "react";
import Loading from "./Loading";

// localization obj for various labels and titles used in the component.
const labels = {
  ua: {
    title: "Привіт {name}! Обери, контент який ти хочеш подивитися.",
    next: "Далі!",
  },
  ru: {
    title: "Привет {name}! Выбери контент, который ты хочешь посмотреть.",
    next: "Далее!",
  },
  en: {
    title: "Hello {name}! Choose content which you wanna watch.",
    next: "Next!",
  },
};

/**
 *  ContentType component allows the user to select the type of content (movie, tvShow, anime)
 *  It displays a personalized greeting and btn for each content type.
 *
 * @param {obj} props - the component props.
 * @param {string} props.lang - the current language code (e.g., "ua", "en")
 * @param {string} props.userName - the name of the user to display in the greeting.
 * @param {string} props.value - the currently selected content type key (e.g. 'movie')
 * @param {fun} props.onSelect - callback function when a content type btn is clicked.
 * @param {fun} props.onNext - callback fun when the "next" btn is clicked
 */

// NOTE: Added userName prop to display user name
export default function ContentType({
  lang = "ua",
  userName,
  value,
  onSelect,
  onNext,
}) {
  // array defening the avaliable content type options, including their keys, content, and labels for each language.
  const options = [
    {
      key: "movie",
      content: { ua: "Фільмів", ru: "Фильмов", en: "Movie" },
      label: { ua: "Фільми", ru: "Фильмы", en: "Movie's" },
    },
    {
      key: "series",
      content: { ua: "Серіалів", ru: "Сериалов", en: "Series" },
      label: { ua: "Серіали", ru: "Сериалы", en: "Series" },
    },
    {
      key: "anime",
      content: {
        ua: "Аніме/Азіатське",
        ru: "Аниме/Азиатское",
        en: "Anime/Asian",
      },
      label: {
        ua: "Аніме/Азіатське",
        ru: "Аниме/Азиатское",
        en: "Anime/Asian",
      },
    },
  ];

  // function to generate the dynamic title, replacing the {name} placeholder with the actual useName.
  const getTitle = () => {
    const template = labels[lang].title;
    // Replace placeholder {name} with the actual userName passed from App.jsx
    return template.replace("{name}", userName || "(невідоме ім'я)");
  };

  return (
    <div className="screen-content-type">
      <div className="scree-content-title-h2">
        <h2>{getTitle()}</h2>
      </div>
      <div className="type-buttons">
        {options.map((o) => (
          <button
            key={o.key}
            onClick={() => onSelect(o)} // calls onSelect with the chosen option
            // dinamically applies classes for styling based on whether the option is currenntly selected.
            className={
              value === o.key
                ? `btn btn-active-type btn-active-${o.key}`
                : "btn"
            }
          >
            {/* displays the localized label for the content type */}
            {o.label[lang]}
          </button>
        ))}
      </div>
      <div className="button-type" style={{ marginTop: 20 }}>
        <button
          className={`btn ${value ? "btn-active" : "btn-disabled"}`} // btn is active if a content type is selected
          disabled={!value} // btn is disabled if no content type is selected
          onClick={onNext} // calls onNext when the button is clicked
        >
          {labels[lang].next} {/* displays the localized "Next" text */}
        </button>
      </div>
    </div>
  );
}
