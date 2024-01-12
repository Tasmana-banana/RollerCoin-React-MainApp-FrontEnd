const generatePagingArray = (now, pages, delta = 2) => {
	const left = now - delta;
	const right = now + delta + 1;
	const result = Array.from({ length: pages }, (v, k) => k + 1).filter((i) => i && i >= left && i < right);

	if (result.length > 1) {
		// Add first page and dots
		if (result[0] > 1) {
			if (result[0] > 2) {
				result.unshift("...");
			}
			result.unshift(1);
		}
		// Add dots and last page
		if (result[result.length - 1] < pages) {
			if (result[result.length - 1] !== pages - 1) {
				result.push("...");
			}
			result.push(pages);
		}
	}
	return result;
};
export default generatePagingArray;
