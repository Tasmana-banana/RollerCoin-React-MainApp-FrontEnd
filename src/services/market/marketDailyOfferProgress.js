export const progressValue = (item) => {
	const isLimit = !!item.limit;
	const isUserLimit = !!item.limitPerUser;
	if (isLimit && !isUserLimit) {
		return Math.round(((item.limit - item.sold) / item.limit) * 100);
	}
	if (!isLimit && isUserLimit) {
		return Math.round(((item.limitPerUser - item.purchasedUserCount) / item.limitPerUser) * 100);
	}
	if (isLimit && isUserLimit && item.limit - item.sold >= item.limitPerUser - item.purchasedUserCount) {
		return Math.round(((item.limitPerUser - item.purchasedUserCount) / item.limitPerUser) * 100);
	}
	if (isLimit && isUserLimit && item.limit - item.sold < item.limitPerUser - item.purchasedUserCount) {
		return Math.round(((item.limit - item.sold) / item.limit) * 100);
	}
	if (!isLimit && !isUserLimit) {
		return 0;
	}
};

export const progressCount = (item) => {
	const isLimit = !!item.limit;
	const isUserLimit = !!item.limitPerUser;
	if (isLimit && !isUserLimit) {
		return {
			itemLimit: item.limit,
			itemSold: item.limit - item.sold > 0 ? item.limit - item.sold : 0,
		};
	}
	if (!isLimit && isUserLimit) {
		return {
			itemLimit: item.limitPerUser,
			itemSold: item.limitPerUser - item.purchasedUserCount > 0 ? item.limitPerUser - item.purchasedUserCount : 0,
		};
	}
	if (isLimit && isUserLimit && item.limit - item.sold >= item.limitPerUser - item.purchasedUserCount) {
		return {
			itemLimit: item.limitPerUser,
			itemSold: item.limitPerUser - item.purchasedUserCount > 0 ? item.limitPerUser - item.purchasedUserCount : 0,
		};
	}
	if (isLimit && isUserLimit && item.limit - item.sold < item.limitPerUser - item.purchasedUserCount) {
		return {
			itemLimit: item.limit,
			itemSold: item.limit - item.sold > 0 ? item.limit - item.sold : 0,
		};
	}
};
