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
/*
TODO: chanse style for buttons maybe add some pictures
TODO: add button "Next"
TODO: Change style for this screen
*/