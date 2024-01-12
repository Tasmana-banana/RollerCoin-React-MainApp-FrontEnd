const config = require("config");
const { Router } = require("express");
const mainRoutes = require("../data/routes");
const { generateRoutes } = require("../helpers/generateRoutes");
const generateDynamicRoutes = require("../helpers/generateDynamicRoutes");
const GetRollerCurrencies = require("../helpers/GetCurrenciesFromDB");
const GetPagesEventsConfig = require("../helpers/GetPagesEventsConfig");

const languages = config.get("languages");
const hostUrl = config.get("url");
const providerGTMConfig = config.get("providers.gtm");
const router = new Router();

(async () => {
	await GetRollerCurrencies.init();
	const currencies = GetRollerCurrencies.getCurrencies();
	await GetPagesEventsConfig.init();
	const eventsDynamicPages = GetPagesEventsConfig.getPages();
	const dynamicRoutes = generateDynamicRoutes(eventsDynamicPages, mainRoutes);

	languages.forEach((language) => {
		dynamicRoutes.forEach((routeData) => {
			const route = generateRoutes(routeData, language, routeData?.dynamicRouteType, currencies, eventsDynamicPages);
			router.get(route, ...routeData.middleware, (req, res) => {
				let cleanPath = routeData.hasPageQuery ? req.originalUrl : req.path.replace(/\/$/, "");
				if (req.path.startsWith(`/${req.language}/`) || req.path === `/${req.language}`) {
					const path = routeData.hasPageQuery ? req.originalUrl : req.path;
					cleanPath = path.replace(`/${req.language}`, "");
				}
				const preparedHreflang = {};
				// remove hreflang on referrals link
				if (req.path !== "/" || (req.path === "/" && !Object.keys(req.query).length)) {
					preparedHreflang.en = routeData.hreflang.en ? `${hostUrl}${generateRoutes(cleanPath, "en")}` : "";
					preparedHreflang.cn = routeData.hreflang.cn ? `${hostUrl}${generateRoutes(cleanPath, "cn")}` : "";
					preparedHreflang.default = `${hostUrl}${cleanPath}`;
				}
				const preparedCanonical = routeData.canonical ? `${hostUrl}${generateRoutes(routeData.canonical, language)}` : `${hostUrl}${routeData.hasPageQuery ? req.originalUrl : req.path}`;
				const params = {
					title: routeData.titleFunc ? routeData.titleFunc(language, req) : routeData.title[req.language],
					description: routeData.description[req.language],
					keywords: routeData.keywords[req.language],
					contentLanguage: req.language === "en" ? "EN" : "ZH",
					pathname: req.path,
					hreflang: preparedHreflang,
					canonical: preparedCanonical,
					originalUrl: req.originalUrl,
					gtmId: providerGTMConfig.id,
					robots: routeData.robots,
				};
				if (routeData.reactRedirect) {
					params.redirectPage = generateRoutes(routeData.reactRedirect, language);
				}
				if (routeData.redirect) {
					return res.redirect(generateRoutes(routeData.redirect, language));
				}
				res.render(routeData.entryPoint, params);
			});
		});
	});
})();

router.get("/7cy3pzamdr8pk0qytnprlpn6h9kbe6", (req, res) => {
	res.sendFile("./src/additional/7cy3pzamdr8pk0qytnprlpn6h9kbe6.html", { root: __dirname });
});
router.get("/377b843b79cfba5685535da27eb4c85a", (req, res) => {
	res.sendFile("./src/additional/377b843b79cfba5685535da27eb4c85a.txt", { root: __dirname });
});
router.get("/google57e8e6e0b80ede1a", (req, res) => {
	res.sendFile("./src/additional/google013817ef0decb92f.html", { root: __dirname });
});
module.exports = router;
