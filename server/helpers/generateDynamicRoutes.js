const generateDynamicRoutes = (eventsDynamicPages, mainRoutes) => {
	let newRoutes = [];
	if (eventsDynamicPages.length) {
		const mainRouteDynamicRouteTypes = mainRoutes.filter((mainRoute) => mainRoute.dynamicRouteType).map((mainRoute) => mainRoute.dynamicRouteType);
		let findNewRoutes = eventsDynamicPages.map((newRoute) => newRoute.routes.find((route) => !mainRouteDynamicRouteTypes.includes(route.dynamic_route_type)));
		if (findNewRoutes.length) {
			newRoutes = findNewRoutes.map((newRoute) => ({
				title: newRoute.title,
				description: newRoute.description,
				route: Object.values(newRoute.site_paths),
				entryPoint: "index",
				hasPageQuery: false,
				middleware: [],
				redirect: "",
				reactRedirect: "",
				keywords: {
					en: "",
					cn: "",
				},
				hreflang: {
					en: true,
					cn: false,
				},
				robots: {
					index: false,
					follow: true,
				},
			}));
		}
	}
	return [...mainRoutes, ...newRoutes];
};

module.exports = generateDynamicRoutes;
