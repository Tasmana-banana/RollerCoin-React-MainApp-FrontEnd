const googleAnalyticsPush = (event, params, userId) => {
	window.dataLayer = window.dataLayer || [];
	const eventObj = {
		event,
		...params,
	};
	if (userId) {
		eventObj.userId = userId;
	}
	window.dataLayer.push(eventObj);
};

export default googleAnalyticsPush;
