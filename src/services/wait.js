export default async (timeMs) =>
	new Promise((resolve) => {
		setTimeout(resolve, timeMs);
	});
