const msecToDays = (seconds) => {
	const dayDivider = 86400000;
	return Math.floor(seconds / dayDivider);
};
export default msecToDays;
