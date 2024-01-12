export const initTimer = (endDate = 0) => {
	const dateRangeMs = new Date(endDate).getTime() - new Date().getTime();
	if (dateRangeMs <= 0) {
		return 0;
	}
	return Math.floor(dateRangeMs / 1000);
};

export const makeCounterData = (timeLeftSeconds, oneString = false) => {
	const currentTimeLeft = timeLeftSeconds - 1;
	const days = Math.floor(currentTimeLeft / (24 * 3600));
	const hours = Math.floor((currentTimeLeft / 3600) % 24);
	const minutes = Math.floor((currentTimeLeft / 60) % 60);
	const seconds = Math.floor(currentTimeLeft % 60);
	if (oneString) {
		const totalHours = Math.floor(currentTimeLeft / 3600);
		const adjustedHours = totalHours < 10 ? `0${totalHours}` : totalHours;
		const adjustedMinutes = minutes < 10 ? `0${minutes}` : minutes;
		const adjustedSeconds = seconds < 10 ? `0${seconds}` : seconds;
		return {
			leftSeconds: currentTimeLeft,
			timeString: `${adjustedHours}:${adjustedMinutes}:${adjustedSeconds}`,
		};
	}
	return {
		leftSeconds: currentTimeLeft,
		days: days > 0 ? `${days}d` : "",
		hours: hours > 0 ? `${hours}h` : "0h",
		minutes: minutes > 0 ? `${minutes < 10 ? `0${minutes}` : minutes}m` : "00m",
		seconds: seconds > 0 ? `${seconds < 10 ? `0${seconds}` : seconds}s` : "00s",
	};
};
