import React from "react";

const labels = { ua: { title: "Виберіть, який контент ви хочете подивитися", next: "Далі" }, ru: { title: "Выберите контент", next: "Далее" }, en: { title: "Choose content", next: "Next" } };

export default function ContentType({ lang="ua", value, onSelect, onNext }) {
  const options = [
    { key: "movie", label: { ua: "Фільм", ru: "Фильм", en: "Movie" } },
    { key: "series", label: { ua: "Серіал", ru: "Сериал", en: "Series" } },
    { key: "anime", label: { ua: "Аніме", ru: "Аниме", en: "Anime" } },
  ];

  return (
    <div className="screen">
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
      <div style={{ marginTop: 20 }}>
        <button className={`btn ${value ? "btn-active" : "btn-disabled"}`} disabled={!value} onClick={onNext}>{labels[lang].next}</button>
      </div>
    </div>
  );
}
