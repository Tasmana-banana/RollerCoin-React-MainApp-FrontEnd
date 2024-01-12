import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import Fetch from "i18next-fetch-backend";
import getLangFromUrl from "./getLangFromUrl";

i18next
	.use(Fetch)
	.use(initReactI18next)
	.init({
		ns: [],
		lng: getLangFromUrl(window.location.pathname),
		fallbackLng: "en",
		supportedLngs: ["cn", "en", "es", "pt"],
		backend: {
			// TODO dont forget to change versions
			loadPath: "/static/locales/{{ns}}/{{lng}}.json?v=2.5.28",
			allowMultiLoading: true,
		},
		lowerCaseLng: true,
		interpolation: {
			escapeValue: false,
		},
		react: {
			wait: true,
			bindI18n: "languageChanged loaded",
		},
	});
export const changeLanguage = (lang) => i18next.changeLanguage(lang);

export default i18next;
