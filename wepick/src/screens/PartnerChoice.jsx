import React from "react";
import Loading from "./Loading";

//localization obj for various texts on the page based on language.
const labels = {
  ua: {
    title: "Зараз обери свого партнера\nдля просмотру: {content}",
    next: "Далі!",
    error: "(Невідомий контент)",
  },
  ru: {
    title: "Сейчас выбери своего партнёра\n для просмотра: {content}",
    next: "Далее!",
    error: "(Неизвестный контент)",
  },
  en: {
    title: "Now choose your fellow for\n watching: {content}",
    next: "Next!",
    error: "(Unknown content)",
  },
};

/**
 *
 * @param {obj} props - The properties passed to the component.
 *  @param {string} [props.lang = "ua"] - The current language for displaying labels.
 * @param {fun} props.onNext - Callback fun for when the "Next" button is clicked.
 * @param {string} props.value - The currently selected partner type`s key.
 * @param {obj} props.contentType - The type of content to be watched, used in the title.
 * @param {fun} props.onSelect - Callback function for when a partnter option is selected.
 * @returns {JSX.Element} The rendered PartnterChoice component.
 */

export default function PartnerChoice({
  lang = "ua",
  onNext,
  value,
  contentType,
  onSelect,
}) {
  // defines the avaliable partner option with keys and multilingual labels.
  const optionsPartner = [
    { key: "friend", label: { ua: "Друг", ru: "Друг", en: "Friend" } },
    {
      key: "popular-character",
      label: {
        ua: "Популярний\n персонаж",
        ru: "Популярный\n персонаж",
        en: "Popular\n character",
      },
    },
  ];

  /**
   * Generated the title string by injecting the localized content type into a template.
    @returns {string} - The formated and localized title. 
   */
  const getTitle = () => {
    const template = labels[lang].title;

    // use a content type`s localized name, or a default error if not avaliable.
    const contentString =
      contentType && contentType[lang] ? contentType[lang] : labels[lang].error;
    return template.replace("{content}", contentString);
  };

  return (
    <div className="partner-screen">
      {/* section for the main title*/}
      <div className="partner-screen-h2">
        <h2>{getTitle()}</h2>
      </div>

      {/*container for the partner selection buttons*/}
      <div className="type-buttons-partner">
        {/* maps over the parnter option to create a button for each one*/}
        {optionsPartner.map((o) => (
          <button
            key={o.key} // unique key for React list rendering.
            onClick={() => onSelect(o)} // sets the selected parnter type when clicked
            // apllies active styles if the option is the currently selected one
            className={
              value === o.key
                ? `btn partner-choise btn-active-type btn-active-${o.key}`
                : "btn partner-choise"
            }
          >
            {/* displays the button label in the current language*/}
            {o.label[lang]}
          </button>
        ))}
      </div>
      {/* container for the 'Next' button*/}
      <div className="next-btn-partner" style={{ marginTop: 20 }}>
        <button
          // dynamically applies 'btn-active' or 'btn-disabled' based on whether a choice has been made.
          className={`btn ${value ? "btn-active" : "btn-disabled"}`}
          disabled={!value} //button is disabled if no value is selected.
          onClick={onNext} // proceed`s to the next screen when clicked.
        >
          {labels[lang].next} {/* localized text for the "Next" button */}
        </button>
      </div>
    </div>
  );
}
