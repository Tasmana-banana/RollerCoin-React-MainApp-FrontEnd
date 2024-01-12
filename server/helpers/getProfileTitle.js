const PROFILE_PATH_NAMES = {
	"/games": "Games",
	"/power": "Power",
	"/rank": "Rank",
};

module.exports = (lang, req) => {
	if (Object.keys(PROFILE_PATH_NAMES).some((path) => req.path.includes(path))) {
		const pathItems = req.path.split("/");
		const tab = pathItems[pathItems.length - 1];
		return `User profile | ${PROFILE_PATH_NAMES[`/${tab}`]} | Rollercoin`;
	}
	return `${lang === "en" ? "User profile" : "用户配置文件"} | RollerCoin.com`;
};
