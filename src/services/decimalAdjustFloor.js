const decimalAdjustFloor = (value, exp = 8) => {
	if (typeof exp === "undefined" || +exp === 0) {
		return Math.floor(value);
	}

	value = +value;
	exp = +exp;

	if (!value) {
		return 0;
	}
	if (Number.isNaN(value) || !(typeof exp === "number" && exp % 1 === 0)) {
		return NaN;
	}

	// Shift
	value = value.toString().split("e");
	value = Math.floor(+`${value[0]}e${value[1] ? +value[1] + exp : exp}`);

	// Shift back
	value = value.toString().split("e");
	return +`${value[0]}e${value[1] ? +value[1] - exp : -exp}`;
};
export default decimalAdjustFloor;
