import store from "../store";

export const setIsAuthorizedSocket = (state) => ({ type: "SET_IS_AUTHORIZED_SOCKET", isAuthorizedSocket: state });
export const setIsAuthorizedNode = (state) => ({ type: "SET_IS_AUTHORIZED_NODE", isAuthorizedNode: state });
export const setReferralId = (state) => ({ type: "SET_REFERRAL_ID", referralId: state });
export const setGender = (state) => ({ type: "SET_GENDER", gender: state });
export const setPower = (state) => ({ type: "SET_POWER", power: state });
export const setIncome = (state) => ({ type: "SET_INCOME", income: state });
export const setIsSessionSocketChecked = (state) => ({ type: "SET_IS_SESSION_SOCKET_CHECKED", isSessionSocketChecked: state });
export const setIsSessionNodeChecked = (state) => ({ type: "SET_IS_SESSION_NODE_CHECKED", isSessionNodeChecked: state });
export const setCurrentMiningCurrency = (state) => ({ type: "SET_MINING_CURRENCY", currentMiningCurrency: state });
export const togglePartitionModal = () => ({ type: "TOGGLE_PARTITION_MODAL" });
export const setUserTutorial = (state) => ({ type: "SET_USER_TUTORIAL", userTutorial: state });
export const setUser = (state) => ({ type: "SET_USER", userData: state });
export const setEmail = (state) => ({ type: "SET_EMAIL", email: state });
export const setNewFullname = (state) => ({ type: "SET_NEW_FULLNAME", fullName: state });
export const setNewAvatarVersion = (state) => ({ type: "SET_NEW_AVATAR_VERSION", avatarVersion: state });
export const setNewAvatarType = (state) => ({ type: "SET_NEW_AVATAR_TYPE", avatarType: state });
export const logOutUser = () => ({ type: "LOG_OUT_USER" });
export const setViewedWeeklyOffer = (state) => ({ type: "SET_VIEW_WEEKLY_OFFER", viewedWeeklyOffer: state });
export const setViewedEventQuestion = (state) => ({ type: "SET_VIEW_EVENT_QUESTION", viewedEventQuestion: state });
export const setEndTimeWeeklyOffer = (state) => ({ type: "SET_END_TIME_WEEKLY_OFFER", endTime: state });
export const setIsAuthorizedMetaMask = (state) => ({ type: "SET_IS_AUTHORIZED_METAMASK", isAuthorizedMetaMask: state });
export const setIsNeedShowInfluencersRewards = (state) => ({ type: "SET_IS_NEED_SHOW_INFLUENCERS_REWARDS", isNeedShowInfluencersRewards: state });
export const setIsPwaActive = (state) => ({ type: "SET_IS_PWA_ACTIVE", isPwaActive: state });
export const setMiningConfig = (state) => {
	const miningConfig = state
		.map((config) => {
			const defaultConfig = store.getState().wallet.rollerCurrencies.find((c) => c.balanceKey === config.currency);
			return {
				...config,
				fullName: defaultConfig.fullname,
				code: defaultConfig.code,
				img: defaultConfig.img,
				toSmall: defaultConfig.toSmall,
				name: defaultConfig.name,
				precision: defaultConfig.precision,
				color: defaultConfig.color,
				divider: defaultConfig.divider,
				position: defaultConfig.position,
			};
		})
		.sort((a, b) => a.position - b.position);
	return { type: "SET_MINING_CONFIG", miningConfig };
};

export const setRank = (state) => ({
	type: "SET_RANK",
	rank: {
		position: state.index,
		total: state.total,
	},
});

export const setMiningConfigUnauthorizedUser = (state) => ({ type: "SET_MINING_CONFIG_UNAUTHORIZED_USER", miningConfigUnauthorizedUser: state });

export const setFingerprint = (state) => ({ type: "SET_FINGERPRINT", fingerprint: state });
