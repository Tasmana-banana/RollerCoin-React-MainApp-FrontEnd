import fetchWithToken from "../../../../services/fetchWithToken";

export const getItemInfo = async (scene, type, userItemID) => {
	scene.createSignalAndController(`getItemInfo`);
	scene.scene.run("Loader");
	try {
		const json = await fetchWithToken(`/api/game/item-info?type=${type}&user_item_id=${userItemID}`, {
			method: "GET",
			signal: scene.signals.getItemInfo,
		});
		if (!json.success) {
			return scene.scene.run("ErrorScreen");
		}
		scene.scene.sleep("Loader");
		return json.data;
	} catch {
		console.error(e);
		return scene.scene.run("ErrorScreen");
	}
};

export const moveMinerFromInventory = async (scene, minerId, rackId, x, y) => {
	scene.scene.run("Loader");
	scene.createSignalAndController(`moveMinerFromInventory_${minerId}`);
	const json = await fetchWithToken(`/api/game/move-miner-from-inventory`, {
		method: "POST",
		signal: scene.signals[`moveMinerFromInventory_${minerId}`],
		body: JSON.stringify({ miner_id: minerId, rack_id: rackId, x, y }),
	});
	if (!json.success) {
		return scene.scene.run("ErrorScreen");
	}
	refreshPower(scene);
	scene.scene.sleep("Loader");

	return json.data.is_first_miner;
};

export const moveMinerBetweenRacks = (scene, minerId, rackId, x, y) => {
	scene.scene.run("Loader");
	scene.createSignalAndController(`moveMinerBetweenRacks_${minerId}`);
	fetchWithToken(`/api/game/move-miner-between-racks`, {
		method: "POST",
		signal: scene.signals[`moveMinerBetweenRacks_${minerId}`],
		body: JSON.stringify({ miner_id: minerId, rack_id: rackId, x, y }),
	})
		.then((json) => {
			if (!json.success) {
				scene.scene.run("ErrorScreen");
			}
			refreshPower(scene);
			scene.scene.sleep("Loader");
		})
		.catch((e) => console.error(e));
};

export const postMoveMinerToInventory = async (scene, minerId) => {
	scene.createSignalAndController(`postMoveMinerToInventory_${minerId}`);
	const json = await fetchWithToken(`/api/game/move-miner-to-inventory`, {
		method: "POST",
		signal: scene.signals[`postMoveMinerToInventory_${minerId}`],
		body: JSON.stringify({ miner_id: minerId }),
	});
	if (!json.success) {
		return scene.scene.run("ErrorScreen");
	}
	refreshPower(scene);
};

export const postMoveRackFromInventory = async (scene, roomId, rackId, x, y) => {
	scene.scene.run("Loader");
	scene.createSignalAndController(`postMoveRackFromInventory_${rackId}`);
	const json = await fetchWithToken(`/api/game/move-rack-from-inventory`, {
		method: "POST",
		signal: scene.signals[`postMoveRackFromInventory_${rackId}`],
		body: JSON.stringify({ user_room_id: roomId, rack_id: rackId, x, y }),
	});
	if (!json.success) {
		return scene.scene.run("ErrorScreen");
	}
	scene.scene.sleep("Loader");
};

export const postMoveRackToInventory = (scene, rackId) => {
	scene.scene.run("Loader");
	scene.createSignalAndController(`postMoveRackToInventory_${rackId}`);
	fetchWithToken(`/api/game/move-rack-to-inventory`, {
		method: "POST",
		signal: scene.signals[`postMoveRackToInventory_${rackId}`],
		body: JSON.stringify({ rack_id: rackId }),
	})
		.then((json) => {
			if (!json.success) {
				scene.scene.run("ErrorScreen");
			}
			refreshPower(scene);
			scene.scene.sleep("Loader");
		})
		.catch((e) => console.error(e));
};

export const refreshBalance = (scene) => {
	scene.game.wsReact.send(
		JSON.stringify({
			cmd: "balance_request",
		})
	);
};

export const refreshPower = (scene) => {
	scene.game.wsReact.send(
		JSON.stringify({
			cmd: "get_powers_info",
		})
	);
};
