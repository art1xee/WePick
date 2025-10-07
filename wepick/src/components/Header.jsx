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
            <button onClick={resetAll}>Почати спочатку</button>
            <p style={{fontSize:12,opacity:0.8}}>Версія MVP — локальна база даних.</p>
          </div>
        )}
      </div>
    </header>
  );
}
