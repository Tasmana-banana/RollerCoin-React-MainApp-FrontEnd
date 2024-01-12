export default function parseCraftingPricesData(items, prices) {
	let totalSum = 0;
	const itemsPrices = items.reduce((acc, val) => {
		const fieldName = `${val.type}${val.item_id}`;
		if (!prices[fieldName]) {
			return acc;
		}
		acc[fieldName] = { ...prices[fieldName] };
		const itemShortageQuantity = Math.max(0, val.count - val.user_count);
		const isLimitAllow = prices[fieldName].limit ? prices[fieldName].limit - prices[fieldName].sold >= +itemShortageQuantity : true;
		const isPurchaseAvailable = prices[fieldName].isPurchaseAvailable && isLimitAllow;
		if (!isPurchaseAvailable) {
			acc[fieldName].isPurchaseAvailable = false;
			return acc;
		}
		let discountAvailable = !!prices[fieldName].discountID;
		if (discountAvailable && prices[fieldName].discountLimit) {
			const discountAvailableQuantity = prices[fieldName].discountLimit - prices[fieldName].discountSold;
			discountAvailable = discountAvailableQuantity >= itemShortageQuantity;
			if (!discountAvailable) {
				acc[fieldName].discountPrice = 0;
			}
		}
		totalSum += (discountAvailable ? prices[fieldName].discountPrice : prices[fieldName].price) * itemShortageQuantity;
		return acc;
	}, {});
	const allPartsAvailableToBuy = items.every((item) => item.count <= item.user_count || itemsPrices[`${item.type}${item.item_id}`].isPurchaseAvailable);
	return {
		itemsPrices,
		totalSum,
		allPartsAvailableToBuy,
	};
}
