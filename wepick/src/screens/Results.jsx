import React, { useState } from "react";

const labels = {
    ua: {
        title: "Зустріньте свою кінопару!",
        info_button: "Більше деталей..",
        more_button: "Бачили - показати інше",
        restart_button: "Почати спочатку",
        loading: "Завантаження...",
        name: "Назва: ",
        year: "Рік: ",
        rating: "Рейтинг: ",
        overview: "Опис:",
        no_results: "Немає результатів 😢",
        no_results_desc: "Спробуйте змінити свої вподобання",
        // НОВОЕ СООБЩЕНИЕ
        weakened_filters_warning: "⚠️ Ми розширили пошук. Фільтри жанрів для {characterName} були проігноровані, щоб знайти хоч якийсь контент.",
    },
    ru: {
        title: "Встретьте свою кино-пару!",
        info_button: "Больше деталей..",
        more_button: "Видели - показать другое",
        restart_button: "Начать сначала",
        loading: "Загрузка...",
        name: "Название: ",
        year: "Год: ",
        rating: "Рейтинг: ",
        overview: "Описание:",
        no_results: "Нет результатов 😢",
        no_results_desc: "Попробуйте изменить свои предпочтения",
        // НОВОЕ СООБЩЕНИЕ
        weakened_filters_warning: "⚠️ Мы расширили поиск. Фильтры жанров для {characterName} были проигнорированы, чтобы найти хоть какой-то контент.",
    },
    en: {
        title: "Meet your movie match!",
        info_button: "More details..",
        more_button: "Seen it - show another",
        restart_button: "Start over",
        loading: "Loading...",
        name: "Name: ",
        year: "Year: ",
        rating: "Rating: ",
        overview: "Overview:",
        no_results: "No results found 😢",
        no_results_desc: "Try changing your preferences",
        // НОВОЕ СООБЩЕНИЕ
        weakened_filters_warning: "⚠️ We broadened the search. Genre filters for {characterName} were ignored to find any content.",
    }
};

export default function Results({
    movies = [],
    onRestart,
    lang = "ua",
    loading = false,
    didWeakenFilters = false, // НОВОЕ
    characterName = null,     // НОВОЕ
}) {
    const [idx, setIdx] = useState(0);
    const text = labels[lang];

    // Показываем загрузку
    if (loading) {
        return (
            <div className="result-screen">
                <div className="loading-animation">
                    <div className="film-logo" style={{ fontSize: "100px" }}>🎬</div>
                    <h2>{text.loading}</h2>
                </div>
            </div>
        );
    }

    // Если нет результатов
    if (!movies || movies.length === 0) {
        return (
            <div className="result-screen">
                <h2 className="result-title">{text.no_results}</h2>
                <p style={{ fontSize: "14px", marginTop: "20px" }}>
                    {text.no_results_desc}
                </p>
                <div style={{ marginTop: "30px" }}>
                    <button onClick={onRestart} className="btn btn-active">
                        {text.restart_button}
                    </button>
                </div>
            </div>        );
    }

    const current = movies[idx];
    const next = () => setIdx((i) => (i + 1) % movies.length);

    // Форматирование предупреждения
    const warningMessage = didWeakenFilters
        ? text.weakened_filters_warning.replace("{characterName}", characterName || "персонажа")
        : null;

    // Функция для получения IMDB ссылки (если есть)
    const getIMDBLink = (movie) => {
        // TMDb не всегда возвращает imdb_id, поэтому можем искать по названию
        const searchQuery = encodeURIComponent(`${movie.title} ${movie.year}`);
        return `https://www.imdb.com/find?q=${searchQuery}`;
    };

    return (
        <div className="result-screen">
            <h2 className="result-title">{text.title}</h2>
            
            {/* НОВОЕ: Отображение предупреждения об ослаблении фильтров */}
            {warningMessage && (
                <div style={{
                    color: '#ffc107',
                    backgroundColor: 'rgba(255,193,7,0.1)',
                    padding: '10px 15px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    maxWidth: '450px',
                    margin: '0 auto 20px'
                }}>
                    {warningMessage}
                </div>
            )}
            
            <div className="result-content">
                <h3 className="result-name">
                    {current.title}
                    {current.year && ` (${current.year})`}
                </h3>

                {current.poster && (
                    <img
                        src={current.poster}
                        alt={current.title}
                        className="result-poster"
                        style={{
                            borderRadius: "12px",
                            maxWidth: "400px",
                            width: "100%",
                            marginBottom: "20px",
                            boxShadow: "0 8px 20px rgba(0,0,0,0.3)"
                        }}
                    />
                )}

                {!current.poster && (
                    <div className="poster-placeholder" style={{
                        width: "400px",
                        height: "600px",
                        marginBottom: "20px"
                    }}>
                        🎬
                    </div>
                )}

                <div className="result-info" style={{
                    textAlign: "left",
                    maxWidth: "400px",
                    margin: "0 auto"
                }}>
                    {current.rating && (
                        <p style={{ fontSize: "14px", marginBottom: "10px" }}>
                            <strong>{text.rating}</strong> ⭐ {current.rating.toFixed(1)}/10
                        </p>
                    )}

                    {current.overview && (
                        <div style={{
                            fontSize: "12px",
                            lineHeight: "1.6",
                            marginTop: "15px",
                            padding: "15px",
                            background: "rgba(255,255,255,0.1)",
                            borderRadius: "8px"
                        }}>
                            <strong>{text.overview}</strong>
                            <p style={{ marginTop: "8px" }}>{current.overview}</p>
                        </div>
                    )}
                </div>

                <div className="result-actions" style={{ marginTop: "30px" }}>
                    <a
                        href={getIMDBLink(current)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-active"
                        style={{ marginRight: "10px" }}
                    >
                        {text.info_button}
                    </a>

                    <button
                        onClick={next}
                        className="btn btn-active"
                        style={{ marginRight: "10px" }}
                    >
                        {text.more_button}
                    </button>

                    <button
                        onClick={onRestart}
                        className="btn btn-reset"
                    >
                        {text.restart_button}
                    </button>
                </div>

                <div style={{
                    marginTop: "20px",
                    fontSize: "12px",
                    opacity: "0.7"
                }}>
                    {idx + 1} / {movies.length}
                </div>
            </div>
        </div>
    );
}