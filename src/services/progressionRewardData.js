import store from "../store";
import threeDigitDivisor from "./threeDigitDivisor";
import getCurrencyConfig from "./getCurrencyConfig";
import decimalAdjust from "./decimalAdjust";

const MS_TO_DAYS = 86400000;

const progressionRewardData = (reward) => {
	const { language } = store.getState().game;
	switch (reward.type) {
		case "power": {
			const adjustedTTL = Math.round(reward.ttl_time / MS_TO_DAYS);
			return {
				img: "/static/img/seasonPass/reward_power.png?v=1.0.1",
				info: `${threeDigitDivisor(reward.amount)} Gh/s ${adjustedTTL}d`,
				title: `${threeDigitDivisor(reward.amount)} Gh/s ${adjustedTTL}d`,
			};
		}
		case "money": {
			const currencyConfig = getCurrencyConfig(reward.currency ? reward.currency : "RLT");
			const adjustedAmount = decimalAdjust(reward.amount / currencyConfig.toSmall, 2);
			const img = reward.currency === "RLT" ? "/static/img/seasonPass/reward_money.png?v=1.0.1" : `/static/img/seasonPass/reward_${reward.currency}.png?v=1.0.2`;
			return {
				img,
				info: `${adjustedAmount} ${reward.currency}`,
				title: `${adjustedAmount} ${reward.currency}`,
				type: reward.type,
			};
		}
		case "miner":
			return {
				img: `${process.env.STATIC_URL}/static/img/market/miners/${reward.item.filename}.gif?v=1.0.0`,
				info: `${threeDigitDivisor(reward.item ? reward.item.power : 0)} Gh/s`,
				title: reward.item.name[language] || reward.item.name.en,
				style: { maxHeight: "64px" },
				type: reward.type,
				item: {
					type: reward.item.type,
					level: reward.item.level,
				},
			};
		case "rack":
			return {
				img: `${process.env.STATIC_URL}/static/img/market/racks/${reward.item_id}.png?v=1.0.3`,
				info: reward.item.name[language] || reward.item.name.en,
				title: reward.item.name[language] || reward.item.name.en,
				style: { maxHeight: "42px" },
				type: reward.type,
			};
		case "mutation_component":
			return {
				img: `${process.env.STATIC_URL}/static/img/storage/mutation_components/${reward.item_id}.png?v=1.0.1`,
				info: `${reward.item.name[language] || reward.item.name.en} x${reward.amount}`,
				title: `${reward.item.name[language] || reward.item.name.en} x${reward.amount}`,
				style: { maxHeight: "32px", filter: `drop-shadow(0 0 4px #${reward.item?.rarity_color_hex || "ffffff"}` },
				type: reward.type,
			};
		case "hat":
			return {
				img: `${process.env.STATIC_URL}/static/img/market/hats/${reward.item_id}.png?v=1.0.0`,
				info: reward.item.title[language] || reward.item.title.en,
				title: reward.item.title[language] || reward.item.title.en,
				type: reward.type,
			};
		case "trophy":
			return {
				img: `${process.env.STATIC_URL}/static/img/game/room/trophies/${reward.item.file_name}.png?v=1.0.0`,
				info: reward.item.name[language] || reward.item.title.en,
				title: reward.item.name[language] || reward.item.title.en,
				style: { maxHeight: "36px" },
				type: reward.type,
			};
		case "season_pass_xp":
			return {
				img: `/static/img/seasonPass/reward_season_xp.png?v=1.0.0`,
				info: `Event Pass ${reward.amount} XP`,
				title: `Event Pass ${reward.amount} XP`,
				type: reward.type,
			};
		case "battery":
			return {
				img: `${process.env.STATIC_URL}/static/img/market/batteries/${reward.item_id}.png?v=1.0.0`,
				info: `${reward.title[language] || reward.title.en} x${reward.amount}`,
				title: reward.title[language] || reward.title.en,
				amount: reward.amount,
				type: reward.type,
			};
		default:
			return {
				img: "",
				info: "",
				type: "",
			};
	}
};

export default progressionRewardData;
