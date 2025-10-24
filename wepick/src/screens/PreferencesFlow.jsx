import React, { useState } from "react";
import { GENRES } from "../constants/genres";
import { ADDITIONAL } from "../constants/genres";

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

const getCombinedGenres = (lang) => {
  return {
    dislikeOptions: GENRES[lang].slice(0, 16),
    likeOptions: [...GENRES[lang], ...ADDITIONAL[lang]].slice(0, 16),
  };
};

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

export default function PreferencesFlow({
  lang = "ua",
  participant,
  onSave,
  userName,
}) {
  const { dislikeOptions, likeOptions } = getCombinedGenres(lang);

  const [step, setStep] = useState("dislikes"); // 'dislikes'|'likes'
  const [dislikes, setDislikes] = useState(participant.dislikes || []);
  const [likes, setLikes] = useState(participant.likes || []);
  const [decade, setDecade] = useState(participant.decade || 2000);

  const addToggle = (arr, set, val, limit) => {
    if (arr.includes(val)) {
      set(arr.filter((x) => x !== val));
    } else {
      if (arr.length >= limit) return;
      set((prev) => [...prev, val]);
    }
  };

  const getLabel = (key) => {
    const labelSet = labels[lang];
    const template = labelSet[key];

    if (!template) {
      console.warn(`⚠️ Label key "${key}" не найден для языка "${lang}"`);
      return "";
    }

    return template.replace("{name}", userName || "(невідоме ім'я)");
  };

  const decades = [
    1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020,
  ];

  return (
    <div className="genres-screen">
      {step === "dislikes" && (
        <>
          <h3>{getLabel("title_dislikes")}</h3>
          <div className="grid-4">
            {dislikeOptions.map((g) => (
              <div
                key={g}
                className={`char-card ${
                  dislikes.includes(g) ? "char-card-selected" : "genre-card"
                }`}
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
            <button
              className={`btn ${
                dislikes.length === 3 ? "btn-active" : "btn-disabled"
              }`}
              disabled={dislikes.length !== 3}
              onClick={() => setStep("likes")}
            >
              {labels[lang].next}
            </button>
          </div>
        </>
      )}

      {step === "likes" && (
        <>
          <h3>{getLabel("title_like")}</h3>
          <div className="grid-4">
            {likeOptions.map((g) => (
              <div
                key={g}
                className={`char-card ${
                  likes.includes(g) ? "char-card-selected" : "genre-card"
                }`}
                style={UNIFIED_GENRE_CARD_STYLE}
                onClick={() => addToggle(likes, setLikes, g, 3)}
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

          <div className="decade-chooser-container" style={{ marginTop: 40 }}>
            <label className="decade-spinner-label">{getLabel("decade")}</label>
            <select
              className="decade-spinner"
              value={decade}
              onChange={(e) => setDecade(Number(e.target.value))}
            >
              {decades.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="center-btn" style={{ marginTop: 40 }}>
            <button
              className={`btn ${
                likes.length === 3 ? "btn-active" : "btn-disabled"
              }`}
              disabled={likes.length !== 3}
              onClick={() => onSave({ likes, dislikes, decade })}
            >
              {labels[lang].save}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
