import getLanguagePrefix from "../../../services/getLanguagePrefix";

const DailyWeeklyOnClickTrigger = async ({ taskID, type, link, language, history }) => {
	switch (type) {
		case "games_by_number":
		case "visit_game":
		case "games":
			return history.push(`${getLanguagePrefix(language)}/game/choose_game`);
		case "referral":
			return history.push(`${getLanguagePrefix(language)}/referral/stats`);
		case "amount_spent":
		case "amount_spent_in_store":
			return history.push(`${getLanguagePrefix(language)}/game/market`);
		case "open_lootbox":
		case "open_particular_lootbox":
			return history.push(`${getLanguagePrefix(language)}/game/market`);
		case "make_any_craft":
		case "make_craft_by_type":
			return history.push(`${getLanguagePrefix(language)}/storage/merge`);
		case "offer_task":
		case "offers_amount_provider":
		case "offers_amount":
			return history.push(`${getLanguagePrefix(language)}/taskwall`);
		case "weekly_offer_purchase":
			return history.push(`${getLanguagePrefix(language)}/game/market/sales`);
		case "buy_rlt":
			return history.push(`${getLanguagePrefix(language)}/wallet`);
		case "finish_tasks":
		case "complete_daily_tasks":
			break;
		case "youtube":
		case "facebook":
		case "twitter":
		case "telegram":
		case "discord":
		case "like_twitter":
		case "subscribe_twitter":
		case "subscribe_discord":
		case "subscribe_telegram":
		case "subscribe_instagram":
		case "subscribe_tiktok":
			window.open(link, "_blank");
			await this.collectTask(taskID);
			break;
		default:
			console.error("This function not found!");
	}
};

export default DailyWeeklyOnClickTrigger;
