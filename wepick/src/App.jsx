import React from "react";
import LandingScreen from "./screens/Loading.jsx";
import ContentType from "./screens/ContentType.jsx";
import PartnerChoice from "./screens/PartnerChoice.jsx";
import CharacterGridOrFriend from "./screens/CharacterGridOrFriend.jsx";
import PreferencesFlow from "./screens/PreferencesFlow.jsx";
import Summary from "./screens/Summary.jsx";
import Results from "./screens/Results.jsx";
import Header from "./components/Header.jsx";
import { useAppState } from "./hooks/useAppState";

/**
 * The main application component.
 * It orchestrates the entire user flow by conditionally rendering different "screen" components
 * based on the application's state, which is managed by the `useAppState` hook.
 */
export default function App() {
  // useAppState is a custom hook that centralizes all application state and logic.
  const {
    state, // The object containing all state variables (step, participants, etc.).
    resetAll, // Function to reset the entire application state.
    update, // Generic function to update top-level state properties.
    updateParticipant, // Function to update a specific participant's data.
    nextStep, // Function to advance to the next step.
    prevStep, // Function to go back to the previous step.
    forwardStep, // Function to move forward in history (used with browser controls).
    goToStep, // Function to jump to a specific step.
    ensureSecondParticipant, // Function to create a blank second participant.
    createCharacterParticipant, // Function to create a participant from a character profile.
    setLang, // Function to change the application language.
    onFind, // Function that triggers the final content search.
    reloadResults, // Function to re-run the search with the same preferences.
    goBackFromResultsAndClear, // (Not used in this component) a function to go back.
  } = useAppState();

  /**
   * This effect adds global keyboard shortcuts for navigation.
   * Alt + Left Arrow -> Go to the previous step.
   * Alt + Right Arrow -> Go to the next step.
   */
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key === "ArrowLeft") {
        e.preventDefault();
        prevStep();
      } else if (e.altKey && e.key === "ArrowRight") {
        e.preventDefault();
        forwardStep();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Cleanup function to remove the event listener when the component unmounts.
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevStep, forwardStep]);

  return (
    <div className="app">
      {/* The Header is always visible and handles language selection and app reset. */}
      <Header lang={state.lang} setLang={setLang} resetAll={resetAll} />
      <div className="container">
        {/* Step 1: Landing Screen - User enters their name. */}
        {state.step === 1 && (
          <LandingScreen
            lang={state.lang}
            onNext={(name) => {
              // Update the first participant's name and proceed.
              updateParticipant(0, { name });
              nextStep();
            }}
          />
        )}

        {/* Step 2: Content Type - User selects Movie, Series, or Anime. */}
        {state.step === 2 && (
          <ContentType
            lang={state.lang}
            userName={state.participants[0].name}
            value={state.contentType}
            onSelect={(selectedOption) => {
              // Update the global content type and the participant's choice.
              update({ contentType: selectedOption.key });
              updateParticipant(0, { content: selectedOption.label });
            }}
            onNext={() => nextStep()}
          />
        )}

        {/* Step 3: Partner Choice - User selects a friend or a popular character. */}
        {state.step === 3 && (
          <PartnerChoice
            lang={state.lang}
            contentType={state.participants[0].content}
            value={state.partnerType}
            onSelect={(selectedOption) =>
              update({ partnerType: selectedOption.key })
            }
            onNext={() => {
              // If the user chose "friend", create a blank second participant object.
              if (state.partnerType === "friend") {
                ensureSecondParticipant();
              }
              nextStep();
            }}
          />
        )}

        {/* Step 4: Character Grid or Friend Name Input */}
        {state.step === 4 && (
          <CharacterGridOrFriend
            lang={state.lang}
            partnerType={state.partnerType}
            onCharacter={(char) => createCharacterParticipant(char)} // If character, create participant from character data.
            onFriendName={(name) => {
              // If friend, update the second participant's name and proceed.
              updateParticipant(1, {
                name,
                content: state.participants[0].content,
              });
              nextStep();
            }}
          />
        )}

        {/* Step 5: Preferences Flow (User 1) - User selects their genre preferences. */}
        {state.step === 5 && (
          <PreferencesFlow
            lang={state.lang}
            participant={state.participants[0]}
            userName={state.participants[0].name}
            onSave={(data) => {
              // Save the preferences for the first participant and proceed.
              updateParticipant(0, data);
              nextStep();
            }}
          />
        )}

        {/* Step 6: Preferences Flow (User 2) - Only shown if the partner is a friend. */}
        {state.step === 6 && state.partnerType === "friend" && (
          <PreferencesFlow
            lang={state.lang}
            participant={state.participants[1]}
            userName={state.participants[1].name}
            onSave={(data) => {
              // Save the preferences for the second participant and proceed.
              updateParticipant(1, data);
              nextStep();
            }}
          />
        )}

        {/* Step 7: Summary Screen - Shown before the final results. */}
        {/* This step is shown on step 7 (after friend's preferences) OR on step 6 if the partner was a character (skipping the friend's preference flow). */}
        {(state.step === 7 ||
          (state.step === 6 && state.partnerType === "popular-character")) && (
          <Summary
            participants={state.participants}
            contentType={state.contentType}
            onFind={onFind} // Triggers the API call to find content.
            lang={state.lang}
            loading={state.loading}
          />
        )}

        {/* Step 8: Results Screen - Displays the fetched content. */}
        {state.step === 8 && (
          <Results
            movies={state.results}
            onRestart={resetAll} // Allows starting the whole process over.
            lang={state.lang}
            onReload={reloadResults} // Allows fetching a new set of results with the same preferences.
            loading={state.loading}
            didWeakenFilters={state.didWeakenFilters} // Flag to show a warning if filters were relaxed.
            characterName={state.characterName}
            participants={state.participants}
            contentType={state.contentType}
          />
        )}
      </div>
    </div>
  );
}
