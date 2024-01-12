import store from "../store";

const getCurrencyConfig = (currency) => {
	const currencyObj = store.getState().wallet.rollerCurrencies.find((item) => item.balanceKey === currency);
	const result = { ...currencyObj };
	if (currency === "SAT") {
		result.name = "SAT";
		result.min = 1;
		result.toSmall = 1;
		result.precision = 2;
		result.precisionToBalance = 2;
	} else if (["RLT", "RST"].includes(currency)) {
		result.precision = 2;
		result.precisionToBalance = 2;
	}
	return result;
};

export default getCurrencyConfig;
