import { useState, useEffect } from "react";
import { GENRES, ADDITIONAL_GENRES } from "../constants/genres";
import { fetchContentForParticipantsUnified as fetchContentForParticipants } from "../services/unifiend/unifiedService";

const USER_NAME_STORAGE_KEY = "wepick_username";

const initialState = () => ({
  lang: "ua",
  step: 1,
  stepHistory: [1],
  currentStepIndex: 0,
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
  didWeakenFilters: false,
  characterName: null,
  loading: false,
  allFetchedResults: [],
  currentResultsPage: 0,
});

export const useAppState = () => {
  const [state, setState] = useState(() => {
    const initial = initialState();
    try {
      const savedName = localStorage.getItem(USER_NAME_STORAGE_KEY);
      if (savedName) {
        initial.participants[0].name = savedName;
      }
    } catch (error) {
      console.error("Error loading name from localStorage:", error);
    }

    const hashStep = parseInt(window.location.hash.replace("#step=", ""), 10);
    if (!isNaN(hashStep) && hashStep > 0) {
      initial.step = hashStep;
    }
    return initial;
  });

  useEffect(() => {
    try {
      if (state.participants[0] && state.participants[0].name) {
        localStorage.setItem(USER_NAME_STORAGE_KEY, state.participants[0].name);
      } else {
        localStorage.removeItem(USER_NAME_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Error saving name to localStorage:", error);
    }
  }, [state.participants[0]?.name]);

  const resetAll = () => {
    setState(initialState());
    try {
      localStorage.removeItem(USER_NAME_STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
    window.history.replaceState({ step: 1 }, "", "#step=1");
  };

  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.step) {
        setState((s) => {
          const newStepIndex = s.stepHistory.lastIndexOf(event.state.step);
          if (newStepIndex !== -1) {
            // ВАЖНО: Очистка предпочтений при возврате на шаги 1 или 4
            const shouldClearPreferences =
              event.state.step === 1 || event.state.step === 4;

            if (shouldClearPreferences) {
              const updatedParticipants = s.participants.map((p) => ({
                ...p,
                dislikes: [],
                likes: [],
                decade: 2000,
              }));

              return {
                ...s,
                step: event.state.step,
                currentStepIndex: newStepIndex,
                participants: updatedParticipants,
                results: [],
                didWeakenFilters: false,
                characterName: null,
                allFetchedResults: [],
                currentResultsPage: 0,
              };
            }

            return {
              ...s,
              step: event.state.step,
              currentStepIndex: newStepIndex,
            };
          }
          return s;
        });
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    const currentPath = `#step=${state.step}`;
    if (window.location.hash !== currentPath) {
      window.history.pushState({ step: state.step }, "", currentPath);
    }
  }, [state.step]);

  const update = (patch) => setState((s) => ({ ...s, ...patch }));

  const updateParticipant = (idx, patch) => {
    setState((s) => {
      const participants = [...s.participants];
      participants[idx] = { ...participants[idx], ...patch };
      return { ...s, participants };
    });
  };

  const nextStep = () =>
    setState((s) => {
      const newStep = s.step + 1;
      const newHistory = s.stepHistory.slice(0, s.currentStepIndex + 1);
      newHistory.push(newStep);
      return {
        ...s,
        step: newStep,
        stepHistory: newHistory,
        currentStepIndex: newHistory.length - 1,
      };
    });

  const prevStep = () => {
    setState((s) => {
      if (s.currentStepIndex > 0) {
        const newStepIndex = s.currentStepIndex - 1;
        const newStep = s.stepHistory[newStepIndex];

        // КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: Очистка данных при возврате на шаг выбора персонажа (4) или главный экран (1)
        const shouldClearPreferences = newStep === 1 || newStep === 4;

        if (shouldClearPreferences) {
          const updatedParticipants = s.participants.map((p) => ({
            ...p,
            dislikes: [],
            likes: [],
            decade: 2000,
          }));

          return {
            ...s,
            step: newStep,
            currentStepIndex: newStepIndex,
            participants: updatedParticipants,
            results: [],
            didWeakenFilters: false,
            characterName: null,
            allFetchedResults: [],
            currentResultsPage: 0,
          };
        }

        return {
          ...s,
          step: newStep,
          currentStepIndex: newStepIndex,
        };
      } else {
        alert("You can't go back from the main screen");
      }
      return s;
    });
  };

  const forwardStep = () => {
    setState((s) => {
      if (s.step === 8) {
        alert("You can't go forward from the results screen");
        return s;
      }
      if (s.currentStepIndex < s.stepHistory.length - 1) {
        const newStepIndex = s.currentStepIndex + 1;
        return {
          ...s,
          step: s.stepHistory[newStepIndex],
          currentStepIndex: newStepIndex,
        };
      }
      return s;
    });
  };

  const goToStep = (step) => {
    setState((s) => {
      const newHistory = s.stepHistory.slice(0, s.currentStepIndex + 1);
      if (newHistory[newHistory.length - 1] !== step) {
        newHistory.push(step);
      }
      return {
        ...s,
        step,
        stepHistory: newHistory,
        currentStepIndex: newHistory.length - 1,
      };
    });
  };

  const goBackFromResultsAndClear = (targetStep) => {
    setState((s) => {
      const updatedParticipants = s.participants.map((p) => {
        if (!p.isCharacter) {
          return {
            ...p,
            dislikes: [],
            likes: [],
            decade: 2000,
          };
        }
        return p;
      });

      const newHistory = s.stepHistory.slice(0, s.currentStepIndex + 1);
      let newStepIndex = newHistory.lastIndexOf(targetStep);
      if (newStepIndex === -1) {
        newHistory.push(targetStep);
        newStepIndex = newHistory.length - 1;
      }

      return {
        ...s,
        step: targetStep,
        stepHistory: newHistory,
        currentStepIndex: newStepIndex,
        participants: updatedParticipants,
        results: [],
        didWeakenFilters: false,
        characterName: null,
        allFetchedResults: [],
        currentResultsPage: 0,
      };
    });
  };

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
    const currentLang = state.lang;
    const allGenres = [
      ...GENRES[currentLang],
      ...ADDITIONAL_GENRES[currentLang],
    ];

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
    const decadeOptions = [
      1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020,
    ];
    const decade =
      decadeOptions[Math.floor(Math.random() * decadeOptions.length)];

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
        const allGenres = [...GENRES[newLang], ...ADDITIONAL_GENRES[newLang]];
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
          likes: sample(allGenres, 3),
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

  const onFind = async () => {
    setState((s) => ({ ...s, loading: true }));

    try {
      const tmdbLanguage =
        state.lang === "ua" ? "uk-UA" : state.lang === "ru" ? "ru-RU" : "en-US";
      const { results, didWeakenFilters, characterName } =
        await fetchContentForParticipants(
          state.participants,
          state.contentType,
          tmdbLanguage
        );
      setState((s) => ({
        ...s,
        results,
        loading: false,
        step: 8,
        didWeakenFilters,
        characterName,
        allFetchedResults: results,
        currentResultsPage: 0,
      }));
    } catch (error) {
      console.error("Ошибка при загрузке контента:", error);
      setState((s) => ({ ...s, loading: false }));
    }
  };

  const reloadResults = async () => {
    setState((s) => ({ ...s, loading: true, results: [] }));

    try {
      const tmdbLanguage =
        state.lang === "ua" ? "uk-UA" : state.lang === "ru" ? "ru-RU" : "en-US";
      const { results, didWeakenFilters, characterName } =
        await fetchContentForParticipants(
          state.participants,
          state.contentType,
          tmdbLanguage
        );
      setState((s) => ({
        ...s,
        results,
        loading: false,
        didWeakenFilters,
        characterName,
      }));
    } catch (error) {
      console.error("Ошибка при перезагрузке контента:", error);
      setState((s) => ({ ...s, loading: false }));
    }
  };

  return {
    state,
    resetAll,
    update,
    updateParticipant,
    nextStep,
    prevStep,
    forwardStep,
    goToStep,
    ensureSecondParticipant,
    createCharacterParticipant,
    setLang,
    onFind,
    reloadResults,
    goBackFromResultsAndClear,
  };
};
