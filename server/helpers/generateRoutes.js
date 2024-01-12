const getLanguagePrefix = require("./getLanguagePrefix");
const generateDynamicPath = require("./generateDynamicPath");

const generateRoutes = (routeData, language, dynamicRouteType, currencies, eventsDynamicPages) => {
	let newPath = routeData?.route || routeData;

	if (dynamicRouteType) {
		newPath = generateDynamicPath(routeData.route, dynamicRouteType, currencies, eventsDynamicPages);
	}
	if (routeData?.route && typeof routeData.route === "object") {
		return newPath.map((pathname) => `${getLanguagePrefix(language)}${pathname}`.replace(/\/?$/, ""));
	}
	return `${getLanguagePrefix(language)}${newPath}`.replace(/\/?$/, "");
};
module.exports.generateRoutes = generateRoutes;
