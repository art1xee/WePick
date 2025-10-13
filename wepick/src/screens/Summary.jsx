import React from "react";

const labels = {
  ua: {
    title: "Підсумок вибору:",
    content_type: "Тип контенту: ",
    dont_want_watch: "Не хочемо дивитись:",
    want_watch: "Хочемо дивитись:",
    decade: "Декада:",
    next: "Знайти {content}!",
    error: "Невідомий Контент!",
  },
  ru: {
    title: "Итоги выбора:",
    content_type: "Тип контента: ",
    dont_want_watch: "Не хотим смотреть:",
    want_watch: "Хотим смотреть:",
    decade: "Декада:",
    next: "Найти {content}!",
    error: "Неизветсный контент!",
  },
  en: {
    title: "Selection Summary:",
    content_type: "Content Type: ",
    dont_want_watch: "Don`t want to watch:",
    want_watch: "Want to watch:",
    decade: "Decade:",
    next: "Find a {content}!",
    error: "Unknown Content!",
  },
};



export default function Summary({
  lang = "ua",
  setLang,
  onNext,
  participants,
  contentType,
  value,
  onFind,
}) {

 const getContentType = () => {
    const template = labels[lang].next;
    // Replace placeholder {name} with the actual userName passed from App.jsx

    const contentString =
      contentType && contentType[lang] ? contentType[lang] : labels[lang].error;
    return template.replace("{content}", contentString);
  };


  return (
    <div className="summary-screen">
      <h2>{labels[lang].title}</h2>
      <p>
        {labels[lang].content_type}
        <strong>{contentType}</strong>
      </p>
      {participants.map((p, i) => (
        <div key={i} className="summary-block">
          <h4>
            {i === 0 ? "Ви" : p.isCharacter ? p.name + " (персонаж)" : p.name}
          </h4>
          <p>
            <strong>{labels[lang].dont_want_watch}</strong>{" "}
            {p.dislikes && p.dislikes.join(", ")}
          </p>
          <p>
            <strong>{labels[lang].want_watch}</strong>{" "}
            {p.likes && p.likes.join(", ")}
          </p>
          <p>
            <strong>{labels[lang].decade}</strong> {p.decade}s
          </p>
        </div>
      ))}
      <div style={{ marginTop: 20 }}>
        <button className="btn btn-active" onClick={onFind}>
          {labels[lang].next}
          {getContentType}
        </button>
      </div>
    </div>
  );
}
