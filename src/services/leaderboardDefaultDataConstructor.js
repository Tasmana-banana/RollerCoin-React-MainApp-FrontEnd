const defaultUser = {
	avatar_type: "default",
	count_completed_tasks: 0,
	count_points: 0,
	full_name: "----",
	position: 0,
	public_profile_link: "",
	user_id: "",
	reward: {
		amount: 0,
	},
};

const topOptions = {
	1: 3,
	2: 2,
	3: 1,
};
const leaderboardDefaultDataConstructor = ({ workArrayWithDefaultUser, poolReward, type, index }) => {
	const defaultUserData = JSON.parse(JSON.stringify(defaultUser));
	if (type === "topList") {
		const findPlace = poolReward ? poolReward.find((reward) => reward.required_rank_from === topOptions[index]) : 0;
		defaultUserData.reward.amount = findPlace?.amount || null;
	}

	if (type === "rankTable") {
		const findPlace = poolReward ? poolReward.find((reward) => reward.required_rank_from === index || reward.required_rank_to >= index) : null;
		defaultUserData.reward.amount = findPlace?.amount || 0;
		defaultUserData.position = index;
	}
	workArrayWithDefaultUser.push({ ...defaultUserData });

	return workArrayWithDefaultUser;
};

export default leaderboardDefaultDataConstructor;
