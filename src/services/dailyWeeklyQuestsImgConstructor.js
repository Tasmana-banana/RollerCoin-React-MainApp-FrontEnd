import decimalAdjust from "./decimalAdjust";
import { ITEM_TYPE } from "../constants/Game/itemTypes";

const imageSourceBuilder = {
	[ITEM_TYPE.MINER]: (id) => `${process.env.STATIC_URL}/static/img/market/miners/${id}.gif?v=1.0.3`,
	[ITEM_TYPE.RACK]: (id) => `${process.env.STATIC_URL}/static/img/market/racks/${id}.png?v=1.0.3`,
	[ITEM_TYPE.BATTERY]: () => `/static/img/market/battery_icon.svg?v=1.0.1`,
};

const dailyWeeklyQuestsImgConstructor = (reward, currencyConfig) => {
	const result = {
		img: {
			src: "",
			alt: "",
		},
		amount: 0,
	};
	if (reward?.item_id) {
		result.img.src = imageSourceBuilder[reward.type](reward.item_id);
		result.img.alt = reward.type;
		result.amount = reward.amount;
	} else {
		result.img.src = `/static/img/wallet/${currencyConfig.img}.svg?v=1.13`;
		result.img.alt = currencyConfig.name;
		result.amount = reward?.amount && decimalAdjust(reward.amount / currencyConfig.toSmall, currencyConfig.precision);
	}

	return result;
};

export default dailyWeeklyQuestsImgConstructor;
