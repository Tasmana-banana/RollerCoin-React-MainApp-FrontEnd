import store from "../store";

const parseStoreProducts = (item, type) => {
	let completeItem = {};
	const currencyConfig = store.getState().wallet.rollerCurrencies.find((currency) => currency.balanceKey === (item.currency ? item.currency : "RLT"));
	switch (type) {
		case "miner":
			completeItem = {
				description: item.description,
				power: item.power,
				width: item.width,
				scalableImg: false,
			};
			if (item.created_by_title && item.created_by_title.text) {
				completeItem.createdByTitle = item.created_by_title;
			}
			break;
		case "appearance":
			completeItem = {
				description: item.description,
				selected: item.user_appearance ? item.user_appearance.selected : false,
				userHas: !!item.user_appearance,
				userAvailable: item.user_appearance ? item.user_appearance.active : true,
				active: item.active || false,
				scalableImg: true,
			};
			break;
		case "loot_box":
			completeItem = {
				limit: item.limit,
				sold: item.sold,
				type: item.type,
				scalableImg: false,
			};
			break;
		case "hat":
			completeItem = {
				limit: item.limit,
				sold: item.sold,
				type: item.type,
				scalableImg: false,
			};
			break;
		default:
			return false;
	}
	completeItem = {
		...completeItem,
		type,
		id: item._id,
		name: item.name,
		price: +item.price / currencyConfig.divider,
		normalPrice: +item.price / currencyConfig.divider,
		currency: item.currency || "RLT",
		isNotForSale: item.is_not_for_sale || false,
		isOutOfStock: item.is_out_of_stock || false,
		created: item.created || new Date(),
		sort: item.sort || 0,
		discount: false,
	};

	if (item.discount) {
		completeItem = {
			...completeItem,
			discount: true,
			price: +item.discount.discount_price / currencyConfig.divider,
			limit: item.discount.limit,
			limitPerUser: item.discount.limit_per_user,
			sold: item.discount.sold,
			displayedPercent: item.discount.displayed_percent,
			discountId: item.discount._id,
			tag: item.discount.tag || "",
			group: item.discount.group,
		};
	}
	return completeItem;
};

export default parseStoreProducts;
