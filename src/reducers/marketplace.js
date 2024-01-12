const initialState = {
	marketplaceConfig: {
		exchangeCurrencies: ["RLT"],
		isExchangeAvailable: false,
		quantityLimit: 999,
		systemFee: 5,
		fromDate: "09/14/2022",
	},
};

const marketplaceReducer = (state = initialState, action) => {
	switch (action.type) {
		case "SET_MARKETPLACE_CONFIG":
			return { ...state, ...{ marketplaceConfig: action.marketplaceConfig } };

		default:
			return state;
	}
};

export default marketplaceReducer;
