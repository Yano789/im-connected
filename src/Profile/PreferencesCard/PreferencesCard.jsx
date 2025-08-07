import "./PreferencesCard.css";
import { useTranslation } from "react-i18next";

function PreferencesCard({ preferences = {}, onPreferenceChange }) {
  const {t} = useTranslation();
  const {
    preferredLanguage = "",
    textSize = "",
    contentMode = "",
  } = preferences;

  return (
    <div className="preferences-card">
      <div className="preference-group">
        <h3 className="preference-label">{t("Preferred Language")}</h3>
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
        <h3 className="preference-label">{t("Text Size")}</h3>
        <div className="preference-options">
          <button
            onClick={() => onPreferenceChange("textSize", "Small")}
            className={textSize === "Small" ? "pref-button selected" : "pref-button"}
          >
            {t("Small")}
          </button>
          <button
            onClick={() => onPreferenceChange("textSize", "Medium")}
            className={textSize === "Medium" ? "pref-button selected" : "pref-button"}
          >
            {t("Medium")}
          </button>
          <button
            onClick={() => onPreferenceChange("textSize", "Large")}
            className={textSize === "Large" ? "pref-button selected" : "pref-button"}
          >
            {t("Large")}
          </button>
        </div>
      </div>

      <div className="preference-group">
        <h3 className="preference-label">{t("Content Mode")}</h3>
        <div className="preference-options content-modes">
          <button
            onClick={() => onPreferenceChange("contentMode", "Easy Reader Mode")}
            className={
              contentMode === "Easy Reader Mode"
                ? "pref-button content-button selected"
                : "pref-button content-button"
            }
          >
            {t("Easy Reader Mode")}
          </button>
          <button
            onClick={() => onPreferenceChange("contentMode", "Default Mode")}
            className={
              contentMode === "Default Mode"
                ? "pref-button content-button selected"
                : "pref-button content-button"
            }
          >
            {t("Default Mode")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PreferencesCard;
