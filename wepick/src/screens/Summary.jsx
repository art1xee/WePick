import React from "react";

const labels = {
  ua: {
    title: "Підсумок вибору:",
    content_type: "Тип контенту: ",
    dont_want_watch: "Не хоче дивитися:",
    want_watch: "Хоче дивитися:",
    decade: "Декада:",
    next: "Знайти {content}!",
    error: "Невідомий Контент!",
    friend_name: "Ім'я друга: ",
    character_name: "Ім'я персонажа: ",
    character: "(персонаж)",
    your_name: "Ви: ",
  },
  ru: {
    title: "Итоги выбора:",
    content_type: "Тип контента: ",
    dont_want_watch: "Не хочет смотреть:",
    want_watch: "Хочет смотреть:",
    decade: "Декада:",
    next: "Найти {content}!",
    error: "Неизвестный контент!",
    friend_name: "Имя друга: ",
    character_name: "Имя персонажа: ",
    character: "(персонаж)",
    your_name: "Вы: ",
  },
  en: {
    title: "Selection Summary:",
    content_type: "Content Type: ",
    dont_want_watch: "Don't want to watch:",
    want_watch: "Want to watch:",
    decade: "Decade:",
    next: "Find a {content}!",
    error: "Unknown Content!",
    friend_name: "Friend's name: ",
    character_name: "Character's name: ",
    character: "(character)",
    your_name: "You: ",
  },
};

