import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./TranslationJson/en.json";
import zh from "./TranslationJson/zh.json";
import ms from "./TranslationJson/ms.json";
import ta from "./TranslationJson/ta.json";

const resources = {
  en: { translation: en },
  zh: { translation: zh },
  ms: { translation: ms },
  ta: { translation: ta },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "zh", 
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;