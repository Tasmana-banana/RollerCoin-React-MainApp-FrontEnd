const addSpaceToNumber = (num, precision = 2) => {
	if (num > 9999) {
		const result = num.toFixed(precision);
		return result.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
	}
	return num;
};

export default addSpaceToNumber;
