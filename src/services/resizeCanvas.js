export default function resizeCanvas(containerID, gameWidth, gameHeight) {
	const parent = document.getElementById(containerID);
	if (!parent) {
		return null;
	}
	const canvas = parent.querySelector("canvas");
	if (!canvas) {
		return null;
	}

	const windowWidth = window.innerWidth;
	const windowHeight = window.innerHeight;

	const gameRatio = gameWidth / gameHeight;
	const isVerticalOrientation = windowHeight > windowWidth;
	const isFullscreen = document.fullscreenElement;
	if (isFullscreen) {
		let options = {
			width: windowWidth,
			height: windowHeight,
		};

		if (isVerticalOrientation) {
			options = {
				width: windowWidth,
				height: Math.floor(windowWidth / gameRatio),
			};
			if (options.height > windowHeight) {
				options = {
					width: options.width - Math.floor((options.height - windowHeight) * gameRatio),
					height: windowHeight,
				};
			}
		}
		if (!isVerticalOrientation) {
			options = {
				width: Math.floor(windowHeight * gameRatio),
				height: windowHeight,
			};
			if (options.width > windowWidth) {
				options = {
					width: windowWidth,
					height: Math.floor(options.height - (options.width - windowWidth) / gameRatio),
				};
			}
		}
		canvas.style.width = `${options.width}px`;
		canvas.style.height = `${options.height}px`;
		return true;
	}
	canvas.style.width = `${parent.offsetWidth}px`;
	canvas.style.height = `${parent.offsetWidth / gameRatio}px`;
}
