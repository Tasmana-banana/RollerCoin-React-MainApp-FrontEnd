/* eslint-disable no-continue, no-await-in-loop */
import store from "../../../../store";
import * as actions from "../../../../actions/game";
import { postMoveRackFromInventory, moveMinerFromInventory } from "./fetchRequests";

export const isInsertAllAvailable = (scene) => {
	const availableRackPlaces = getAvailableRackPlaces(scene);
	const availableMinerPlaces = getAvailableMinerPlaces(scene);
	const racks = scene.game.inventoryData.filter((item) => item.item_type === "rack");
	const miners = scene.game.inventoryData.filter((item) => item.item_type === "miner");
	const isRackInsertAvailable = availableRackPlaces.length && racks.length;
	const isMinerInsertAvailable = availableMinerPlaces.length && miners.length;
	return isRackInsertAvailable || isMinerInsertAvailable;
};

const getAvailableRackPlaces = (scene) => {
	const activeRoomKeys = Object.keys(scene.rooms).filter((key) => scene.rooms[key].isRoomActive);
	let result = [];
	activeRoomKeys.forEach((key) => {
		const { racksGrid, roomConfig } = scene.rooms[key];
		const roomId = roomConfig._id;
		for (let i = 3; i < racksGrid.length; i += 4) {
			for (let j = 0; j < racksGrid[0].length; j += 2) {
				if (racksGrid[i][j] !== 1) {
					const coord = {
						x: j / 2,
						y: (i + 1) / 4 - 1,
						roomId,
						level: key,
					};
					result = [...result, coord];
				}
			}
		}
	});
	return result.sort(sortByCoord);
};
const getAvailableMinerPlaces = (scene) => {
	let places = [];
	const activeRoomKeys = Object.keys(scene.rooms).filter((key) => scene.rooms[key].isRoomActive);
	activeRoomKeys.forEach((roomKey) => {
		const { racksContainer } = scene.rooms[roomKey];
		const racksList = racksContainer.list.filter((item) => item.minersGrid);
		racksList.forEach((rackItem) => {
			const { rack_id: rackId } = rackItem.characteristics;
			const { x, y } = rackItem.rackSprite.itemInfo.placement;
			rackItem.minersGrid.forEach((minerGridItem, index) => {
				const placeItem = {
					level: roomKey,
					x,
					y,
				};
				if (typeof minerGridItem[0] === "object" && minerGridItem[0].twoCell) {
					placeItem.twoCell = {
						x: 0,
						y: index,
						rackId,
						width: 2,
					};
					placeItem.oneCellLeft = {
						x: 0,
						y: index,
						rackId,
						width: 1,
					};
					placeItem.oneCellRight = {
						x: 1,
						y: index,
						rackId,
						width: 1,
					};
				}
				if (typeof minerGridItem[0] === "object" && !minerGridItem[0].twoCell && minerGridItem[0].oneCell) {
					placeItem.oneCellLeft = {
						x: 0,
						y: index,
						rackId,
						width: 1,
					};
				}
				if (typeof minerGridItem[1] === "object" && !minerGridItem[0].twoCell && minerGridItem[1].oneCell) {
					placeItem.oneCellRight = {
						x: 1,
						y: index,
						rackId,
						width: 1,
					};
				}

				if (Object.keys(placeItem).length > 3) {
					placeItem.id = `${rackId}_${index}`;
					places = [...places, placeItem];
				}
			});
		});
	});
	return places.sort(sortByCoord);
};
const generateMinerPlaces = (rackId, rackHeight, level, x, y) => {
	let places = [];
	for (let i = 0; i < rackHeight; i += 1) {
		places = [
			...places,
			{
				level,
				x,
				y,
				oneCellLeft: { x: 0, y: i, rackId, width: 1 },
				oneCellRight: { x: 1, y: i, rackId, width: 1 },
				twoCell: { x: 0, y: i, rackId, width: 2 },
				id: `${rackId}_${i}`,
			},
		];
	}
	return places;
};

