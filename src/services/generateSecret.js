import * as md5 from "blueimp-md5";

export default function generateSecret(startString) {
	const numbers = [];
	let startStringArray = [];
	if (startString) {
		startStringArray = startString.split("");
		startStringArray.forEach((val) => {
			if (Number(val) >= 0) {
				numbers.push(Number(val));
			}
		});
	}

	if (!numbers.length) {
		return md5("defaultrollersid");
	}
	const checkSum = numbers.reduce((previousValue, currentValue) => previousValue + currentValue, 0);
	const sortedNumbers = [...numbers].sort((a, b) => a - b);
	const returnArray = [...sortedNumbers, ...startStringArray.slice(0, sortedNumbers.length), ...[checkSum]];
	return md5(returnArray.join(""));
}
