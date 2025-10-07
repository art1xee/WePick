import React from "react";

export default function Summary({ participants, contentType, onFind }) {
  return (
    <div className="screen">
      <h2>Підсумок вибору</h2>
      <p>Тип контенту: <strong>{contentType}</strong></p>
      {participants.map((p, i) => (
        <div key={i} className="summary-block">
          <h4>{i===0 ? "Ви" : p.isCharacter ? p.name + " (персонаж)" : p.name}</h4>
          <p><strong>Не хочемо:</strong> {p.dislikes && p.dislikes.join(", ")}</p>
          <p><strong>Хочемо:</strong> {p.likes && p.likes.join(", ")}</p>
          <p><strong>Декада:</strong> {p.decade}s</p>
        </div>
      ))}
      <div style={{marginTop:20}}>
        <button className="btn btn-active" onClick={onFind}>Найти фільм</button>
      </div>
    </div>
  );
}
