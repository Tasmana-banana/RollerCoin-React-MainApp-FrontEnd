const generateRandomLayersConfig = (components) =>
	Object.keys(components).reduce((acc, key) => {
		acc[key] = components[key][Math.floor(Math.random() * components[key].length)];
		return acc;
	}, {});

export default generateRandomLayersConfig;
