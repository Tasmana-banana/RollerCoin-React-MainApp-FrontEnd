const initialState = {
	address: {},
	minDeposits: [],
	showWithdrawalModal: false,
	rollerCurrencies: [],
	selectedCurrency: {},
	crowdfundingTokensDiscounts: [],
	isRedDotNotify: false,
	isRefreshBalance: false,
};
const walletReducer = (state = initialState, action) => {
	switch (action.type) {
		case "SET_ADDRESS":
			return { ...state, address: { ...state.address, ...action.address } };
		case "SET_SHOW_WITHDRAWAL_MODAL":
			return { ...state, showWithdrawalModal: action.showWithdrawalModal };
		case "SET_SELECTED_CURRENCY":
			return { ...state, selectedCurrency: action.selectedCurrency };
		case "SET_MINIMAL_DEPOSITS":
			return {
				...state,
				minDeposits: Object.keys(action.minDeposits).map((key) => ({ currency: key, value: action.minDeposits[key] })),
			};
		case "SET_CROWDFUNDING_TOKENS_DISCOUNTS":
			return { ...state, crowdfundingTokensDiscounts: action.crowdfundingTokensDiscounts };
		case "SET_ROLLER_CURRENCIES":
			return { ...state, rollerCurrencies: action.rollerCurrencies };
		case "SET_RED_DOT_NOTIFY":
			return { ...state, isRedDotNotify: action.isRedDotNotify };
		case "SET_REFRESH_BALANCE":
			return { ...state, isRefreshBalance: action.isRefreshBalance };
		default:
			return state;
	}
};
export default walletReducer;
