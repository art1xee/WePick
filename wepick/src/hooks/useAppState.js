import { useState, useEffect } from "react";
import { GENRES, ADDITIONAL_GENRES } from "../constants/genres";
import { fetchContentForParticipantsUnified } from "../services/unifiend/unifiedService";

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
});

export const useAppState = () => {
  const [state, setState] = useState(() => {
    // Handle initial load from URL hash for step
    const hashStep = parseInt(window.location.hash.replace("#step=", ""), 10);
    if (!isNaN(hashStep) && hashStep > 0) {
      return { ...initialState(), step: hashStep };
    }
    return initialState();
  });

  // Resets all state
  const resetAll = () => {
    setState(initialState());
  };

  // Effect to handle browser's back/forward buttons (popstate event)
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.step) {
        setState((s) => {
          const newStepIndex = s.stepHistory.lastIndexOf(event.state.step);
          if (newStepIndex !== -1) {
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

  // Effect to update URL hash when step changes
  useEffect(() => {
    const currentPath = `#step=${state.step}`;
    if (window.location.hash !== currentPath) {
      window.history.pushState({ step: state.step }, "", currentPath);
    }
  }, [state.step]);

  // Generic state update function
  const update = (patch) => setState((s) => ({ ...s, ...patch }));

  // Updates a specific participant's data
  const updateParticipant = (idx, patch) => {
    setState((s) => {
      const participants = [...s.participants];
      participants[idx] = { ...participants[idx], ...patch };
      return { ...s, participants };
    });
  };

  // Navigates to the next step
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

        // Clear preferences if navigating back from results (step 8) or back to the first step
        const shouldClearPreferences = newStep === 1;

        if (shouldClearPreferences) {
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

          return {
            ...s,
            step: newStep,
            currentStepIndex: newStepIndex,
            participants: updatedParticipants,
            results: [],
            didWeakenFilters: false,
            characterName: null,
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

  // Navigates forward in history if possible
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

  // Navigates to a specific step, adding to history if needed
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

  // Navigates back from results screen and clears user preferences
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
      };
    });
  };

  // Ensures a second participant slot exists
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

  // Creates a character participant with random preferences
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

  // Updates character genres based on new language
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

  // Sets the application language
  const setLang = (lang) => {
    setState((s) => ({ ...s, lang }));
    setTimeout(() => updateCharacterGenres(lang), 0);
  };

  // Initiates content search and navigates to results
  const onFind = async () => {
    setState((s) => ({ ...s, loading: true }));

    try {
      const tmdbLanguage =
        state.lang === "ua" ? "uk-UA" : state.lang === "ru" ? "ru-RU" : "en-US";
      const { results, didWeakenFilters, characterName } =
        await fetchContentForParticipantsUnified(
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
      }));
    } catch (error) {
      console.error("Ошибка при загрузке контента:", error);
      setState((s) => ({ ...s, loading: false }));
    }
  };

  // Reloads content results without changing the step
  const reloadResults = async () => {
    setState((s) => ({ ...s, loading: true, results: [] }));

    try {
      const tmdbLanguage =
        state.lang === "ua" ? "uk-UA" : state.lang === "ru" ? "ru-RU" : "en-US";
      const { results, didWeakenFilters, characterName } =
        await fetchContentForParticipantsUnified(
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