const sortByCoord = (a, b) => {
	if (a.level < b.level) {
		return -1;
	}
	if (a.level > b.level) {
		return 1;
	}
	if (a.y < b.y) {
		return -1;
	}
	if (a.y > b.y) {
		return 1;
	}
	if (a.x < b.x) {
		return -1;
	}
	if (a.x > b.x) {
		return 1;
	}
	return 0;
};
const sortMiners = (a, b) => {
	if (b.width > a.width) {
		return 1;
	}
	if (b.width < a.width) {
		return -1;
	}
	if (b.power > a.power) {
		return 1;
	}
	if (b.power < a.power) {
		return -1;
	}
	if (a.item_id < b.item_id) {
		return 1;
	}
	if (a.item_id > b.item_id) {
		return -1;
	}
	return 0;
};
const fillTheRoom = async (scene) => {
	let isUpdateGameRequired = false;
	const availableRackPlaces = getAvailableRackPlaces(scene);
	let availableMinerPlaces = getAvailableMinerPlaces(scene);
	const racks = scene.game.inventoryData.filter((item) => item.item_type === "rack").sort((a, b) => b.height - a.height);
	const miners = scene.game.inventoryData.filter((item) => item.item_type === "miner").sort(sortMiners);
	// INSERT RACKS
	const lesserLength = racks.length > availableRackPlaces.length ? availableRackPlaces.length : racks.length;
	for (let i = 0; i < lesserLength; i += 1) {
		const { user_item_id: userItemId, height } = racks[i];
		if (availableRackPlaces.length) {
			const place = availableRackPlaces.shift();
			const { roomId, x, y, level } = place;
			await postMoveRackFromInventory(scene, roomId, userItemId, x, y);
			const additionalMinerPlaces = generateMinerPlaces(userItemId, height, level, x, y);
			availableMinerPlaces = [...availableMinerPlaces, ...additionalMinerPlaces];
			isUpdateGameRequired = true;
			scene.game.inventoryData = scene.game.inventoryData.filter((item) => item.user_item_id !== userItemId);
		}
	}
	availableMinerPlaces = availableMinerPlaces.sort(sortByCoord);
	// INSERT MINERS

	let isFirstMiner = false;
	for (let i = 0; i < miners.length; i += 1) {
		const { user_item_id: userItemId, width } = miners[i];
		if (availableMinerPlaces.length) {
			const minerObj = {
				userItemId,
			};
			if (width === 2) {
				const findPlace = availableMinerPlaces.find((item) => item.twoCell);
				if (!findPlace) {
					continue;
				}
				minerObj.rackId = findPlace.twoCell.rackId;
				minerObj.x = findPlace.twoCell.x;
				minerObj.y = findPlace.twoCell.y;
				availableMinerPlaces = availableMinerPlaces.filter((item) => item.id !== findPlace.id);
			}
			if (width === 1) {
				const findPlace = availableMinerPlaces.find((item) => item.oneCellLeft || item.oneCellRight);
				if (!findPlace) {
					continue;
				}
				const sideOnRack = findPlace.oneCellLeft ? "oneCellLeft" : "oneCellRight";
				minerObj.rackId = findPlace[sideOnRack].rackId;
				minerObj.x = findPlace[sideOnRack].x;
				minerObj.y = findPlace[sideOnRack].y;
				delete findPlace[sideOnRack];
				if (findPlace.twoCell) {
					delete findPlace.twoCell;
				}
			}
			if (Object.keys(minerObj).length > 1) {
				const moveMinerResponse = await moveMinerFromInventory(scene, userItemId, minerObj.rackId, minerObj.x, minerObj.y);
				if (moveMinerResponse) {
					isFirstMiner = true;
				}
				isUpdateGameRequired = true;
				scene.game.inventoryData = scene.game.inventoryData.filter((item) => item.user_item_id !== userItemId);
			}
		}
	}
	if (isFirstMiner) {
		return store.dispatch(actions.setIsFirstMiningInGame(true));
	}
	if (isUpdateGameRequired) {
		scene.refreshGame();
	}
};
export default fillTheRoom;
