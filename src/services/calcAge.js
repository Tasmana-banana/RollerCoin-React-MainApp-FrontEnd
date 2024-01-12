import { secondsToStr } from "../components/Leaderboard/helpers";

const calcAge = (registration, isPassword = false) => {
	return secondsToStr((new Date() - new Date(registration)) / 1000, isPassword);
};
export default calcAge;
