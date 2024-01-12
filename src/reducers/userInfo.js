const initialState = {
	isAuthorizedSocket: false,
	isAuthorizedNode: false,
	isAuthorizedMetaMask: false,
	isCompleted: false,
	isSessionSocketChecked: false,
	isSessionNodeChecked: false,
	isBanned: false,
	isPremium: false,
	uid: "",
	fullName: "",
	email: "",
	isUserViewed2fa: false,
	is2faEnabled: false,
	referralId: "",
	registrationDate: "",
	isSocialRegistration: false,
	power: {
		games: 0,
		miners: 0,
		bonus: 0,
		total: 0,
	},
	income: {
		games: 0,
		referral: 0,
		total: 0,
	},
	gender: "",
	rank: {
		position: 1,
		total: 1,
	},
	avatarVersion: 0,
	avatarType: "default",
	miningConfig: [],
	userMinersAmount: 0,
	miningConfigUnauthorizedUser: [],
	currentMiningCurrency: localStorage.getItem("current_mining_currency") || "SAT",
	isPowerPartitionModalOpen: false,
	userViewedTutorial: {
		game: true,
		choose_game: true,
		event_pass: true,
	},
	isViewedWeeklyOffer: false,
	isViewedEventQuestion: false,
	endTimeWeeklyOffer: "",
	isOfferwallsActive: false,
	influensersLinkId: "",
	isNeedShowInfluencersRewards: false,
	isPwaActive: false,
	fingerprint: "",
};
const userReducer = (state = initialState, action) => {
	switch (action.type) {
		case "SET_IS_AUTHORIZED_SOCKET":
			return { ...state, isAuthorizedSocket: action.isAuthorizedSocket };
		case "SET_IS_AUTHORIZED_NODE":
			return { ...state, isAuthorizedNode: action.isAuthorizedNode };
		case "SET_IS_AUTHORIZED_METAMASK":
			return { ...state, isAuthorizedMetaMask: action.isAuthorizedMetaMask };
		case "SET_RANK":
			return { ...state, rank: action.rank };
		case "SET_REFERRAL_ID":
			return { ...state, referralId: action.referralId };
		case "SET_GENDER":
			return { ...state, gender: action.gender };
		case "SET_POWER":
			return { ...state, power: action.power };
		case "SET_INCOME":
			return { ...state, income: action.income };
		case "SET_IS_SESSION_SOCKET_CHECKED":
			return { ...state, isSessionSocketChecked: action.isSessionSocketChecked };
		case "SET_IS_SESSION_NODE_CHECKED":
			return { ...state, isSessionNodeChecked: action.isSessionNodeChecked };
		case "SET_MINING_CONFIG":
			return { ...state, miningConfig: action.miningConfig };
		case "SET_MINING_CURRENCY":
			return { ...state, currentMiningCurrency: action.currentMiningCurrency };
		case "TOGGLE_PARTITION_MODAL":
			return { ...state, isPowerPartitionModalOpen: !state.isPowerPartitionModalOpen };
		case "SET_USER_TUTORIAL":
			return { ...state, userViewedTutorial: action.userTutorial };
		case "LOG_OUT_USER":
			return initialState;
		case "SET_USER":
			return {
				...state,
				avatarType: action.userData.avatar_type,
				avatarVersion: action.userData.avatar_version,
				userMinersAmount: action.userData.user_miners_amount,
				isPremium: action.userData.is_premium,
				isCompleted: action.userData.is_completed,
				isBanned: action.userData.is_banned,
				uid: action.userData.id,
				fullName: action.userData.name,
				email: action.userData.email,
				isUserViewed2fa: action.userData.is_user_viewed_2fa,
				is2faEnabled: action.userData.is_2fa_enabled,
				gender: action.userData.gender,
				registrationDate: action.userData.registration,
				userViewedTutorial: action.userData.user_viewed_tutorial,
				isOfferwallsActive: action.userData.is_offerwalls_active,
				isAuthorizedMetaMask: action.userData.is_authorized_metamask,
				isSocialRegistration: action.userData.is_social_registration,
				isNeedShowInfluencersRewards: action.userData.is_need_show_influencers_rewards,
				isPwaActive: action.userData.is_pwa_active,
				publicProfileLink: action.userData.public_profile_link,
			};
		case "SET_NEW_FULLNAME":
			return { ...state, fullName: action.fullName };
		case "SET_EMAIL":
			return { ...state, email: action.email };
		case "SET_NEW_AVATAR_VERSION":
			return { ...state, avatarVersion: action.avatarVersion };
		case "SET_NEW_AVATAR_TYPE":
			return { ...state, avatarType: action.avatarType };
		case "SET_VIEW_WEEKLY_OFFER":
			return { ...state, isViewedWeeklyOffer: action.viewedWeeklyOffer };
		case "SET_END_TIME_WEEKLY_OFFER":
			return { ...state, endTimeWeeklyOffer: action.endTime };
		case "SET_VIEW_EVENT_QUESTION":
			return { ...state, isViewedEventQuestion: action.viewedEventQuestion };
		case "SET_MINING_CONFIG_UNAUTHORIZED_USER":
			return { ...state, miningConfigUnauthorizedUser: action.miningConfigUnauthorizedUser };
		case "SET_IS_NEED_SHOW_INFLUENCERS_REWARDS":
			return { ...state, isNeedShowInfluencersRewards: action.isNeedShowInfluencersRewards };
		case "SET_IS_PWA_ACTIVE":
			return { ...state, isPwaActive: action.isPwaActive };
		case "SET_FINGERPRINT":
			return { ...state, fingerprint: action.fingerprint };
		default:
			return state;
	}
};
export default userReducer;
