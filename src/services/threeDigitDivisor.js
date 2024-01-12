const threeDigitDivisor = (value, dividerType) => {
	let divider = "";
	switch (dividerType) {
		case "dot":
			divider = ".";
			break;
		case "space":
			divider = " ";
			break;
		case "comma":
			divider = ",";
			break;
		default:
			divider = ".";
	}
	return value.toString().replace(/^[+-]?\d+/, (int) => {
		return int.replace(/(\d)(?=(\d{3})+$)/g, `$1${divider}`);
	});
};

export default threeDigitDivisor;
