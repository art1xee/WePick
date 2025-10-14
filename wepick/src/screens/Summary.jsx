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
    friend_name:"Ім'я друга: ",
    character_name:"Ім'я персонажа: ",
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
    friend_name:"Имя друга: ",
    character_name:"Имя персонажа: ",
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
    friend_name:"Friend's name: ",
    character_name:"Character's name: ",
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
      <div className="summary-content">
        <h2 className="summary-title">{labels[lang].title}</h2>
        
        <div className="content-type-section">
          <p className="content-type-info">
            {labels[lang].content_type}
            <strong className="content-type-value">{contentType && contentType[lang] ? contentType[lang] : contentType}</strong>
          </p>
        </div>

        <div className="participants-section">
          {participants.map((p, i) => (
            <div key={i} className="summary-block">
              <div className="participant-header">
                <h4 className="participant-name">
                  {i === 0 ? "Ви" : p.isCharacter ? labels[lang].friend_name + p.name + " " : p.name + labels[lang].character}
                </h4>
              </div>
              
              <div className="participant-preferences">
                <div className="preference-item dislike-content">
                  <span className="preference-label">{labels[lang].dont_want_watch}</span>
                  <span className="preference-value">
                    {p.dislikes && p.dislikes.length > 0 ? p.dislikes.join(", ") : "Немає"}
                  </span>
                </div>
                
                <div className="preference-item like-content">
                  <span className="preference-label">{labels[lang].want_watch}</span>
                  <span className="preference-value">
                    {p.likes && p.likes.length > 0 ? p.likes.join(", ") : "Немає"}
                  </span>
                </div>
                
                <div className="preference-item decade-content">
                  <span className="preference-label">{labels[lang].decade}</span>
                  <span className="preference-value">{p.decade || "Не вибрано"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="action-section">
          <button className="btn btn-active summary-action-btn" onClick={onFind}>
            {getContentType()}
          </button>
        </div>
      </div>
    </div>
  );
}
//TODO make a content type change language
//TODO add in next buttonb content type
//TODO make text more beautiful
//TODO show a 1 user name and second user 