const initialState = {
	isPEAvailable: false,
	peConfig: {
		event: null,
		levelsConfig: [],
		rewards: [],
		mainReward: null,
	},
	peTasks: [],
	peMultiplierTasks: [],
	peUserStats: {
		user_xp: 0,
		user_level: 0,
		user_multiplier: 100,
		user_multiplier_date_to: 0,
	},
	isPEUserStatsNeedRefresh: false,
};

const marketplaceReducer = (state = initialState, action) => {
	switch (action.type) {
		case "SET_IS_PE_AVAILABLE":
			return { ...state, ...{ isPEAvailable: action.isPEAvailable } };
		case "SET_PE_CONFIG":
			return { ...state, ...{ peConfig: action.peConfig } };
		case "SET_PE_TASKS":
			return { ...state, ...{ peTasks: action.peTasks } };
		case "SET_PE_MULTIPLIER_TASKS":
			return { ...state, ...{ peMultiplierTasks: action.peMultiplierTasks } };
		case "SET_PE_USER_STATS":
			return { ...state, ...{ peUserStats: action.peUserStats } };
		case "SET_IS_PE_USER_STATS_NEED_REFRESH":
			return { ...state, ...{ isPEUserStatsNeedRefresh: action.isPEUserStatsNeedRefresh } };
		case "SET_REMOVE_PE":
			return initialState;
		default:
			return state;
	}
};

export default marketplaceReducer;
