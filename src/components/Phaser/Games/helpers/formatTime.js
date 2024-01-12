const formatTime = (sec) => {
	let minutes = Math.floor(sec / 60);
	let seconds = (sec - minutes * 60).toFixed(0);

	if (minutes < 10) {
		minutes = `0${minutes}`;
	}
	if (seconds < 10) {
		seconds = `0${seconds}`;
	}
	return `${minutes}:${seconds}`;
};

export default formatTime;
