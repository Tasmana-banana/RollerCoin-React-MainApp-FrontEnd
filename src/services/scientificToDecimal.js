export default function scientificToDecimal(number) {
	let decimal = number.toString().toLowerCase();
	if (decimal.includes("e+")) {
		const exponentialSplitted = decimal.split("e+");
		let postfix = "";
		for (let i = 0; i < +exponentialSplitted[1] - (exponentialSplitted[0].includes(".") ? exponentialSplitted[0].split(".")[1].length : 0); i += 1) {
			postfix += "0";
		}
		const addCommas = (text) => {
			let j = 3;
			let textLength = text.length;
			while (j < textLength) {
				text = `${text.slice(0, textLength - j)},${text.slice(textLength - j, textLength)}`;
				textLength += 1;
				j += 3 + 1;
			}
			return text;
		};
		decimal = addCommas(exponentialSplitted[0].replace(".", "") + postfix);
	}
	if (decimal.toLowerCase().includes("e-")) {
		const exponentialSplitted = decimal.split("e-");
		let prefix = "0.";
		for (let i = 0; i < +exponentialSplitted[1] - 1; i += 1) {
			prefix += "0";
		}
		decimal = prefix + exponentialSplitted[0].replace(".", "");
	}
	return decimal;
}
