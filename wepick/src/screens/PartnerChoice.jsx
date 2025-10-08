import React from "react";

export default function PartnerChoice({ onChoose }) {
  return (
    <div className="screen">
      <h2>Виберіть свого партнера</h2>
      <div className="type-buttons">
        <button className="btn" onClick={()=>onChoose("friend")}>Друг</button>
        <button className="btn" onClick={()=>onChoose("character")}>Популярний персонаж</button>
      </div>
    </div>
  );
}
/*TODO: when user choose partner - make button`s active (change style)
TODO: when user choose popular character - show select with characters (from local db)
*/