export default function Summary({
  lang = "ua",
  participants,
  contentType,
  onFind,
  loading, // Принимаем loading как проп
}) {
  // Content type options with translations
  const contentTypeOptions = [
    { key: "movie", label: { ua: "Фільми", ru: "Фильмы", en: "Movie's" } },
    { key: "series", label: { ua: "Серіали", ru: "Сериалы", en: "Series" } },
    { key: "anime", label: { ua: "Аніме", ru: "Аниме", en: "Anime's" } },
  ];

  // Genres with translations
  const GENRES = {
    ua: [
      "Бойовик",
      "Пригоди",
      "Комедія",
      "Драма",
      "Романтика",
      "Фентезі",
      "Наукова фантастика",
      "Містика / Детектив",
      "Жахи",
      "Трилер",
      "Повсякденність",
      "Спорт",
      "Надприродне",
      "Історичний",
      "Військовий",
      "Кримінал",
      "Сімейний",
      "Мюзикл",
      "Документальний",
      "Вестерн",
    ],
    ru: [
      "Боевик",
      "Приключения",
      "Комедия",
      "Драма",
      "Романтика",
      "Фэнтези",
      "Научная фантастика",
      "Мистика / Детектив",
      "Ужасы",
      "Триллер",
      "Повседневность",
      "Спорт",
      "Сверхъестественное",
      "Исторический",
      "Военный",
      "Криминал",
      "Семейный",
      "Мюзикл",
      "Документальный",
      "Вестерн",
    ],
    en: [
      "Action",
      "Adventure",
      "Comedy",
      "Drama",
      "Romance",
      "Fantasy",
      "Sci-Fi",
      "Mystery",
      "Horror",
      "Thriller",
      "Slice of Life",
      "Sports",
      "Supernatural",
      "Historical",
      "War",
      "Crime",
      "Family",
      "Musical",
      "Documentary",
      "Western",
    ],
  };

  const ADDITIONAL = {
    ua: [
      "Психологічний",
      "Супергерої",
      "Кіберпанк",
      "Постапокаліпсис",
      "Меха / Роботи",
      "Ісекай (інший світ)",
      "Вампірський",
      "Монстри",
      "Шкільний",
      "Айдоли / Шоу-бізнес",
      "Романтична комедія",
      "Зворушливий",
      "Темне фентезі",
      "Детектив",
      "Культова класика",
      "Добрий / Позитивний",
      "Мрачний / Жорсткий",
      "Реальна історія",
      "Футуристичний",
      "Про дорослішання",
    ],
    ru: [
      "Психологический",
      "Супергерои",
      "Киберпанк",
      "Постапокалипсис",
      "Меха / Роботы",
      "Исекай (другой мир)",
      "Вампирский",
      "Монстры",
      "Школьный",
      "Айдолы / Шоу-бизнес",
      "Романтическая комедия",
      "Душераздирающий",
      "Тёмное фэнтези",
      "Детектив",
      "Культовая классика",
      "Добрый / Позитивный",
      "Мрачный / Жёсткий",
      "Реальная история",
      "Футуристический",
      "Про взросление",
    ],
    en: [
      "Psychological",
      "Superhero",
      "Cyberpunk",
      "Post-Apocalyptic",
      "Mecha / Robots",
      "Isekai (Another World)",
      "Vampire",
      "Monster",
      "School",
      "Idol / Showbiz",
      "Rom-Com",
      "Tearjerker",
      "Dark Fantasy",
      "Detective",
      "Cult Classic",
      "Feel Good",
      "Gritty",
      "True Story",
      "Futuristic",
      "Coming of Age",
    ],
  };

  // Function to translate genres
  const translateGenres = (genres) => {
    if (!genres || !Array.isArray(genres)) return [];

    return genres.map((genre) => {
      // Try to find the genre in current language
      const allGenres = [...GENRES[lang], ...ADDITIONAL[lang]];
      if (allGenres.includes(genre)) {
        return genre; // Already in correct language
      }

      // Try to find in other languages and translate
      for (const otherLang of ["ua", "ru", "en"]) {
        if (otherLang === lang) continue;

        const otherGenres = [...GENRES[otherLang], ...ADDITIONAL[otherLang]];
        const currentGenres = [...GENRES[lang], ...ADDITIONAL[lang]];

        const index = otherGenres.findIndex((g) => g === genre);
        if (index !== -1 && index < currentGenres.length) {
          return currentGenres[index];
        }
      }

      return genre; // Return original if not found
    });
  };

  const getContentType = () => {
    const template = labels[lang].next;
    // Get content type dynamically based on current language and stored key
    const contentTypeKey = contentType; // This is the key like "movie", "series", "anime"
    const contentTypeOption = contentTypeOptions.find(
      (opt) => opt.key === contentTypeKey
    );
    const contentString = contentTypeOption
      ? contentTypeOption.label[lang]
      : labels[lang].error;
    return template.replace("{content}", contentString);
  };

  const getContentTypeForDisplay = () => {
    // Get content type dynamically based on current language and stored key
    const contentTypeKey = contentType; // This is the key like "movie", "series", "anime"
    const contentTypeOption = contentTypeOptions.find(
      (opt) => opt.key === contentTypeKey
    );
    return contentTypeOption
      ? contentTypeOption.label[lang]
      : labels[lang].error;
  };

  return (
    <div className="summary-screen" lang={lang}>
      <div className="summary-content">
        <h2 className="summary-title">{labels[lang].title}</h2>

        <div className="content-type-section">
          <p className="content-type-info">
            {labels[lang].content_type}
            <strong className="content-type-value">
              {getContentTypeForDisplay()}
            </strong>
          </p>
        </div>

        <div className="participants-section">
          {participants.map((p, i) => (
            <div
              key={i}
              className={`summary-block ${
                i === 0 ? "left-card" : "right-card"
              }`}
            >
              <div className="participant-header">
                <h4 className="participant-name">
                  {i === 0
                    ? labels[lang].your_name + p.name
                    : p.isCharacter
                    ? labels[lang].character_name + p.name
                    : labels[lang].friend_name + p.name}
                </h4>
              </div>

              <div className="participant-preferences">
                <div className="preference-item dislike-content">
                  <span className="preference-label">
                    {labels[lang].dont_want_watch}
                  </span>
                  <span className="preference-value">
                    {p.dislikes && p.dislikes.length > 0 ? (
                      <ul className="genres-list">
                        {translateGenres(p.dislikes).map((genre, index) => (
                          <li key={index} className="genre-item">
                            {genre}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "Немає"
                    )}
                  </span>
                </div>

                <div className="preference-item like-content">
                  <span className="preference-label">
                    {labels[lang].want_watch}
                  </span>
                  <span className="preference-value">
                    {p.likes && p.likes.length > 0 ? (
                      <ul className="genres-list">
                        {translateGenres(p.likes).map((genre, index) => (
                          <li key={index} className="genre-item">
                            {genre}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "Немає"
                    )}
                  </span>
                </div>

                <div className="preference-item decade-content">
                  <span className="preference-label">
                    {labels[lang].decade}
                  </span>
                  <span className="preference-value">
                    {p.decade || "Не вибрано"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="action-section">
          <button
            className="btn btn-active summary-action-btn"
            onClick={onFind}
            disabled={loading} // Отключаем кнопку во время загрузки
          >
            {loading ? "Загрузка..." : getContentType()}
          </button>
        </div>
      </div>
    </div>
  );
}
