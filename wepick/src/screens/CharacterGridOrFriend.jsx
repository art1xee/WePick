import React, { useState } from "react";

/* simple characters */
const characters = [
  { id: "Joker", name: "Joker" },
  { id: "luffy", name: "Monkey D.Luffy" },
  { id: "chopper", name: "Chopper" },
  { id: "sherlock", name: "Sherlock" },
  { id: "levi-ackerman", name: "Levi Ackerman" },
  { id: "walter-white", name: "Walter White" },
  { id: "john-wick", name: "John Wick" },
  { id: "naruto", name: "Naruto" },
  { id: "geralt-of-rivia", name: "Geralt" },
];

const labels = {
  ua: { 
    title_char: "З ким ви хочете зіграти в WePick?", 
    title_friend: "Передайте пристрій другу — нехай введе своє ім'я",
    placeholder: "Ім'я друга",
    next: "Далі!" 
  },
  ru: { 
    title_char: "С кем вы хотите сыграть в WePick?", 
    title_friend: "Передайте устройство другу — пусть введёт своё имя",
    placeholder: "Имя друга",
    next: "Далее!" 
  },
  en: { 
    title_char: "Who do you want to play WePick with?", 
    title_friend: "Pass the device to a friend — let them enter their name",
    placeholder: "Friend's name",
    next: "Next!" 
  }
};

export default function CharacterGridOrFriend({ lang = 'ua', partnerType, onCharacter, onFriendName }) {
  const [name, setName] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  // Убедимся, что выбранный язык существует, иначе используем 'ua'
  const t = labels[lang] || labels.ua;

  if (partnerType === "popular-character") {
    const handleCharacterSelect = (char) => {
      setSelectedCharacter(char);
    };

    const handleNext = () => {
      if (selectedCharacter) {
        onCharacter(selectedCharacter);
      }
    };

    return (
      <div className="character-screen">
        <h2>{t.title_char}</h2>
        <div className="grid-3">
          {characters.map((c) => (
            <div
              key={c.id}
              className={`char-card ${selectedCharacter && selectedCharacter.id === c.id ? "char-card-selected" : ""}`}
              onClick={() => handleCharacterSelect(c)}
            >
              <div className="char-avatar">{c.name[0]}</div>
              <div>{c.name}</div>
            </div>
          ))}
        </div>

        <div className="center-btn" style={{ marginTop: 40 }}>
          <button
            className={`btn ${selectedCharacter ? "btn-active" : "btn-disabled"}`}
            disabled={!selectedCharacter}
            onClick={handleNext}
          >
            {t.next}
          </button>
        </div>
      </div>
    );
  }

  // Блок для выбора друга
  return (
    <div className="friend-screen"> 
      <h2 className="friend-screen-h2">{t.title_friend}</h2>
      <input 
        className="friend-input" 
        value={name} 
        onChange={e=>setName(e.target.value)} 
        placeholder={t.placeholder} />
      <button 
        className={`btn ${name.trim()? "btn-active":"btn-disabled"}`} 
        disabled={!name.trim()} 
        onClick={()=>onFriendName(name.trim())}
      >
        {t.next}
      </button>
    </div>
  );
}