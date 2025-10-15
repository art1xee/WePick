import React, { useState } from "react";

/*
Этот компонент обрабатывает:
- выбор 3 антипатий (из 16)
- затем выбор 3 симпатий (из 16)
- выбор десятилетия
*/

const labels = {
  ua:{
    title_dislikes:"{name} Обери 3 жанри, які ти НЕ хочеш - дивитись.",
    title_like: "{name} Обери 3 жанри, які ти ХОЧЕШ - дивитись.",
    next: "Далі!",
    decade: "{name} Обери декаду:",
    save: "Зберегти!",
  },
  ru:{
    title_dislikes:"{name} Выберите 3 жанра, которые ты НЕ хочешь - смотреть.", 
    title_like: "{name} Выберите 3 жанра, который ты ХОЧЕШЬ - смотреть.",     
    next: "Далее!",
    decade: "{name} Выбери декаду:",
    save: "Сохранить!",
  },
  en:{
    title_dislikes:"{name} Select 3 genres that you do NOT want to watch..",
    title_like: "{name} Select 3 genres that you WANT to watch.",
    next: "Next!",
    decade: "{name} Select a decade:",
    save: "Save!",
  }
}

const GENRES = {
  ua: [
    "Бойовик", "Пригоди", "Комедія", "Драма",
    "Романтика", "Фентезі", "Наукова фантастика", "Містика / Детектив",
    "Жахи", "Трилер", "Повсякденність", "Спорт",
    "Надприродне", "Історичний", "Військовий", "Кримінал",
    "Сімейний", "Мюзикл", "Документальний", "Вестерн"
  ],
  ru: [
    "Боевик", "Приключения", "Комедия", "Драма",
    "Романтика", "Фэнтези", "Научная фантастика", "Мистика / Детектив",
    "Ужасы", "Триллер", "Повседневность", "Спорт",
    "Сверхъестественное", "Исторический", "Военный", "Криминал",
    "Семейный", "Мюзикл", "Документальный", "Вестерн"
  ],
  en: [
    "Action", "Adventure", "Comedy", "Drama",
    "Romance", "Fantasy", "Sci-Fi", "Mystery",
    "Horror", "Thriller", "Slice of Life", "Sports",
    "Supernatural", "Historical", "War", "Crime",
    "Family", "Musical", "Documentary", "Western"
  ]
};

const ADDITIONAL = {
  ua: [
    "Психологічний", "Супергерої", "Кіберпанк", "Постапокаліпсис",
    "Меха / Роботи", "Ісекай (інший світ)", "Вампірський", "Монстри",
    "Шкільний", "Айдоли / Шоу-бізнес", "Романтична комедія", "Зворушливий",
    "Темне фентезі", "Детектив", "Культова класика", "Добрий / Позитивний",
    "Мрачний / Жорсткий", "Реальна історія", "Футуристичний", "Про дорослішання"
  ],
  ru: [
    "Психологический", "Супергерои", "Киберпанк", "Постапокалипсис",
    "Меха / Роботы", "Исекай (другой мир)", "Вампирский", "Монстры",
    "Школьный", "Айдолы / Шоу-бизнес", "Романтическая комедия", "Душераздирающий",
    "Тёмное фэнтези", "Детектив", "Культовая классика", "Добрый / Позитивный",
    "Мрачный / Жёсткий", "Реальная история", "Футуристический", "Про взросление"
  ],
  en: [
    "Psychological", "Superhero", "Cyberpunk", "Post-Apocalyptic",
    "Mecha / Robots", "Isekai (Another World)", "Vampire", "Monster",
    "School", "Idol / Showbiz", "Rom-Com", "Tearjerker",
    "Dark Fantasy", "Detective", "Cult Classic", "Feel Good",
    "Gritty", "True Story", "Futuristic", "Coming of Age"
  ]
};

// Объединяем жанры
const getCombinedGenres = (lang) => {
  return {
      // Берем ровно 16 основных жанров для Dislikes (4x4)
      dislikeOptions: GENRES[lang].slice(0, 16),
      // Берем ровно 16 жанров из объединенного списка для Likes (4x4)
      likeOptions: [...GENRES[lang], ...ADDITIONAL[lang]].slice(0, 16)
  };
};

