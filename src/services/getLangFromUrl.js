const getLangFromUrl = (url) => {
	const languages = ["en", "cn", "es", "pt"];
	const baseLang = "en";
	const langFromUrl = languages.find((lang) => url.startsWith(`/${lang}`));
	if (langFromUrl) {
		return langFromUrl;
	}
	return baseLang;
};
export default getLangFromUrl;
