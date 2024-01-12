export default function numberToString(num) {
	const map = [
		{ suffix: "T", threshold: 1e12 },
		{ suffix: "B", threshold: 1e9 },
		{ suffix: "M", threshold: 1e6 },
		{ suffix: "K", threshold: 1e3 },
		{ suffix: "", threshold: 1 },
	];

	const found = map.find((x) => Math.abs(num) >= x.threshold);
	if (found) {
		return Math.round((num / found.threshold) * 1000) / 1000 + found.suffix;
	}

	return num;
}
