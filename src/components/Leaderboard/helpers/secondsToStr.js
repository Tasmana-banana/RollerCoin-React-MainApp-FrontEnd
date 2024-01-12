const secondsToStr = (seconds, isPassword = false) => {
	const numberEnding = (number) => {
		return number > 1 ? "s" : "";
	};

	const years = Math.floor(seconds / (365 * 24 * 60 * 60));
	if (years > 1) {
		return `${years} year${numberEnding(years)}`;
	}
	const month = Math.floor(seconds / (30 * 24 * 60 * 60));
	if (month > 1) {
		return `${month} month`;
	}
	const weeks = Math.floor(seconds / (7 * 24 * 60 * 60));
	if (weeks > 1) {
		return `${weeks} weeks`;
	}
	const days = Math.floor(seconds / (24 * 60 * 60));
	if (days > 1) {
		return `${days} days`;
	}
	const hours = Math.floor(seconds / (60 * 60));
	if (hours > 1) {
		return `${hours} hours`;
	}
	const minutes = Math.floor(seconds / 60);
	if (minutes >= 1) {
		return `${minutes} minutes`;
	}
	return isPassword ? "less than a minute" : `${Math.floor(seconds)} seconds`;
};
export default secondsToStr;
