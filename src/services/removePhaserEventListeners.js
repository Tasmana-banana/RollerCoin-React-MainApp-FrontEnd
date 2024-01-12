const removePhaserEventListeners = (gameInstance) => {
	try {
		if (!gameInstance) {
			return false;
		}

		const { listeners } = gameInstance.scale;

		window.removeEventListener("orientationchange", listeners.orientationChange, false);
		window.removeEventListener("resize", listeners.windowResize, false);

		const vendors = ["webkit", "moz", ""];

		vendors.forEach((prefix) => {
			document.removeEventListener(`${prefix}fullscreenchange`, listeners.fullScreenChange, false);
			document.removeEventListener(`${prefix}fullscreenerror`, listeners.fullScreenError, false);
		});

		//  MS Specific
		document.removeEventListener("MSFullscreenChange", listeners.fullScreenChange, false);
		document.removeEventListener("MSFullscreenError", listeners.fullScreenError, false);
	} catch (e) {
		console.error(e);
	}
};

export default removePhaserEventListeners;
