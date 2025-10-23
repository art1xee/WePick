import React from "react";
import Loading from "./Loading"; // NOTE: This component is likely named Loading.jsx on disk

const labels = { 
  ua: { 
    title: "Привіт {name}! Обери, контент який ти хочеш подивитися.", 
    next: "Далі!" 
  }, 
  ru: { 
    title: "Привет {name}! Выбери контент, который ты хочешь посмотреть.", 
    next: "Далее!" 
  }, 
  en: { 
    title: "Hello {name}! Choose content which you wanna watch.", 
    next: "Next!" 
  } 
};

// NOTE: Added userName prop to display user name
export default function ContentType({ lang = "ua", userName, value, onSelect, onNext }) {
  const options = [
    { key: "movie", content: {ua: "Фільмів", ru: "Фильмов", en:"Movie"},  label: { ua: "Фільми", ru: "Фильмы", en: "Movie's" } },
    { key: "series",content: {ua: "Серіалів", ru: "Сериалов", en:"Series"}, label: { ua: "Серіали", ru: "Сериалы", en: "Series" } },
    { key: "anime",content: {ua: "Аніме/Азіатське", ru: "Аниме/Азиатское", en:"Anime/Asian"}, label: { ua: "Аніме/Азіатське", ru: "Аниме/Азиатское", en: "Anime/Asian" } },
  ];

  // Logic to replace {name} placeholder with actual userName
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
        {options.map(o => (
          <button
            key={o.key}
            onClick={() => onSelect(o)}
            // Dynamic class: e.g., "btn btn-active-movie"
            className={value === o.key ? `btn btn-active-type btn-active-${o.key}` : "btn"}
          >
            {o.label[lang]}
          </button>
        ))}
      </div>
      <div className="button-type" style={{ marginTop: 20 }}>
        <button 
          className={`btn ${value ? "btn-active" : "btn-disabled"}`} 
          disabled={!value} 
          onClick={onNext}
        >
          {labels[lang].next}
        </button>
      </div>
    </div>
  );
}
