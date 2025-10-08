import React from "react";
import Loading from "./Loading";
const labels = { ua: { title: "Виберіть, який контент ви хочете подивитися", next: "Далі" }, 
ru: { title: "Выберите контент, который вы хотите посмотреть", next: "Далее" }, 
en: { title: "Choose content which you wanna - watch", next: "Next" } };

export default function ContentType({ lang="ua", value, onSelect, onNext }) {
  const options = [
    { key: "movie", label: { ua: "Фільм", ru: "Фильм", en: "Movie" } },
    { key: "series", label: { ua: "Серіал", ru: "Сериал", en: "Series" } },
    { key: "anime", label: { ua: "Аніме", ru: "Аниме", en: "Anime" } },
  ];

  return (
    <div className="screen-content-type">
      <h2>{labels[lang].title}</h2>
      <div className="type-buttons">
        {options.map(o => (
          <button
            key={o.key}
            onClick={() => onSelect(o.key)}
            className={value === o.key ? "btn btn-active" : "btn"}
          >
            {o.label[lang]}
          </button>
        ))}
      </div>
      <div className="button-type" style={{ marginTop: 20 }}>
        <button className={`btn ${value ? "btn-active" : "btn-disabled"}`} disabled={!value} onClick={onNext}>{labels[lang].next}</button>
      </div>
    </div>
  );
}
/*
TODO: when user write his name in Loading.jsx - show it in the top of this screen (ContentType.jsx)
TODO: when user choose content type - make button`s movie, series, anime active (change style)
*/