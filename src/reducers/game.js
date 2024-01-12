import games from "./defaultData/games";
import getLangFromUrl from "../services/getLangFromUrl";

const initialState = {
	showMarketConfirmation: false,
	balance: {
		btc: 0,
		doge: 0,
		eth: 0,
		rlt: 0,
		rst: 0,
		usdt: 0,
		matic: 0,
		ltc: 0,
		ecoin: 0,
		sol: 0,
		trx: 0,
	},
	discountPercent: 0,
	trophy: "",
	buy_action: {},
	expiredUpcostMiner: 0,
	games,
	selectedGame: {},
	timeDeltaFinishedGame: {
		time: 0,
		short_title: "h",
		title: "hours",
	},
	gameFinishedResult: {},
	totalRewardBlock: [],
	userMiners: [],
	userRacks: [],
	firstTimeLoadedMinersBrokenComp: true,
	minersBroken: false,
	playForFixMiners: 0,
	minersJustFixed: false,
	userPower: 0,
	isFirstMinerInGame: false,
	poolsPower: [],
	soundButtonStatus: false,
	currentPhaserGame: {},
	currentGameInfo: {},
	statsGamesPlayed: {
		played_24h: 0,
		won_24h: 0,
	},
	progressBlocks: [],
	finishedGameWS: {},
	finishedGameError: "",
	captcha: {
		isVerificationRequired: false,
		userGameId: "",
		isCaptchaValid: true,
	},
	language: getLangFromUrl(window.location.pathname),
	languages: [
		{ value: "cn", label: "中文", prefix: "/cn" },
		{ value: "es", label: "Spanish", prefix: "/es" },
		{ value: "pt", label: "Portuguese", prefix: "/pt" },
		{ value: "en", label: "English", prefix: "/" },
	],
	isMobile: false,
	justBoughtItem: "",
	isMainGameVisible: true,
	phaserScreenInputManager: {},
	isRoomLoaded: false,
	isOpenDailyWeeklyQuestModal: false,
	isOpenCryptoQuestModal: false,
	replenishmentModalStats: {
		isOpen: false,
		itemName: "",
		quantity: 1,
		price: 0,
		currency: "btc",
		skipPaymentMethod: false,
		exchangeRate: 1,
	},
	isPeModalOpen: false,
	isShowCustomNotification: false,
};
const gameReducer = (state = initialState, action) => {
	switch (action.type) {
		case "SET_BALANCE":
			return { ...state, ...{ balance: action.balance } };
		case "TOGGLE_MARKET_CONFIRMATION":
			return { ...state, ...{ showMarketConfirmation: !action.showMarketConfirmation } };
		case "SHOW_MARKET_CONFIRMATION":
			return { ...state, ...{ showMarketConfirmation: action.showMarketConfirmation } };
		case "HIDE_MARKET_CONFIRMATION":
			return { ...state, ...{ showMarketConfirmation: action.showMarketConfirmation } };
		case "SELECT_GAME":
			return { ...state, ...{ selectedGame: action.selectedGame } };
		case "SET_GAMES_INFO":
			return { ...state, ...{ games: action.games, selectedGame: action.games[Object.keys(state.selectedGame).length ? state.selectedGame.id - 1 : 0] } };
		case "SET_BUY_ACTION":
			return { ...state, ...{ buy_action: action.buy_action } };
		case "DECREMENT_EXPIRED":
			return { ...state, ...{ expiredUpcostMiner: state.expiredUpcostMiner - 1000 } };
		case "SET_GAME_FINISHED_RESULT":
			return { ...state, ...{ gameFinishedResult: action.gameFinishedResult } };
		case "SET_TOTAL_REWARD_BLOCK":
			return { ...state, ...{ totalRewardBlock: action.totalRewardBlock } };
		case "SET_USER_POWER":
			return { ...state, ...{ userPower: action.userPower } };
		case "SET_POOLS_POWER":
			return { ...state, ...{ poolsPower: [...state.poolsPower.filter((item) => item.currency !== action.poolsPower.currency), action.poolsPower] } };
		case "SET_SOUND_BUTTON_STATUS":
			return { ...state, ...{ soundButtonStatus: action.soundButtonStatus } };
		case "SET_CURRENT_PHASER_GAME":
			return { ...state, ...{ currentPhaserGame: action.currentPhaserGame } };
		case "SET_TIME_DELTA":
			return { ...state, ...{ timeDeltaFinishedGame: action.timeDeltaFinishedGame } };
		case "SET_CURRENT_GAME_INFO":
			return { ...state, ...{ currentGameInfo: action.currentGameInfo } };
		case "SET_STATS_GAMES_PLAYED":
			return { ...state, ...{ statsGamesPlayed: action.statsGamesPlayed } };
		case "SET_PROGRESS_BLOCKS":
			return { ...state, ...{ progressBlocks: [...state.progressBlocks.filter((item) => item.currency !== action.progressBlocks.currency), action.progressBlocks] } };
		case "SET_FIRST_TIME_LOADED_MINERS_BROKEN_COMP":
			return { ...state, ...{ firstTimeLoadedMinersBrokenComp: action.firstTimeLoadedMinersBrokenComp } };
		case "SET_FINISHED_GAME_WS":
			return { ...state, ...{ finishedGameWS: action.finishedGameWS } };
		case "SET_FINISHED_GAME_ERROR":
			return { ...state, ...{ finishedGameError: action.finishedGameError } };
		case "SET_TROPHY":
			return { ...state, ...{ trophy: action.trophy } };
		case "SET_MINERS_BROKEN":
			return { ...state, ...{ minersBroken: action.minersBroken } };
		case "SET_PLAY_FOR_FIX_MINERS":
			return { ...state, ...{ playForFixMiners: action.playForFixMiners } };
		case "SET_MINERS_JUST_FIXED":
			return { ...state, ...{ minersJustFixed: action.minersJustFixed } };
		case "SET_CAPTCHA":
			return { ...state, ...{ captcha: action.captcha } };
		case "SET_LANGUAGE":
			return { ...state, ...{ language: action.language } };
		case "SET_IS_MOBILE":
			return { ...state, ...{ isMobile: action.isMobile } };
		case "SET_JUST_BOUGHT_ITEM":
			return { ...state, ...{ justBoughtItem: action.justBoughtItem } };
		case "SET_MAIN_GAME_VISIBLE":
			return { ...state, ...{ isMainGameVisible: action.isMainGameVisible } };
		case "SET_PE_MODAL":
			return { ...state, ...{ isPeModalOpen: action.isPeModalOpen } };
		case "SET_PHASER_SCREEN_INPUT_MANAGER":
			return { ...state, ...{ phaserScreenInputManager: action.phaserScreenInputManager } };
		case "SET_ROOM_LOADED_STATUS":
			return { ...state, ...{ isRoomLoaded: action.isRoomLoaded } };
		case "SET_OPEN_DAILY_WEEKLY_MODAL":
			return { ...state, ...{ isOpenDailyWeeklyQuestModal: action.isOpenDailyWeeklyQuestModal } };
		case "SET_OPEN_CRYPTO_QUEST_MODAL":
			return { ...state, ...{ isOpenCryptoQuestModal: action.isOpenCryptoQuestModal } };
		case "SET_REPLENISHMENT_MODAL_STATS":
			return { ...state, ...{ replenishmentModalStats: action.replenishmentModalStats } };
		case "SET_IS_FIRST_MINING_IN_GAME":
			return { ...state, ...{ isFirstMinerInGame: action.isFirstMinerInGame } };
		case "IS_SHOW_CUSTOM_NOTIFICATION":
			return { ...state, ...{ isShowCustomNotification: action.isShowCustomNotification } };
		default:
			return state;
	}
};
export default gameReducer;
