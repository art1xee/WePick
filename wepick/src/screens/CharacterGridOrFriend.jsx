import React, { useState } from "react";

/* simple characters */
const characters = [
  { id: "sherlock", name: "Sherlock" },
  { id: "naruto", name: "Naruto" },
  { id: "luffy", name: "Luffy" },
  { id: "tony", name: "Tony" },
  { id: "miyazaki", name: "Miyazaki" },
  { id: "eleven", name: "Eleven" },
  { id: "gandalf", name: "Gandalf" },
  { id: "leia", name: "Leia" },
  { id: "spike", name: "Spike" },
];

export default function CharacterGridOrFriend({ partnerType, onCharacter, onFriendName }) {
  const [name, setName] = useState("");

  if (partnerType === "popular-character") {
    return (
      <div className="screen">
        <h2>З ким ви хочете зіграти в WePick?</h2>
        <div className="grid-3">
          {characters.map(c => (
            <div key={c.id} className="char-card" onClick={()=>onCharacter(c)}>
              <div className="char-avatar">{c.name[0]}</div>
              <div>{c.name}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <h2>Передайте пристрій другу — нехай введе своє ім'я</h2>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Ім'я друга" />
      <button className={`btn ${name.trim()? "btn-active":"btn-disabled"}`} disabled={!name.trim()} onClick={()=>onFriendName(name.trim())}>Далі</button>
    </div>
  );
}
