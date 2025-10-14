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
    friend_name:"Ім'я друга:",
    character_name:"Ім'я персонажа:",
    character:"(персонаж)",
  },
  ru: {
    title: "Итоги выбора:",
    content_type: "Тип контента: ",
    dont_want_watch: "Не хотим смотреть:",
    want_watch: "Хотим смотреть:",
    decade: "Декада:",
    next: "Найти {content}!",
    error: "Неизвестный контент!",
    friend_name:"Имя друга:",
    character_name:"Имя персонажа:",
    character:"(персонаж)",
  },
  en: {
    title: "Selection Summary:",
    content_type: "Content Type: ",
    dont_want_watch: "Don't want to watch:",
    want_watch: "Want to watch:",
    decade: "Decade:",
    next: "Find a {content}!",
    error: "Unknown Content!",
    friend_name:"Friend's name:",
    character_name:"Character's name:",
    character:"(character)",
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
            {i === 0 ? "Ви" : p.isCharacter ? p.name + " " + labels[lang].character : p.name}
          </h4>
          <p>
           <div className="dislike_content_summary">
             <strong>{labels[lang].dont_want_watch}</strong>{" "}
            {p.dislikes && p.dislikes.join(", ")}
           </div>
          </p>
          <p>
            <div className="like_content_summary">
            <strong>{labels[lang].want_watch}</strong>{" "}
            {p.likes && p.likes.join(", ")}  
            </div>
          </p>
          <p>
            <div className="decade-summary">
              <strong>{labels[lang].decade}</strong> {p.decade}
            </div>
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
//TODO make a content type change language
//TODO add in next buttonb content type
//TODO make text more beautiful
//TODO show a 1 user name and second user 