const secToHours = (seconds) => {
	const minutesDivider = 60;
	const hourDivider = 60;
	return Math.floor(seconds / minutesDivider / hourDivider);
};
export default secToHours;
