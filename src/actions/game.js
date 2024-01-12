export const setJustBoughtItem = (state) => ({ type: "SET_JUST_BOUGHT_ITEM", justBoughtItem: state });
export const selectGame = (state) => ({ type: "SELECT_GAME", selectedGame: state });
export const setGamesInfo = (state) => ({ type: "SET_GAMES_INFO", games: state });
export const setBalance = (state) => ({ type: "SET_BALANCE", balance: state });
export const decrementExpired = () => ({ type: "DECREMENT_EXPIRED" });
export const setGameFinishedResult = (state) => ({ type: "SET_GAME_FINISHED_RESULT", gameFinishedResult: state });
export const setTotalRewardBlock = (state) => ({ type: "SET_TOTAL_REWARD_BLOCK", totalRewardBlock: state });
export const setSoundButtonStatus = (state) => ({ type: "SET_SOUND_BUTTON_STATUS", soundButtonStatus: state });
export const setTrophy = (state) => ({ type: "SET_TROPHY", trophy: state });
export const setMinersBroken = (state) => ({ type: "SET_MINERS_BROKEN", minersBroken: state });
export const setPlayForFixMiners = (state) => ({ type: "SET_PLAY_FOR_FIX_MINERS", playForFixMiners: state });
export const setMinersJustFixed = (state) => ({ type: "SET_MINERS_JUST_FIXED", minersJustFixed: state });
export const setLanguage = (state) => ({ type: "SET_LANGUAGE", language: state });
export const setIsMobile = (state) => ({ type: "SET_IS_MOBILE", isMobile: state });
export const reloadMainGame = (state) => ({ type: "SET_MAIN_GAME_VISIBLE", isMainGameVisible: state });
export const setPeModalOpen = (state) => ({ type: "SET_PE_MODAL", isPeModalOpen: state });
export const setIsRoomLoaded = (state) => ({ type: "SET_ROOM_LOADED_STATUS", isRoomLoaded: state });
export const setIsOpenDailyWeeklyQuestModal = (state) => ({ type: "SET_OPEN_DAILY_WEEKLY_MODAL", isOpenDailyWeeklyQuestModal: state });
export const setIsOpenCryptoQuestModalRedux = (state) => ({ type: "SET_OPEN_CRYPTO_QUEST_MODAL", isOpenCryptoQuestModal: state });
export const setReplenishmentModalStats = (state) => ({ type: "SET_REPLENISHMENT_MODAL_STATS", replenishmentModalStats: state });
export const setIsShowCustomNotification = (state) => ({ type: "IS_SHOW_CUSTOM_NOTIFICATION", isShowCustomNotification: state });

// WS ACTIONS
export const setUserPower = (state) => ({
	type: "SET_USER_POWER",
	userPower: state,
});
export const setPoolsPower = (state) => ({
	type: "SET_POOLS_POWER",
	poolsPower: state,
});
export const setCurrentPhaserGame = (state) => ({
	type: "SET_CURRENT_PHASER_GAME",
	currentPhaserGame: state,
});
export const setCurrentGameInfo = (state) => ({
	type: "SET_CURRENT_GAME_INFO",
	currentGameInfo: state,
});
export const setStatsGamesPlayed = (state) => ({
	type: "SET_STATS_GAMES_PLAYED",
	statsGamesPlayed: state,
});
export const setTimeDeltaFinishedGame = (state) => ({
	type: "SET_TIME_DELTA",
	timeDeltaFinishedGame: (() => {
		const hours = Math.ceil(+state / 3600);
		if (hours > 24) {
			return {
				time: Math.ceil(hours / 24),
				short_title: "d",
				title: "days",
			};
		}
		return {
			time: hours,
			short_title: "h",
			title: "hours",
		};
	})(),
});
export const setBlockProgress = (state) => ({
	type: "SET_PROGRESS_BLOCKS",
	progressBlocks: state,
});
export const setFirstTimeLoadedMinersBrokenComp = (state) => ({
	type: "SET_FIRST_TIME_LOADED_MINERS_BROKEN_COMP",
	firstTimeLoadedMinersBrokenComp: state,
});
export const setFinishedGameWS = (state) => ({
	type: "SET_FINISHED_GAME_WS",
	finishedGameWS: state,
});
export const setFinishedGameError = (state) => ({
	type: "SET_FINISHED_GAME_ERROR",
	finishedGameError: state,
});
export const setCaptcha = (state) => ({
	type: "SET_CAPTCHA",
	captcha: state,
});
export const setPhaserScreenInputManager = (state) => ({
	type: "SET_PHASER_SCREEN_INPUT_MANAGER",
	phaserScreenInputManager: state,
});

export const setIsFirstMiningInGame = (state) => ({
	type: "SET_IS_FIRST_MINING_IN_GAME",
	isFirstMinerInGame: state,
});
