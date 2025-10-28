import React, { useEffect } from "react";
import Landing from "./screens/Loading.jsx";
import ContentType from "./screens/ContentType.jsx";
import PartnerChoice from "./screens/PartnerChoice.jsx";
import CharacterGridOrFriend from "./screens/CharacterGridOrFriend.jsx";
import PreferencesFlow from "./screens/PreferencesFlow.jsx";
import Summary from "./screens/Summary.jsx";
import Results from "./screens/Results.jsx";
import Header from "./components/Header.jsx";
import { useAppState } from "./hooks/useAppState.js";

export default function App() {
  const {
    state,
    resetAll,
    update,
    updateParticipant,
    nextStep,
    prevStep,
    forwardStep,
    ensureSecondParticipant,
    createCharacterParticipant,
    setLang,
    onFind,
  } = useAppState();

  useEffect(() => {
    const handleKeyDown = (event) => {
      console.log("Key pressed:", event.key);
      if (event.key === "ArrowLeft") {
        prevStep();
      } else if (event.key === "ArrowRight") {
        forwardStep();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [prevStep, forwardStep]);

  return (
    <div className="app">
          <Header lang={state.lang} setLang={setLang} resetAll={resetAll} /> 
      <div className="container">
        {state.step === 1 && (
          <Landing
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
