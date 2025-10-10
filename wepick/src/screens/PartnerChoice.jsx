import React from "react";
import Loading from "./Loading";

const labels = {
  ua: {
    title: "Зараз обери свого партнера\nдля просмотру: {content}",
    next: "Далі!",
    error: "(Невідомий контент)",
  },
  ru: {
    title: "Сейчас выбери своего партнёра\n для просмотра: {content}",
    next: "Далее!",
    error: "(Неизвестный контент)",
  },
  en: {
    title: "Now choose your fellow for\n watching: {content}",
    next: "Next!",
    error: "(Unknown content)",
  },
};

// const getContent <-- get content type from ContentType.jsx

export default function PartnerChoice({
  lang = "ua",
  onChoose,
  onNext,
  value,
  contentType,
  onSelect,
}) {
  const optionsPartner = [
    { key: "friend", label: { ua: "Друг", ru: "Друг", en: "Friend" } },
    {
      key: "popular-character",
      label: {
        ua: "Популярний\n персонаж",
        ru: "Популярный\n персонаж",
        en: "Popular\n character",
      },
    },
  ];

  const getTitle = () => {
    const template = labels[lang].title;
    // Replace placeholder {name} with the actual userName passed from App.jsx

    const contentString =
      contentType && contentType[lang] ? contentType[lang] : labels[lang].error;
    return template.replace("{content}", contentString);
  };

  return (
    <div className="partner-screen">
      <div className="partner-screen-h2">
        <h2>{getTitle()}</h2>
      </div>

      <div className="type-buttons-partner">
        {optionsPartner.map((o) => (
          <button
            key={o.key}
            onClick={() => onSelect(o)}
            // onClick = { () => onChoose("friend")}
            className={
              value === o.key
                ? `btn btn-active-type btn-active-${o.key}`
                : "btn"
            }
          >
            {o.label[lang]}
          </button>
        ))}
        {/* <button className="btn" onClick={()=>onChoose("friend")}>Друг</button>
        <button className="btn" onClick={()=>onChoose("character")}>Популярний персонаж</button> */}
      </div>
      <div className="next-btn-partner" style={{ marginTop: 20 }}>
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

