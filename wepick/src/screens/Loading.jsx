import React, { useState } from "react";

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

export default function Landing({ lang = "ua", onNext }) {
  const [name, setName] = useState("");

  return (
    <div className="screen landing">
      <div className="logo-anim" aria-hidden>
        <div className="film-logo">
          <img
            src="/src/images/logo_wepick_pixel.png"
            alt="Film Reel"
            width={400}
          />
        </div>
      </div>

      <p className="landing-text">
        {texts[lang].main.split("\n").map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i < texts[lang].main.split("\n").length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={texts[lang].placeholder}
        className="name-input"
      />
      <div className="center-btn">
        <button
          className={`btn ${name.trim() ? "btn-active" : "btn-disabled"}`}
          disabled={!name.trim()}
          onClick={() => onNext(name.trim())}
        >
          {texts[lang].next}
        </button>
      </div>
    </div>
  );
}
