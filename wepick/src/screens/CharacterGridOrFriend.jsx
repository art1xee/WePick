import React, { useState } from "react";
import jokerImg from "../assets/character_img/joker.jpg";
import luffyImg from "../assets/character_img/monkey_d_luffy.jpg";
import chopperImg from "../assets/character_img/chopper.jpg";
import scherlockImg from "../assets/character_img/sherlock.jpg";
import leviImg from "../assets/character_img/levi_ackerman.jpg";
import walterWhiteImg from "../assets/character_img/walter_white.jpg";
import johnWickImg from "../assets/character_img/john_wick.jpg";
import saulImg from "../assets/character_img/saul_good_man.jpg";
import arthurMorganImg from "../assets/character_img/arthur_morgan.jpg";

// list of character`s object, each with an ID, name, and image source.
const characters = [
  { id: "Joker", name: "Joker", image: jokerImg },
  { id: "luffy", name: "Monkey D.Luffy", image: luffyImg },
  { id: "chopper", name: "Chopper", image: chopperImg },
  { id: "sherlock", name: "Sherlock", image: scherlockImg },
  { id: "levi-ackerman", name: "Levi Ackerman", image: leviImg },
  { id: "walter-white", name: "Walter White", image: walterWhiteImg },
  { id: "john-wick", name: "John Wick", image: johnWickImg },
  { id: "better-call-saul", name: "Saul Good Man", image: saulImg },
  { id: "arthur-morgan", name: "Arthur M.", image: arthurMorganImg },
];

const labels = {
  ua: {
    title_char: "З ким ти хочеш зіграти в WePick?",
    title_friend: "Передай пристрій другу — нехай введе своє ім'я",
    placeholder: "Ім'я друга",
    next: "Далі!",
  },
  ru: {
    title_char: "С кем ты хочешь сыграть в WePick?",
    title_friend: "Передай устройство другу — пусть введёт своё имя",
    placeholder: "Имя друга",
    next: "Далее!",
  },
  en: {
    title_char: "Who do you want to play WePick with?",
    title_friend: "Pass the device to a friend — let them enter their name",
    placeholder: "Friend's name",
    next: "Next!",
  },
};

/**
 * CharacterGridOrFriend component allows users to choose between playing with a popular character
 * or entering a friend`s name
 * @param {obj} props - the component props.
 * @param {string} props.lang - the current language code (e.g., "ua", "en")/
 * @param {string} props.parnterType - determines the display mode: "popular-character" or "friend".
 * @param {fun} props.onCharacter - callback function when a character is selected.
 * @param {fun} props.onFriendName - callback function when a friend is selected.
 *
 * @returns
 */

export default function CharacterGridOrFriend({
  lang = "ua",
  partnerType,
  onCharacter,
  onFriendName,
}) {
  // state to store the friend`s name input
  const [name, setName] = useState("");
  // state to store the currently selected character.
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  // ensure the selected languages exits, otherwise default to UA
  const t = labels[lang] || labels.ua;

  // conditional rendering based on partnerType
  if (partnerType === "popular-character") {
    // handler for selecting a character from the grid.
    const handleCharacterSelect = (char) => {
      setSelectedCharacter(char);
    };

    // handler for proceedding after character selection.
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
              className={`char-card ${
                selectedCharacter && selectedCharacter.id === c.id
                  ? "char-card-selected"
                  : ""
              }`}
              onClick={() => handleCharacterSelect(c)}
            >
                           
              <img src={c.image} alt={c.name} className="char-image" />         
                  <div>{c.name}</div>           
            </div>
          ))}
                 
        </div>
               
        <div className="center-btn-grid" style={{ marginTop: 40 }}>
                   
          <button
            className={`btn ${
              selectedCharacter ? "btn-active" : "btn-disabled"
            }`}
            disabled={!selectedCharacter}
            onClick={handleNext}
          >
                        {t.next}         
          </button>
        </div>
      </div>
    );
  }

  // render section for entering a friend`s name.
  return (
    <div className="friend-screen">
            <h2 className="friend-screen-h2">{t.title_friend}</h2>     
      <input
        className="friend-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t.placeholder}
      />
      <button
        className={`btn ${name.trim() ? "btn-active" : "btn-disabled"}`}
        disabled={!name.trim()}
        onClick={() => onFriendName(name.trim())}
      >
          {t.next}   
      </button>
    </div>
  );
}
