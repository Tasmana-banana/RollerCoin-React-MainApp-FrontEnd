module.exports = (req, res, next) => {
	const languages = ["en", "cn", "es", "pt"];
	const baseLang = "en";
	const langFromUrl = languages.find((lang) => req.url.startsWith(`/${lang}`));
	if (langFromUrl) {
		req.language = langFromUrl;
		return next();
	}
	req.language = baseLang;
	return next();
};
