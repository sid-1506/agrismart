import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import hi from "./hi.json";
import mr from "./mr.json";
import ta from "./ta.json";
import te from "./te.json";
import kn from "./kn.json";
import bn from "./bn.json";
import gu from "./gu.json";

const LANG_MAP = {
  English:  "en",
  Hindi:    "hi",
  Marathi:  "mr",
  Tamil:    "ta",
  Telugu:   "te",
  Kannada:  "kn",
  Bengali:  "bn",
  Gujarati: "gu",
};

export const getI18nLang = (profileLang) => LANG_MAP[profileLang] || "en";

const savedLang = localStorage.getItem("agri_ui_lang") || "en";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      mr: { translation: mr },
      ta: { translation: ta },
      te: { translation: te },
      kn: { translation: kn },
      bn: { translation: bn },
      gu: { translation: gu },
    },
    lng:          savedLang,
    fallbackLng:  "en",
    interpolation: { escapeValue: false },
  });

export default i18n;
