import store from "../../../store";

const getCurrencyConfig = (currency) => store.getState().wallet.rollerCurrencies.find((cfg) => cfg.name === currency);

export default getCurrencyConfig;
