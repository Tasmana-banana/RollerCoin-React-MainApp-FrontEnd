import store from "../store";
import { setRollerCurrencies, setSelectedCurrency, setCrowdfundingTokensDiscounts } from "../actions/wallet";
import { setMiningConfigUnauthorizedUser } from "../actions/userInfo";
import isMobileApp from "./isMobileApp";

const configMapper = (currencyConfig) => ({
	name: currencyConfig.name,
	code: currencyConfig.code,
	fullname: currencyConfig.fullname,
	baseCurrency: currencyConfig.base_currency || currencyConfig.fullname,
	network: currencyConfig.network,
	validationName: currencyConfig.validation_name,
	nameDisplayedInExpReward: currencyConfig.name_displayed_in_exp_reward,
	protocol: currencyConfig.protocol,
	img: currencyConfig.img,
	min: currencyConfig.min,
	toSmall: currencyConfig.to_small,
	precision: currencyConfig.precision,
	precisionToBalance: currencyConfig.precision_to_balance,
	disabledWithdraw: currencyConfig.code === "btc" ? isMobileApp() : currencyConfig.disabled_withdraw,
	disabledDeposits: currencyConfig.disabled_deposits,
	withdrawForPremiumUsers: currencyConfig.withdraw_for_premium_users,
	needExchangeRate: currencyConfig.is_currency_need_exchange,
	disabledBalance: currencyConfig.disabled_balance,
	isInReferralProgram: currencyConfig.is_at_referral_program,
	usedToBuyRLT: currencyConfig.used_to_buy_rlt,
	balanceKey: currencyConfig.balance_key,
	isWrapped: currencyConfig.is_wrapped || false,
	wrappedMultiplier: currencyConfig.wrapped_multiplier,
	color: currencyConfig.color,
	divider: currencyConfig.divider,
	isCanBeMined: currencyConfig.is_can_be_mined,
	isUserFeeEnabled: currencyConfig.is_user_fee_enabled,
	tag: currencyConfig.tag,
	position: currencyConfig.position,
	userWalletKey: currencyConfig.user_wallet_key,
	checkUrl: currencyConfig.check_url,
});

const fetchCurrencyConfig = async () => {
	try {
		const response = await fetch("/api/wallet/get-currencies-config");
		const responseJSON = await response.json();
		if (!responseJSON.success) {
			console.error(responseJSON.error);
			return [];
		}
		return responseJSON.data.currencies_config.map(configMapper).sort((a, b) => a.position - b.position);
	} catch (e) {
		console.error(e);
		return [];
	}
};

const dispatchCurrenciesConfig = (currenciesConfig) => store.dispatch(setRollerCurrencies(currenciesConfig));

const dispatchSelectedCurrency = (currenciesConfig) => {
	const selectedCurrency = { ...currenciesConfig.find(({ code }) => window.location.href.includes(code)) };
	if (!selectedCurrency || !Object.keys(selectedCurrency).length) {
		store.dispatch(setSelectedCurrency([...currenciesConfig][0]));
	}
	store.dispatch(setSelectedCurrency(selectedCurrency));
};

const dispatchCrowdfundingTokensDiscounts = (currenciesConfig) => {
	const crowdfundingTokensDiscounts = currenciesConfig.filter((c) => c.usedToBuyRLT).map((c) => ({ currency: c.code, discount: 0 }));
	store.dispatch(setCrowdfundingTokensDiscounts(crowdfundingTokensDiscounts));
};

const dispatchMiningConfigUnauthorizedUser = (currenciesConfig) => store.dispatch(setMiningConfigUnauthorizedUser(currenciesConfig.filter((c) => c.isCanBeMined)));

const initCurrenciesConfig = async () => {
	const currenciesConfig = await fetchCurrencyConfig();
	dispatchCurrenciesConfig(currenciesConfig);
	dispatchSelectedCurrency(currenciesConfig);
	dispatchCrowdfundingTokensDiscounts(currenciesConfig);
	dispatchMiningConfigUnauthorizedUser(currenciesConfig);
};

export default initCurrenciesConfig;
