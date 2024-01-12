export const TABS_TYPE = {
	EVENT: "event",
	SHOP: "shop",
	HOW_IT_WORKS: "howItWorks",
};

export const TABS_ROUTE = {
	[TABS_TYPE.EVENT]: "special-event",
	[TABS_TYPE.SHOP]: "game/market/special-event-store",
	[TABS_TYPE.HOW_IT_WORKS]: "special-event/how-it-works",
};

export const BLOCK_TYPES = {
	PRODUCTS: "products",
	BURN: "burn",
};

export const ANIMATION_TYPE = {
	START_BURN: "start_burn",
	COMPLETE_BURN: "complete_burn",
	CLAIM_REWARD: "claim_reward",
};

export const ITEMS_TYPES_IS_MULTIPLE = {
	miner: false,
	rack: false,
	mutation_component: true,
	battery: true,
};
