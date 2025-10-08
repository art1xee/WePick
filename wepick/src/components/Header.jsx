import React, { useState, useRef, useEffect } from "react";

// Объект с переводами для контента меню
const texts = {
  ua: {
    title: "Про WePick!",
    main: "WePick! — це зручний інструмент для вибору фільмів, \nсеріалів або іншого контенту, який сподобається всім учасникам.\nВи встановлюєте спільні фільтри, а ми пропонуємо ідеальний варіант.",
    button: "Почати спочатку",
    version: "Версія MVP — локальна база даних."
  },
  ru: {
    title: "О WePick!",
    main: "WePick! — это удобный инструмент для выбора фильмов, \nсериалов или другого контента, который понравится всем участникам.\nВы устанавливаете общие фильтры, а мы предлагаем идеальный вариант.",
    button: "Начать сначала",
    version: "Версия MVP — локальная база данных."
  },
  en: {
    title: "About WePick!",
    main: "WePick! is a convenient tool for choosing movies, \nseries, or other content that everyone will enjoy.\nYou set common filters, and we suggest the perfect option.",
    button: "Start over",
    version: "MVP version — local database."
  }
}


export default function Header({ lang = "ua", setLang, resetAll }) {
  const [open, setOpen] = useState(false);
  // 1. Создаем реф для всего контейнера меню
  const menuRef = useRef(null);

  // 2. Логика закрытия меню по клику вне него
  useEffect(() => {
    // Функция для обработки кликов
    function handleClickOutside(event) {
      // Если меню открыто И клик произошел вне контейнера меню
      // Также проверяем, что клик не был по кнопке гамбургера или селектору языка
      if (
        open &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !event.target.closest('.hamburger') &&
        !event.target.closest('.lang-select')
      ) {
        setOpen(false);
      }
    }
    
    // Добавляем слушатель события на весь документ
    document.addEventListener("mousedown", handleClickOutside);
    
    // Очистка слушателя события при размонтировании компонента
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]); // Зависимость от состояния 'open'

  // Получаем текущие тексты, используя безопасный доступ (lang || 'ua')
  const currentTexts = texts[lang] || texts.ua;

  return (
    <header className="header">
      <div className="logo">WePick!</div>
      <div className="header-right">
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

        <button 
          className="hamburger" 
          onClick={() => setOpen(o => !o)} 
          aria-label="menu"
        >
          {open ? '×' : '≡'} 
        </button>
        
        {/* Меню с применением рефа и динамическим классом для анимации */}
        <div 
          ref={menuRef} 
          className={`menu ${open ? 'menu-open' : 'menu-closed'}`}
        >
          <div className="menu-content">
            {/* Динамический заголовок */}
            <h3 className="menu-title">{currentTexts.title}</h3>
            
            {/* Динамическое описание с поддержкой переноса строк */}
            <p>
              {currentTexts.main.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < currentTexts.main.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </p>
            
            <div className="menu-button-container"> 
              <button 
                onClick={resetAll}
                className="btn btn-reset"
              >
                {/* Динамический текст кнопки */}
                {currentTexts.button}
              </button>
            </div>
            
            {/* Динамическая информация о версии */}
            <p className="menu-version">{currentTexts.version}</p>
          </div>
        </div>
      </div>
    </header>
  );
}