import { setPagesEventsConfig } from "../actions/pagesEventConfig";
import store from "../store";

const configRoute = (dynamicRoutes) => {
	return dynamicRoutes.map((route) => {
		return {
			path: route.site_paths,
			dynamicRouteType: route.dynamic_route_type,
			title: route.title,
			description: route.description,
		};
	});
};
const configMapper = (dynamicRoutesEvent) => {
	if (dynamicRoutesEvent) {
		const newDynamicRoute = configRoute(dynamicRoutesEvent.routes);
		return { ...dynamicRoutesEvent, routes: newDynamicRoute, links: dynamicRoutesEvent?.links || [] };
	}
	return [];
};

const fetchPagesEventsConfig = async () => {
	try {
		const response = await fetch("/api/events/config");
		const responseJSON = await response.json();
		if (!responseJSON.success) {
			console.error(responseJSON.error);
			return [];
		}
		return responseJSON.data.map(configMapper);
	} catch (e) {
		console.error(e);
		return [];
	}
};

const dispatchDynamicRoutes = (pagesEventsConfig) => store.dispatch(setPagesEventsConfig(pagesEventsConfig));

const initPagesEventsConfig = async () => {
	const pagesEventConfig = await fetchPagesEventsConfig();
	dispatchDynamicRoutes(pagesEventConfig);
};

export default initPagesEventsConfig;
