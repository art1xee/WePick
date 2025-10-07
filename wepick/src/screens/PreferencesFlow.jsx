import React, { useState } from "react";

/*
This component handles:
- select 3 dislikes (from 16)
- then select 3 likes (from 16)
- pick decade (we include decade selection here for simplicity)
*/
const GENRES = [
  "action","adventure","animation","crime","comedy","romance","drama","family",
  "fantasy","horror","musical","documentary","sci-fi","thriller","war","western"
];

const ADDITIONAL = [
  "feel good","indie","monster","detective","classic","superhero","cult","tearjerker",
  "sports","date night","gangster","futuristic","explosive","gritty","true story"
];

export default function PreferencesFlow({ participant, onSave }) {
  const [step, setStep] = useState("dislikes"); // 'dislikes'|'likes'
  const [dislikes, setDislikes] = useState(participant.dislikes || []);
  const [likes, setLikes] = useState(participant.likes || []);
  const [decade, setDecade] = useState(participant.decade || 2000);

  const addToggle = (arr,set, val, limit) => {
    if (arr.includes(val)) set(arr.filter(x=>x!==val));
    else {
      if (arr.length >= limit) return;
      set([...arr, val]);
    }
  };

  const decades = [1920,1930,1940,1950,1960,1970,1980,1990,2000,2010,2020];

  return (
    <div className="screen">
      {step === "dislikes" && (
        <>
          <h3>Оберіть 3 жанри, які ви <em>не хочете</em> дивитись</h3>
          <div className="grid-4">
            {GENRES.map(g => (
              <button key={g} className={dislikes.includes(g)? "genre selected":"genre"} onClick={()=>addToggle(dislikes,setDislikes,g,3)}>
                {g}
              </button>
            ))}
          </div>
          <div style={{marginTop:12}}>
            <button className={`btn ${dislikes.length===3 ? "btn-active":"btn-disabled"}`} disabled={dislikes.length!==3} onClick={()=>setStep("likes")}>Далі</button>
          </div>
        </>
      )}

      {step === "likes" && (
        <>
          <h3>Оберіть 3 жанри, які ви <em>хочете</em> дивитись</h3>
          <div className="grid-4">
            {GENRES.concat(ADDITIONAL).slice(0,16).map(g => (
              <button key={g} className={likes.includes(g)? "genre selected":"genre"} onClick={()=>addToggle(likes,setLikes,g,3)}>
                {g}
              </button>
            ))}
          </div>

          <div style={{marginTop:12}}>
            <label>Оберіть декаду:</label>
            <select value={decade} onChange={e=>setDecade(Number(e.target.value))}>
              {[1920,1930,1940,1950,1960,1970,1980,1990,2000,2010,2020].map(d=>(
                <option key={d} value={d}>{d}s</option>
              ))}
            </select>
          </div>

          <div style={{marginTop:12}}>
            <button className={`btn ${likes.length===3 ? "btn-active":"btn-disabled"}`} disabled={likes.length!==3} onClick={()=>onSave({ likes, dislikes, decade })}>Зберегти</button>
          </div>
        </>
      )}
    </div>
  );
}
