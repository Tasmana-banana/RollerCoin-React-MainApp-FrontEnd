/**
 * @enum
 */
export const ROUND_DIRECTION = {
	ROUND: "round",
	FLOOR: "floor",
	CEIL: "ceil",
};

const directionToMethodMap = {
	[ROUND_DIRECTION.ROUND]: Math.round,
	[ROUND_DIRECTION.FLOOR]: Math.floor,
	[ROUND_DIRECTION.CEIL]: Math.ceil,
};

/**
 * Decimal adjustment of a number.
 * @param {number} value - An value to adjust.
 * @param {number} exp - The exponent (the 10 logarithm of the adjustment base).
 * @param {ROUND_DIRECTION} direction - The direction of rounding.
 * @returns {number} - The adjusted value.
 */
function decimalAdjust(value, exp = 8, direction = ROUND_DIRECTION.ROUND) {
	if (typeof exp === "undefined" || +exp === 0) {
		return Math.round(value);
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
	value = directionToMethodMap[direction](+`${value[0]}e${value[1] ? +value[1] + exp : exp}`);

	// Shift back
	value = value.toString().split("e");
	return +`${value[0]}e${value[1] ? +value[1] - exp : -exp}`;
}
export default decimalAdjust;
