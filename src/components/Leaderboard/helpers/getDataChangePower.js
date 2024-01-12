export default function getDataChangePower(history, powerNow) {
	let powerHistory = 0;
	if (history.length && history[history.length - 2]) {
		powerHistory = powerNow - history[history.length - 2];
	}
	return powerHistory;
}
