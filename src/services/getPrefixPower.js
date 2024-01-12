export default function getPrefixPower(power) {
	let counter = 0;
	while (Math.abs(+power) >= 1000) {
		power /= 1000;
		power = power.toFixed(3);
		counter += 1;
	}
	let hashDetail;
	switch (counter) {
		case 0:
			hashDetail = " Gh/s";
			break;
		case 1:
			hashDetail = " Th/s";
			break;
		case 2:
			hashDetail = " Ph/s";
			break;
		case 3:
			hashDetail = " Eh/s";
			break;
		case 4:
			hashDetail = " Zh/s";
			break;
		default:
			break;
	}
	return { hashDetail, power };
}
