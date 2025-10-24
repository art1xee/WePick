import React, { useState } from "react";
import LandingScreen from "./screens/Loading.jsx";
import ContentType from "./screens/ContentType.jsx";
import PartnerChoice from "./screens/PartnerChoice.jsx";
import CharacterGridOrFriend from "./screens/CharacterGridOrFriend.jsx";
import PreferencesFlow from "./screens/PreferencesFlow.jsx";
import Summary from "./screens/Summary.jsx";
import Results from "./screens/Results.jsx";
import Header from "./components/Header.jsx";
// ИМПОРТ: Теперь здесь fetchContentForParticipantsUnified
import { fetchContentForParticipantsUnified } from "./services/unifiend/unifiedService.js";

const initialState = () => ({
  lang: "ua",
  step: 1,
  contentType: null,
  partnerType: null,
  participants: [
    {
      name: null,
      dislikes: [],
      likes: [],
      decade: 2000,
      isCharacter: false,
      content: null,
    },
  ],
  chosenCharacter: null,
  results: [],
  loading: false, // Добавляем состояние загрузки
  didWeakenFilters: false, // <-- ДОБАВИТЬ ЭТО
  characterName: null,     // <-- ДОБАВИТЬ ЭТО

});

export default function App() {
  const [state, setState] = useState(initialState());

  const resetAll = () => setState(initialState());

  const update = (patch) => setState((s) => ({ ...s, ...patch }));

  const updateParticipant = (idx, patch) => {
    setState((s) => {
      const participants = [...s.participants];
      participants[idx] = { ...participants[idx], ...patch };
      return { ...s, participants };
    });
  };

  const nextStep = () => setState((s) => ({ ...s, step: s.step + 1 }));
  const goToStep = (step) => setState((s) => ({ ...s, step }));

  const prevStep = () => {
    setState((s) => {
      if (s.step > 1) {
        return { ...s, step: s.step - 1 };
      }
      return s;
    });
  };

  React.useEffect(() => {
    window.history.pushState({ step: state.step }, "", `#step=${state.step}`);

    const handlePopState = (event) => {
      if (event.state && event.state.step) {
        goToStep(event.state.step);
      } else {
        goToStep(1);
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [state.step]);

  const ensureSecondParticipant = () => {
    setState((s) => {
      if (s.participants.length < 2) {
        return {
          ...s,
          participants: [
            ...s.participants,
            {
              name: null,
              dislikes: [],
              likes: [],
              decade: 2000,
              isCharacter: false,
              content: null,
            },
          ],
        };
      }
      return s;
    });
  };

  const createCharacterParticipant = (char) => {
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

    const currentLang = state.lang;
    const allGenres = [...GENRES[currentLang], ...ADDITIONAL[currentLang]];

    const sample = (arr, n) => {
      const a = [...arr];
      const out = [];
      const len = Math.min(n, a.length);
      while (out.length < len) {
        const i = Math.floor(Math.random() * a.length);
        out.push(a.splice(i, 1)[0]);
      }
      return out;
    };

    const dislikes = sample(allGenres, 3);
    const likes = sample(allGenres, 3);
    const decadeOptions = [1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];
    const decade = decadeOptions[Math.floor(Math.random() * decadeOptions.length)];

    setState((s) => {
      const participants = [...s.participants];
      if (participants.length < 2) {
        participants.push({});
      }
      participants[1] = {
        name: char.name,
        dislikes,
        likes,
        decade,
        isCharacter: true,
        content: participants[0].content,
      };
      return { ...s, participants, chosenCharacter: char, step: s.step + 1 };
    });
  };

  const updateCharacterGenres = (newLang) => {
    setState((s) => {
      if (s.participants.length > 1 && s.participants[1].isCharacter) {
        const GENRES = {
          ua: [
            "Бойовик", "Пригоди", "Комедія", "Драма",
            "Романтика", "Фентезі", "Наукова фантастика", "Містика / Детектив",
            "Жахи", "Трилер", "Повсякденість", "Спорт",
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

        const allGenres = [...GENRES[newLang], ...ADDITIONAL[newLang]];
        
        const sample = (arr, n) => {
          const a = [...arr];
          const out = [];
          const len = Math.min(n, a.length);
          while (out.length < len) {
            const i = Math.floor(Math.random() * a.length);
            out.push(a.splice(i, 1)[0]);
          }
          return out;
        };

        const participants = [...s.participants];
        participants[1] = {
          ...participants[1],
          dislikes: sample(allGenres, 3),
          likes: sample(allGenres, 3)
        };

        return { ...s, participants };
      }
      return s;
    });
  };

  const setLang = (lang) => {
    setState((s) => ({ ...s, lang }));
    setTimeout(() => updateCharacterGenres(lang), 0);
  };

  // НОВАЯ ФУНКЦИЯ: Загрузка контента через API
  const onFind = async () => {
    setState((s) => ({ ...s, loading: true }));

    try {
        // Преобразуем язык в формат TMDb
        const tmdbLanguage = state.lang === 'ua' ? 'uk-UA' :
            state.lang === 'ru' ? 'ru-RU' : 'en-US';

        // ИСПРАВЛЕНИЕ: Вызываем fetchContentForParticipantsUnified
        const { results, didWeakenFilters, characterName } = await fetchContentForParticipantsUnified(
            state.participants,
            state.contentType,
            tmdbLanguage
        );

        setState((s) => ({
            ...s,
            results,
            loading: false,
            step: 8,
            didWeakenFilters, // <-- ОБНОВЛЕНИЕ СОСТОЯНИЯ
            characterName     // <-- ОБНОВЛЕНИЕ СОСТОЯНИЯ
        }));
    } catch (error) {
        console.error('Ошибка при загрузке контента:', error);
        setState((s) => ({ ...s, loading: false }));
    }
};

  return (
    <div className="app">
      <Header lang={state.lang} setLang={setLang} resetAll={resetAll} />
      <div className="container">
        {state.step === 1 && (
          <LandingScreen
            lang={state.lang}
            onNext={(name) => {
              updateParticipant(0, { name });
              nextStep();
            }}
          />
        )}

        {state.step === 2 && (
          <ContentType
            lang={state.lang}
            userName={state.participants[0].name}
            value={state.contentType}
            onSelect={(selectedOption) => {
              update({ contentType: selectedOption.key });
              updateParticipant(0, { content: selectedOption.label });
            }}
            onNext={() => nextStep()}
          />
        )}

        {state.step === 3 && (
          <PartnerChoice
            lang={state.lang}
            contentType={state.participants[0].content}
            value={state.partnerType}
            onSelect={(selectedOption) =>
              update({ partnerType: selectedOption.key })
            }
            onNext={() => {
              if (state.partnerType === "friend") {
                ensureSecondParticipant();
              }
              nextStep();
            }}
          />
        )}

        {state.step === 4 && (
          <CharacterGridOrFriend
            lang={state.lang}
            partnerType={state.partnerType}
            onCharacter={(char) => createCharacterParticipant(char)}
            onFriendName={(name) => {
              updateParticipant(1, {
                name,
                content: state.participants[0].content,
              });
              nextStep();
            }}
          />
        )}

        {state.step === 5 && (
          <PreferencesFlow
            lang={state.lang}
            participant={state.participants[0]}
            userName={state.participants[0].name}
            onSave={(data) => {
              updateParticipant(0, data);
              nextStep();
            }}
          />
        )}

        {state.step === 6 && state.partnerType === "friend" && (
          <PreferencesFlow
            lang={state.lang}
            participant={state.participants[1]}
            userName={state.participants[1].name}
            onSave={(data) => {
              updateParticipant(1, data);
              nextStep();
            }}
          />
        )}

        {(state.step === 7 ||
          (state.step === 6 && state.partnerType === "popular-character")) && (
          <Summary
            participants={state.participants}
            contentType={state.contentType}
            onFind={onFind}
            lang={state.lang}
            loading={state.loading}
          />
        )}

       {state.step === 8 && (
    <Results
        movies={state.results}
        onRestart={resetAll}
        lang={state.lang}
        loading={state.loading}
        didWeakenFilters={state.didWeakenFilters} 
        characterName={state.characterName}      
        participants={state.participants}
        contentType={state.contentType}
    />
)}
      </div>
    </div>
  );
}
