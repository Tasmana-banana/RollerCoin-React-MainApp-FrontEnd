import store from "../store";

const parseMarketProducts = (item, type) => {
	let completeItem = {};
	let currentCurrency = "RLT";
	if (item?.discount?.currency) {
		currentCurrency = item.discount.currency;
	}
	if (!item.discount?.currency && item?.currency) {
		currentCurrency = item.currency;
	}
	const currencyConfig = store.getState().wallet.rollerCurrencies.find((currency) => currency.name === currentCurrency || currency.balanceKey === currentCurrency);
	switch (type) {
		case "miner":
			completeItem = {
				description: item.description,
				canBeSold: item.is_can_be_sold_on_mp,
				power: item.power,
				width: item.width,
				scalableImg: false,
				filename: item.filename,
				img_ver: new Date(item.last_update).getTime() || 1,
			};
			if (item.created_by_title && item.created_by_title.text) {
				completeItem.createdByTitle = item.created_by_title;
			}
			break;
		case "rack":
			completeItem = {
				width: item.width,
				height: item.height,
				capacity: item.capacity || +item.width * +item.height,
				description: item.description,
				scalableImg: true,
				percent: item.percent || 0,
			};
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
		case "mutation_component":
			completeItem = {
				limit: item.limit,
				sold: item.sold,
				type: item.type,
				rarityColor: item.rarity_group.base_color_hex,
				rarityTitle: item.rarity_group.title,
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
			currency: item.discount.currency || "RLT",
			productCurrency: item.currency || "RLT",
			price: +item.discount.discount_price / currencyConfig.divider,
			limit: item.discount.limit,
			limitPerUser: item.discount.limit_per_user,
			sold: item.discount.sold,
			purchasedUserCount: item.discount.purchasedUserCount || 0,
			displayedPercent: item.discount.displayed_percent,
			discountId: item.discount._id,
			tag: item.discount.tag || "",
			group: item.discount.group,
		};
	}
	return completeItem;
};

export default parseMarketProducts;
