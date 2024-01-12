export const setAddress = (state) => ({ type: "SET_ADDRESS", address: state });
export const setShowWithdrawalModal = (state) => ({ type: "SET_SHOW_WITHDRAWAL_MODAL", showWithdrawalModal: state });
export const setSelectedCurrency = (state) => ({ type: "SET_SELECTED_CURRENCY", selectedCurrency: state });
export const setMinDeposits = (state) => ({ type: "SET_MINIMAL_DEPOSITS", minDeposits: state });
export const setCrowdfundingTokensDiscounts = (state) => ({ type: "SET_CROWDFUNDING_TOKENS_DISCOUNTS", crowdfundingTokensDiscounts: state });
export const setRollerCurrencies = (state) => ({ type: "SET_ROLLER_CURRENCIES", rollerCurrencies: state });
export const setRedDotNotify = (state) => ({ type: "SET_RED_DOT_NOTIFY", isRedDotNotify: state });

export const setRefreshBalance = (state) => ({ type: "SET_REFRESH_BALANCE", isRefreshBalance: state });
