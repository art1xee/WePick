import React, { useState } from "react";
import Landing from "./screens/Loading";
import ContentType from "./screens/ContentType";
import PartnerChoice from "./screens/PartnerChoice";
import CharacterGridOrFriend from "./screens/CharacterGridOrFriend";
import PreferencesFlow from "./screens/PreferencesFlow";
import DecadePicker from "./screens/DecadePicker";
import Summary from "./screens/Summary";
import Results from "./screens/Results";
import Header from "./components/Header";
const moviesData = []; 

const initialState = () => ({
  lang: "ua",
  step: 1,
  contentType: null, // 'movie' | 'series' | 'anime'
  partnerType: null, // 'friend' | 'character'
  participants: [
    { name: null, dislikes: [], likes: [], decade: 2000, isCharacter: false }
  ],
  chosenCharacter: null,
  results: [],
  movies: moviesData,
});

export default function App() {
  const [state, setState] = useState(initialState());

  const setLang = (lang) => setState(s => ({ ...s, lang }));

  const resetAll = () => setState(initialState());

  const update = (patch) => setState(s => ({ ...s, ...patch }));

  // helpers to update participant
  const updateParticipant = (idx, patch) => {
    setState(s => {
      const participants = [...s.participants];
      participants[idx] = { ...participants[idx], ...patch };
      return { ...s, participants };
    });
  };

  // navigation helpers
  const nextStep = () => setState(s => ({ ...s, step: s.step + 1 }));
  const goToStep = (step) => setState(s => ({ ...s, step }));

  // compute if second participant exists (friend flow will add one)
  const ensureSecondParticipant = () => {
    setState(s => {
      if (s.participants.length < 2) {
        return { ...s, participants: [...s.participants, { name: null, dislikes: [], likes: [], decade: 2000, isCharacter: false }] };
      }
      return s;
    });
  };

  // create character participant with random prefs
  const createCharacterParticipant = (char) => {
    // generate random choices (simple)
    const genres = [
      "action","adventure","animation","crime","comedy","romance","drama","family",
      "fantasy","horror","musical","documentary","sci-fi","thriller","war","western",
      "feel good","indie","monster","detective","classic","superhero","cult","tearjerker",
      "sports","date night","gangster","futuristic","explosive","gritty","true story"
    ];
    const sample = (arr,n)=>{
      const a = [...arr];
      const out = [];
      while(out.length < n && a.length){
        const i = Math.floor(Math.random()*a.length);
        out.push(a.splice(i,1)[0]);
      }
      return out;
    };
    const dislikes = sample(genres,3);
    const likes = sample(genres,3);
    const decadeOptions = [1920,1930,1940,1950,1960,1970,1980,1990,2000,2010,2020];
    const decade = decadeOptions[Math.floor(Math.random()*decadeOptions.length)];
    // push second participant with char info
    setState(s => {
      const participants = [...s.participants];
      participants[1] = { name: char.name, dislikes, likes, decade, isCharacter: true };
      return { ...s, participants, chosenCharacter: char, step: s.step + 1 };
    });
  };

  // matching algorithm (simple)
  const findMatches = () => {
    const participants = state.participants;
    const filtered = state.movies.filter(m => m.type === state.contentType);
    const scoreMovie = (movie) => {
      let score = 0;
      for (const p of participants) {
        for (const like of (p.likes || [])) {
          if (movie.genres.includes(like)) score += 1;
        }
        for (const dislike of (p.dislikes || [])) {
          if (movie.genres.includes(dislike)) score -= 2;
        }
        const movieDecade = Math.floor(movie.year / 10) * 10;
        if (p.decade && movieDecade === p.decade) score += 1;
      }
      return score;
    };
    const scored = filtered.map(m => ({ movie: m, score: scoreMovie(m) }))
      .filter(x => x.score > -5) // prune awful ones
      .sort((a,b) => b.score - a.score);
    return scored.map(x => x.movie);
  };

  const onFind = () => {
    const matches = findMatches();
    setState(s => ({ ...s, results: matches, step: 8 }));
  };

  // render the correct screen based on step
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
            value={state.contentType}
            onSelect={(type) => update({ contentType: type })}
            onNext={() => nextStep()}
          />
        )}

        {state.step === 3 && (
          <PartnerChoice
            onChoose={(t) => {
              update({ partnerType: t });
              if (t === "friend") {
                ensureSecondParticipant();
              }
              nextStep();
            }}
          />
        )}

        {state.step === 4 && (
          <CharacterGridOrFriend
            partnerType={state.partnerType}
            onCharacter={(char) => createCharacterParticipant(char)}
            onFriendName={(name) => {
              // set participant 2 name and continue to prefs for participant1
              update(s => {
                const participants = [...s.participants];
                participants[1].name = name;
                return { ...s, participants, step: s.step + 1 };
              });
              // simpler: directly:
              updateParticipant(1, { name });
              nextStep();
            }}
          />
        )}

        {/* Preferences for participant 1 */}
        {state.step === 5 && (
          <PreferencesFlow
            lang={state.lang}
            participant={state.participants[0]}
            onSave={(data) => {
              updateParticipant(0, data);
              // if partner is friend -> next we need to collect prefs for participant 2
              if (state.partnerType === "friend") {
                nextStep(); // go to step 6 (prefs for participant 2)
              } else {
                nextStep(); // partner is char -> go to decade for participant1 (we will show DecadePicker next)
              }
            }}
          />
        )}

        {/* If friend: preferences for participant 2 */}
        {state.step === 6 && state.partnerType === "friend" && (
          <PreferencesFlow
            lang={state.lang}
            participant={state.participants[1]}
            onSave={(data) => {
              updateParticipant(1, data);
              nextStep(); // go to step 7 (decade for participant1? we'll use same step numbering: next is decade for participant1 - but both already have decades from prefs component, so skip to summary)
              // in our impl, PreferencesFlow includes decade selection, so both done -> go to summary
            }}
          />
        )}

        {/* If character path: after step 5 we are here (step 6) — but we already set character's prefs earlier — Next */}
        {state.step === 6 && state.partnerType === "character" && (
          <div style={{ padding: 20 }}>
            <button onClick={() => nextStep()}>Далі</button>
          </div>
        )}

        {/* Summary */}
        {((state.step === 7) || (state.step === 6 && state.partnerType === "character")) && (
          <Summary
            participants={state.participants}
            contentType={state.contentType}
            onFind={onFind}
            lang={state.lang}
          />
        )}

        {/* Results */}
        {state.step === 8 && (
          <Results
            movies={state.results}
            onRestart={resetAll}
          />
        )}
      </div>
    </div>
  );
}
