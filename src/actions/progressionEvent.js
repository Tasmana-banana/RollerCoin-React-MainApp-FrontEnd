export const setIsPEAvailable = (state) => ({ type: "SET_IS_PE_AVAILABLE", isPEAvailable: state });
export const setPEConfig = (state) => ({ type: "SET_PE_CONFIG", peConfig: state });
export const setPETasks = (state) => ({ type: "SET_PE_TASKS", peTasks: state });
export const setPEMultiplierTasks = (state) => ({ type: "SET_PE_MULTIPLIER_TASKS", peMultiplierTasks: state });
export const setPEUserStats = (state) => ({ type: "SET_PE_USER_STATS", peUserStats: state });
export const setIsPEUserStatsNeedRefresh = (state) => ({ type: "SET_IS_PE_USER_STATS_NEED_REFRESH", isPEUserStatsNeedRefresh: state });
export const setRemovePE = () => ({ type: "SET_REMOVE_PE" });
