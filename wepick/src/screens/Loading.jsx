import React, { useState } from "react";

// localization obj for various texts on the language page.
const texts = {
  ua: {
    main: "Припиніть сперечатися про те, що дивитися!\nДавайте повернемо кіношне подружжя - \nу ваше життя.",
    placeholder: "Введіть ваше ім'я",
    next: "Далі!",
  },
  ru: {
    main: "Перестаньте спорить про то, что смотреть!\nВернём ваше киношное счастье - \nв вашу жизнь.",
    placeholder: "Введите ваше имя",
    next: "Далее!",
  },
  en: {
    main: "Stop arguing over what to watch! \nLet’s put some movie matrimony - \nback in your life.",
    placeholder: "Enter your name",
    next: "Next!",
  },
};

/**
 * Landing components server as the initial screen where users enter their name.
 * It displays a welcome message, an animated logo, and an input field.
 * @param {obj} props - the components props.
 * @param {string} props.lang - the current language code (e.g., "ua", "en")
 * @param {fun} props.onNext - callback function to proceed to the next step with the entered name.
 * @returns
 */
export default function Landing({ lang = "ua", onNext }) {
  // state to store the user`s name entered in the input field.
  const [name, setName] = useState("");

  return (
    <div className="screen landing">
      {/* animated logo, section purely for visual effect */}
      <div className="logo-anim" aria-hidden>
        <div className="film-logo">
          <img
            src="/src/images/logo_wepick_pixel.png" // path to the pixalated logo image.
            alt="Film Reel" // alt text for accessibility
            width={400}
          />
        </div>
      </div>

      {/* main descriptive text for the landing page */}
      <p className="landing-text">
        {/* splits the main screen by newline characters and renders each line, adding <br> /> for line breaks. */}
        {texts[lang].main.split("\n").map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i < texts[lang].main.split("\n").length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>

      {/* input field for the users to enter their name */}
      <input
        value={name} // binds input value to the "name" state.
        onChange={(e) => setName(e.target.value)} // updates "name" state on input changes.
        placeholder={texts[lang].placeholder} // localized placeholder text.
        className="name-input"
      />
      <div className="center-btn">
        {/*btn to proceed to the next step*/}
        <button
          // dynamically applies 'btn-active' class if name is not empty, otherwise 'btn-disabled'.
          className={`btn ${name.trim() ? "btn-active" : "btn-disabled"}`}
          disabled={!name.trim()} // btn is disabled if the name input is empty or only whitespace.
          onClick={() => onNext(name.trim())}
        >
          {texts[lang].next} {/* localized text for the "next" button */}
        </button>
      </div>
    </div>
  );
}
