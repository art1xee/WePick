import React, { useState } from "react";

export default function Header({ lang, setLang, resetAll }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="header">
      <div className="logo">WePick!</div>
      <div className="header-right">
        <select value={lang} onChange={(e)=>setLang(e.target.value)} aria-label="language">
          <option value="ua">Українська</option>
          <option value="ru">Русский</option>
          <option value="en">English</option>
        </select>

        <button className="hamburger" onClick={()=>setOpen(o=>!o)} aria-label="menu">≡</button>
        {open && (
          <div className="menu">
            <p><strong>WePick!</strong> — допомагає обрати спільний контент.</p>
          <div className="menu-button"> 
             <button onClick={resetAll}>Почати спочатку</button>
          </div>
            <p style={{fontSize:12,opacity:0.8}}>Версія MVP — локальна база даних.</p>
          </div>
        )}
      </div>
    </header>
  );
}

/*
TODO: change style in reset button
TODO: add some new text in menu + info about app
TODO: when user open menu and he wanna close it he can click outside menu to close it
TODO: add animation for menu open/close
*/