// *** НОВЫЙ СТИЛЬ КАРТОЧКИ ДЛЯ УНИФИКАЦИИ РАЗМЕРА И ЦЕНТРИРОВАНИЯ ***
// Этот стиль будет объединен с существующими классами char-card / char-card-selected
const UNIFIED_GENRE_CARD_STYLE = {
    // Делаем карточку Flex-контейнером для центрирования
    display: 'flex', 
    alignItems: 'center', // Вертикальное центрирование
    justifyContent: 'center', // Горизонтальное центрирование
    textAlign: 'center', // Центрирование текста
    minHeight: '60px', // Минимальная высота, чтобы вместить 2 строки текста
    padding: '5px', // Уменьшаем внутренние отступы, чтобы дать больше места тексту
    whiteSpace: 'normal', // Разрешаем перенос текста
    cursor: 'pointer', // Указываем, что это кликабельно
};


export default function PreferencesFlow({ lang = "ua", participant, onSave, onNext, onChoose, userName }) {
  const { dislikeOptions, likeOptions } = getCombinedGenres(lang);
  
  const [step, setStep] = useState("dislikes"); // 'dislikes'|'likes'
  const [dislikes, setDislikes] = useState(participant.dislikes || []);
  const [likes, setLikes] = useState(participant.likes || []);
  const [decade, setDecade] = useState(participant.decade || 2000);

  const addToggle = (arr, set, val, limit) => {
    if (arr.includes(val)) {
        set(arr.filter(x => x !== val));
    } else {
        if (arr.length >= limit) return;
        set(prev => [...prev, val]);
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

  const decades = [1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];

  return (
    <div className="genres-screen">
      {step === "dislikes" && (
        <>
          <h3>{getLabel("title_dislikes")}</h3>
          <div className="grid-4">
            {dislikeOptions.map(g => (
              <div 
              key={g} 
              className={`char-card ${dislikes.includes(g)? "char-card-selected":"genre-card"}`} 
              // *** ИСПОЛЬЗУЕМ УНИФИЦИРОВАННЫЙ СТИЛЬ КАРТОЧКИ ***
              style={UNIFIED_GENRE_CARD_STYLE}
              onClick={()=>addToggle(dislikes,setDislikes,g,3)}>
                <div className="genre-text" style={{ fontSize: '1em', padding: 0 }}>
                  {g}
                </div>
              </div>
            ))}
          </div>
          <div className="center-btn-grid" style={{marginTop:40}}>
            <button className={`btn ${dislikes.length===3 ? "btn-active":"btn-disabled"}`} 
            disabled={dislikes.length!==3} 
            onClick={()=>setStep("likes")}>
              {labels[lang].next}
              </button>
          </div>
        </>
      )}

      {step === "likes" && (
        <>
          <h3>{getLabel("title_like")}</h3>
          <div className="grid-4">
            {likeOptions.map(g => (
              <div 
              key={g} 
              className={`char-card ${likes.includes(g)? "char-card-selected":"genre-card"}`} 
              // *** ИСПОЛЬЗУЕМ УНИФИЦИРОВАННЫЙ СТИЛЬ КАРТОЧКИ ***
              style={UNIFIED_GENRE_CARD_STYLE}
              onClick={()=>addToggle(likes,setLikes,g,3)}>
                <div className="genre-text" style={{ fontSize: '1em', padding: 0 }}>
                  {g}
                </div>
              </div>
            ))}
          </div>

          <div className="decade-chooser-container" style={{ marginTop: 40}}>
            <label className="decade-spinner-label">{getLabel("decade")}</label>
            <select 
            className="decade-spinner"
            value={decade} 
            onChange={e=>setDecade(Number(e.target.value))}>
              {decades.map(d=>(
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="center-btn" style={{marginTop:40}}>
            <button className={`btn ${likes.length===3 ? "btn-active":"btn-disabled"}`} 
            disabled={likes.length!==3} 
            onClick={()=>onSave({ likes, dislikes, decade })}>{labels[lang].save}</button>
          </div>
        </>
      )}
    </div>
  );
}