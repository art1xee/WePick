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

export default function CharacterGridOrFriend({
  lang = "ua",
  onChoose,
  onNext,
  value,
  partnerType,
  onCharacter,
  onFriendName,
}) {
  const [name, setName] = useState("");

  //consts for Friend Screen:
  const labelsFriend = {
    ua: {
      title: "Передай пристрій другу — нехай введе своє ім'я.",
      placeholder: "Ім'я друга",
      next: "Далі!",
    },
    ru: {
      title: "Передай устройство своему другу - пусть введёт своё имя.",
      placeholder: "Имя друга",
      next: "Далее!",
    },
    en: {
      title: "Pass the device to your friend — let them enter his name.",
      placeholder: "Friend name",
      next: "Next!",
    },
  };

  const getTitleFriend = () => {
    const template = labelsFriend[lang].title;
    return template;
  };

  const getPlaceholderFriend = () => {
    const template = labelsFriend[lang].placeholder;
    return template;
  };

  if (partnerType === "popular-character") {
    return (
      <div className="screen">
        <h2>З ким ви хочете зіграти в WePick?</h2>
        <div className="grid-3">
          {characters.map((c) => (
            <div
              key={c.id}
              className="char-card"
              onClick={() => onCharacter(c)}
            >
              <div className="char-avatar">{c.name[0]}</div>
              <div>{c.name}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="friend-screen">
      <h2 className="friend-screen-h2">{getTitleFriend()}</h2>
      <input
        className="friend-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={getPlaceholderFriend()}
      />

        <button
        className={`btn ${name.trim() ? "btn-active" : "btn-disabled"}`}
        disabled={!name.trim()}
        onClick={() => onFriendName(name.trim())}
      >
        {labelsFriend[lang].next}
      </button>

    </div>
  );
}
