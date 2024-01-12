const generateDynamicPath = (path, dynamicRouteType, currencies, eventsDynamicPages) => {
	let [dynamicEventRoutes] = eventsDynamicPages.map((dynamicPage) => dynamicPage.routes);
	const newPath = [...path];
	if (dynamicRouteType === "networkPower") {
		currencies
			.filter((currency) => currency.isCanBeMined)
			.forEach((currency) => {
				newPath.push(`/network-power/${currency.code}`);
			});
	}
	if (dynamicRouteType === "referral") {
		currencies
			.filter((currency) => currency.isCanBeMined)
			.forEach((currency) => {
				newPath.push(`/referral/stats/${currency.code}`);
			});
	}
	if (dynamicRouteType === "wallet") {
		currencies.forEach((currency) => {
			newPath.push(`/wallet/${currency.code}`);
			newPath.push(`/wallet/${currency.code}/deposit`);
			newPath.push(`/wallet/${currency.code}/withdraw`);
			newPath.push(`/wallet/${currency.code}/history`);
		});
	}

	if (dynamicEventRoutes && dynamicEventRoutes.length) {
		dynamicEventRoutes.forEach((route) => {
			if (route.dynamic_route_type === dynamicRouteType) {
				const sitePath = Object.values(route.site_paths);
				sitePath.forEach((item) => {
					newPath.push(item);
				});
			}
		});
	}
	return newPath;
};

module.exports = generateDynamicPath;
