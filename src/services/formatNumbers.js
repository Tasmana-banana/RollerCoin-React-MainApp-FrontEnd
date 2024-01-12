export default function formatNumbers(number) {
	number = Number(number);
	if (typeof number === "number") {
		let numberStr = number.toString();
		let comma;
		let flag;
		if (numberStr.includes(".")) {
			comma = numberStr.substring(numberStr.indexOf("."), numberStr.length);
			numberStr = numberStr.substring(0, numberStr.indexOf("."));
			flag = true;
		}
		const parts = [];
		while (numberStr) {
			parts.push(numberStr.slice(-3));
			numberStr = numberStr.substring(0, numberStr.length - 3);
		}
		if (flag) {
			return parts.reverse().join(" ") + comma;
		}

		return parts.reverse().join(" ");
	}
	return "0";
}
