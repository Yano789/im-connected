import "./PreferencesCard.css";

function PreferencesCard({ preferences = {}, onPreferenceChange }) {
  const {
    preferredLanguage = "",
    textSize = "",
    contentMode = "",
  } = preferences;

  return (
    <div className="preferences-card">
      <div className="preference-group">
        <h3 className="preference-label">Preferred Language</h3>
        <div className="preference-options">
          <button
            onClick={() => onPreferenceChange("preferredLanguage", "en")}
            className={
              preferredLanguage === "en" ? "pref-button selected" : "pref-button"
            }
          >
            English
          </button>
          <button
            onClick={() => onPreferenceChange("preferredLanguage", "zh")}
            className={
              preferredLanguage === "zh" ? "pref-button selected" : "pref-button"
            }
          >
            中文
          </button>
          <button
            onClick={() => onPreferenceChange("preferredLanguage", "ms")}
            className={
              preferredLanguage === "ms" ? "pref-button selected" : "pref-button"
            }
          >
            Bahasa Melayu
          </button>
          <button
            onClick={() => onPreferenceChange("preferredLanguage", "ta")}
            className={
              preferredLanguage === "ta" ? "pref-button selected" : "pref-button"
            }
          >
            தமிழ்
          </button>
        </div>
      </div>

      <div className="preference-group">
        <h3 className="preference-label">Text Size</h3>
        <div className="preference-options">
          <button
            onClick={() => onPreferenceChange("textSize", "Small")}
            className={textSize === "Small" ? "pref-button selected" : "pref-button"}
          >
            Small
          </button>
          <button
            onClick={() => onPreferenceChange("textSize", "Medium")}
            className={textSize === "Medium" ? "pref-button selected" : "pref-button"}
          >
            Medium
          </button>
          <button
            onClick={() => onPreferenceChange("textSize", "Big")}
            className={textSize === "Big" ? "pref-button selected" : "pref-button"}
          >
            Big
          </button>
        </div>
      </div>

      <div className="preference-group">
        <h3 className="preference-label">Content Mode</h3>
        <div className="preference-options content-modes">
          <button
            onClick={() => onPreferenceChange("contentMode", "Easy Reader Mode")}
            className={
              contentMode === "Easy Reader Mode"
                ? "pref-button content-button selected"
                : "pref-button content-button"
            }
          >
            Easy Reader Mode
          </button>
          <button
            onClick={() => onPreferenceChange("contentMode", "Default Mode")}
            className={
              contentMode === "Default Mode"
                ? "pref-button content-button selected"
                : "pref-button content-button"
            }
          >
            Default Mode
          </button>
        </div>
      </div>
    </div>
  );
}

export default PreferencesCard;
