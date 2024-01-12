const rewardImageConstructor = (rewardType, reward) => {
	const typeImgConfig = {
		power: "/static/img/seasonPass/reward_power.png?v=1.0.1",
		money: `/static/img/seasonPass/reward_${reward.currency}.png?v=1.0.1`, //
		miner: `${process.env.STATIC_URL}/static/img/market/miners/${reward.item_info.filename}.gif?v=${reward.item_info.img_ver}`,
		rack: `${process.env.STATIC_URL}/static/img/market/racks/${reward.item_info._id}.png?v=1.0.3`,
		trophy: `${process.env.STATIC_URL}/static/img/game/room/trophies/${reward.item_info.file_name}.png?v=1.0.0`,
		mutation_component: `${process.env.STATIC_URL}/static/img/storage/mutation_components/${reward.item_info._id}.png?v=1.0.1`,
		appearance: `${process.env.STATIC_URL}/static/img/market/appearances/${reward.item_info._id}.png?v=1.0.2`,
		hat: `${process.env.STATIC_URL}/static/img/market/hats/${reward.item_info._id}.png?v=1.0.0`,
		battery: `${process.env.STATIC_URL}/static/img/market/batteries/${reward.item_info._id}.png?v=1.0.0`,
	};
	return typeImgConfig[rewardType];
};

export default rewardImageConstructor;
