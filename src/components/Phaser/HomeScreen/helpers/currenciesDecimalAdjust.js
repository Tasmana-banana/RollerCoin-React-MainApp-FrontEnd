import decimalAdjust from "../../../../services/decimalAdjust";

const currenciesDecimalAdjust = (rollerCurrencies, amount, currency) => {
	const currencyConfig = rollerCurrencies.find((item) => currency === item.code);
	return decimalAdjust(amount / currencyConfig.toSmall, currencyConfig.precisionToBalance);
};
export default currenciesDecimalAdjust;
