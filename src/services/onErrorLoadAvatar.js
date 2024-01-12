import { getRandImg } from "../components/Leaderboard/helpers";

const onErrorLoadAvatar = (e) => {
	e.target.src = getRandImg();
};
export default onErrorLoadAvatar;
