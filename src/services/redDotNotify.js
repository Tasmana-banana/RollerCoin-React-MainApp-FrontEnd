import moment from "moment";

const getWeekUTCNumber = () => moment().utc().week().toString();

const isViewWeeklyOfferOnThisWeek = (endData) => {
	const lastView = localStorage.getItem("last_date_of_view_weekly_offer");
	return !(!lastView || moment(lastView).utc() > moment(endData).utc());
};

const isViewEventQuestionOnThisWeek = () => {
	const lastWeek = localStorage.getItem("last_week_of_view_event_quests");
	return !(!lastWeek || lastWeek !== getWeekUTCNumber());
};

const getTimeToNextMondayMs = () => {
	const nextMonday = moment().utc().add(1, "weeks").startOf("isoWeek");
	return nextMonday - moment().utc();
};

const getMSToNextWeeklyOffer = (endTime) => moment(endTime).utc() - moment().utc();

const getDayNumber = () => moment().utc().dayOfYear().toString();

const isViewEventQuestionOnThisDay = () => {
	const lastDay = localStorage.getItem("day_of_view_event_quests");
	return !(!lastDay || lastDay !== getDayNumber());
};

const getTimeToNextDayMs = () => {
	const nextDay = moment().utc().endOf("day");
	return nextDay - moment().utc();
};

const isRedDotNotifyWallet = (currenciesArr) => {
	const currencyOptionsFromLocalStorage = JSON.parse(localStorage.getItem("currency_options"));
	if (!currencyOptionsFromLocalStorage) {
		return true;
	}

	const isValuesUnequel = currenciesArr.some((currency) => {
		const currentCurrency = currencyOptionsFromLocalStorage.find((item) => item.currency === currency.currency);
		if (currentCurrency.tag !== currency.tag || currentCurrency.discount !== currency.discount) {
			return true;
		}
		return false;
	});

	return isValuesUnequel;
};

export default {
	getMSToNextWeeklyOffer,
	getWeekUTCNumber,
	isViewWeeklyOfferOnThisWeek,
	isViewEventQuestionOnThisWeek,
	getTimeToNextMondayMs,
	getDayNumber,
	isViewEventQuestionOnThisDay,
	getTimeToNextDayMs,
	isRedDotNotifyWallet,
};
