export const ITEM_TYPE = {
	MINER: "miner",
	RACK: "rack",
	PART: "mutation_component",
	BATTERY: "battery",
	ACTIVE: "active-listings",
	MARKET_HISTORY: "market-history",
	SALES_HISTORY: "sales-history",
};

export const ITEM_TYPE_TO_INVENTORY_MAP = {
	[ITEM_TYPE.MINER]: "miners",
	[ITEM_TYPE.RACK]: "racks",
	[ITEM_TYPE.PART]: "parts",
	[ITEM_TYPE.BATTERY]: "batteries",
};
