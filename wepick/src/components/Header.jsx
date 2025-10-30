import React, { useState, useRef, useEffect } from "react";

// objects containing localized texts for different languages.
const texts = {
  ua: {
    title: "Про WePick!",
    main: "WePick! — це зручний інструмент для вибору фільмів, \nсеріалів або іншого контенту, який сподобається всім учасникам.\nВи встановлюєте спільні фільтри, а ми пропонуємо ідеальний варіант.",
    button: "Почати спочатку ",
    version: "Код цього додатку доступний на GitHub: ",
  },
  ru: {
    title: "О WePick!",
    main: "WePick! — это удобный инструмент для выбора фильмов, \nсериалов или другого контента, который понравится всем участникам.\nВы устанавливаете общие фильтры, а мы предлагаем идеальный вариант.",
    button: "Начать сначала ",
    version: "Код этого приложения доступен на GitHub: ",
  },
  en: {
    title: "About WePick!",
    main: "WePick! is a convenient tool for choosing movies, \nseries, or other content that everyone will enjoy.\nYou set common filters, and we suggest the perfect option.",
    button: "Start over ",
    version: "The code for this application is available on GitHub: ",
  },
};

/**
 * Header component that includes the logo? language selection, and an info menu.
 * @param {object} props - The component props
 * @param {string} props.lang - The current language code (e.g., 'ua', 'en')
 * @param {function} props.setLang - Function to update the language.
 * @param {function} props.resetAll - Funtion to reset the app state.
 */
export default function Header({ lang = "ua", setLang, resetAll }) {
  // state to manage the visibility of the side menu.
  const [open, setOpen] = useState(false);
  // ref to the menu container to detect clicks outside of it.
  const menuRef = useRef(null);

  // effect to handle closing the menu when clicking outside of it.
  useEffect(() => {
    function handleClickOutside(event) {
      // close the menu if it`s open and the click is not inside the meny or on the hamburger/language selectors.
      if (
        open &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !event.target.closest(".hamburger") &&
        !event.target.closest(".lang-select")
      ) {
        setOpen(false);
      }
    }
    // add event listener when the component mounts.
    document.addEventListener("mousedown", handleClickOutside);
    // clean up the event listener when the component unmounts.
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]); // rerun the effect only if the 'open' state changes.

  // select the appropriate text based on the current language, defaulting to UA.
  const currentTexts = texts[lang] || texts.ua;

  return (
    <header className="header">
      <div className="logo">WePick!</div>
      <div className="header-right">
        {/* language selection drop */}
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          aria-label="language"
          className="lang-select"
        >
          <option value="ua">Українська</option>
          <option value="ru">Русский</option>
          <option value="en">English</option>
        </select>

        {/* hamburger btn to toggle the menu */}
        <button
          className="hamburger"
          onClick={() => setOpen((o) => !o)}
          aria-label="menu"
        >
          {open ? "×" : "≡"}
        </button>

        {/* the side menu, which appears when 'open' is true */}
        <div
          ref={menuRef}
          className={`menu ${open ? "menu-open" : "menu-closed"}`}
        >
          <div className="menu-content">
            <h3 className="menu-title">{currentTexts.title}</h3>
            <p>
              {/* render multiline text correctly*/}
              {currentTexts.main.split("\n").map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < currentTexts.main.split("\n").length - 1 && <br />}
                </React.Fragment>
              ))}
            </p>

            <div className="menu-button-container">
              {/* btn to reset the app state */}
              <button onClick={resetAll} className="btn btn-reset">
                {currentTexts.button}
              </button>
            </div>
            {/* link to the GitHub repository */}
            <p className="menu-version">{currentTexts.version}</p>
            <a href="https://github.com/art1xee/WePick" className="menu-github">
              {" "}
              WePick!
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
