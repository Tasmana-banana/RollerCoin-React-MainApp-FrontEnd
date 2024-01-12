import Phaser3 from "phaser";
import { createIcon } from "./addScrollablePanel";
import { postMoveMinerToInventory, postMoveRackToInventory, moveMinerBetweenRacks } from "../helpers/fetchRequests";
import { addMinerInfoPopup, addRackInfoPopup } from "./itemInfo";
import clearGridFromHighlight from "../helpers/clearGridFromHighlight";

const COLOR_PRIMARY = 0x2f3045;

const menuItemsRacks = [
	{
		name: "Move to items",
		icon: "moveToItemsIcon",
		isActiveFn: (scene, id) => !isRackHaveMiners(scene, id),
		callback: (scene, id) => {
			moveRackToInventory(scene, id);
		},
	},
	{
		name: "Demount miners",
		icon: "demountIcon",
		isActiveFn: (scene, id) => isRackHaveMiners(scene, id),
		callback: (scene, id) => moveMinersFromRack(scene, id),
	},
	{
		name: "Info",
		icon: "infoIcon",
		isActive: true,
		callback: (scene, id) => {
			addRackInfoPopup(scene, id);
		},
	},
];
const isRackHaveMiners = (scene, id) => {
	const rack = scene.getRacksById(id);
	return rack.minersGrid.some((rackY) => rackY.some((rackX) => rackX.type === "Container"));
};
const menuItemsMiners = [
	{
		name: "Move to items",
		icon: "moveToItemsIcon",
		isActive: true,
		callback: async (scene, id) => {
			await moveMinerToInventory(scene, id);
		},
	},
	{
		name: "Move",
		icon: "transposeIcon",
		isActive: true,
		callback: (scene, id) => {
			startDragMiner(scene, id);
		},
	},
	{
		name: "Info",
		icon: "infoIcon",
		isActive: true,
		callback: (scene, id) => {
			addMinerInfoPopup(scene, id);
		},
	},
];
const startDragMiner = (scene, id) => {
	scene.destroyMinerBetweenRacks();
	scene.moveMinerBetweenRacks = {
		currentMiner: null,
		pseudoImg: null,
		backlight: null,
	};
	collapseMenu(scene);
	scene.moveMinerBetweenRacks.currentMiner = scene.minersGroup.getChildren().find((miner) => miner.itemInfo._id === id);
	const { parentRack } = scene.moveMinerBetweenRacks.currentMiner;
	const minerCoord = {
		x: parentRack.parentContainer.x + scene.moveMinerBetweenRacks.currentMiner.x + parentRack.x,
		y: parentRack.parentContainer.y + scene.moveMinerBetweenRacks.currentMiner.y + parentRack.y,
	};
	const currentSprite = scene.moveMinerBetweenRacks.currentMiner.list.find((item) => item.name === "miner");
	currentSprite.anims.resume();
	scene.moveMinerBetweenRacks.currentMiner.setAlpha(0.5);
	scene.moveMinerBetweenRacks.pseudoImg = scene.physics.add.sprite(minerCoord.x, minerCoord.y, scene.moveMinerBetweenRacks.currentMiner.itemInfo.miner_id);
	scene.moveMinerBetweenRacks.pseudoImg.setInteractive({ cursor: "pointer" });
	scene.moveMinerBetweenRacks.pseudoImg.drag = scene.plugins.get("rexDrag").add(scene.moveMinerBetweenRacks.pseudoImg);
	scene.moveMinerBetweenRacks.backlight = scene.add.sprite(minerCoord.x, minerCoord.y + 5, "transpose").setOrigin(0.5);
	if (!scene.anims.exists("transpose")) {
		scene.anims.create({
			key: "transpose",
			frameRate: 4,
			repeat: -1,
			frames: scene.anims.generateFrameNames("transpose"),
		});
	}
	scene.moveMinerBetweenRacks.backlight.play("transpose");
	scene.moveMinerBetweenRacks.pseudoImg.drag.drag();
	scene.moveMinerBetweenRacks.pseudoImg.on("pointerdown", (pointer, pseudoX, pseudoY, event) => {
		scene.moveMinerBetweenRacks.backlight.destroy(true);
		event.stopPropagation();
	});
	scene.moveMinerBetweenRacks.pseudoImg.on("pointerup", (pointer, pseudoX, pseudoY, event) => {
		event.stopPropagation();
	});
	scene.highlightMinerPlaces(true, scene.moveMinerBetweenRacks.currentMiner.itemInfo.width);
	scene.moveMinerBetweenRacks.pseudoImg.on("dragstart", () => {
		scene.toggleGrabCursor(true);
		scene.inventoryOverlapedItem = null;
	});
	scene.moveMinerBetweenRacks.pseudoImg.on("drag", () => {
		scene.checkOverlap(scene.moveMinerBetweenRacks.pseudoImg, "miner", scene.moveMinerBetweenRacks.currentMiner.itemInfo.width);
	});
	scene.moveMinerBetweenRacks.pseudoImg.on("dragend", () => {
		scene.toggleGrabCursor(true);
		scene.highlightMinerPlaces(false);
		if (scene.inventoryOverlapedItem) {
			const { rackId, x, y } = scene.inventoryOverlapedItem;
			const data = {
				itemType: "miner",
				miner_id: scene.moveMinerBetweenRacks.currentMiner.itemInfo.miner_id,
				type: scene.moveMinerBetweenRacks.currentMiner.itemInfo.type,
				placement: { user_rack_id: rackId, x, y },
				width: scene.moveMinerBetweenRacks.currentMiner.itemInfo.width,
				level: scene.moveMinerBetweenRacks.currentMiner.itemInfo.level,
				power: scene.moveMinerBetweenRacks.currentMiner.itemInfo.power,
				_id: id,
			};
			const rackContainer = scene.getRacksById(rackId);
			scene.moveMinerBetweenRacks.currentMiner.parentRack.remove(scene.moveMinerBetweenRacks.currentMiner);
			clearGridFromHighlight(scene, x, y, rackContainer.minersGrid, "miner", scene.moveMinerBetweenRacks.currentMiner.itemInfo.width);
			addCustomMinerHighlight(scene, scene.moveMinerBetweenRacks.currentMiner);
			scene.minersGroup.remove(scene.moveMinerBetweenRacks.currentMiner);
			scene.moveMinerBetweenRacks.currentMiner.destroy(true);
			scene.moveMinerBetweenRacks.pseudoImg.setActive(false).setVisible(false);
			scene.addOneMiner(data);
			moveMinerBetweenRacks(scene, id, rackId, x, y);
			scene.inventoryOverlapedItem = null;
		} else {
			scene.moveMinerBetweenRacks.pseudoImg.moveTo = scene.plugins.get("rexMoveTo").add(scene.moveMinerBetweenRacks.pseudoImg);
			scene.moveMinerBetweenRacks.pseudoImg.moveTo.moveTo(minerCoord.x, minerCoord.y);
			scene.moveMinerBetweenRacks.pseudoImg.moveTo.setSpeed(1200);
			scene.moveMinerBetweenRacks.pseudoImg.moveTo.on("complete", () => {
				scene.moveMinerBetweenRacks.pseudoImg.destroy(true);
				scene.moveMinerBetweenRacks.currentMiner.setAlpha(1);
			});
		}
	});
	scene.input.on(
		"pointerdown",
		(pointer) => {
			if (
				scene.moveMinerBetweenRacks &&
				scene.moveMinerBetweenRacks.currentMiner &&
				scene.moveMinerBetweenRacks.pseudoImg &&
				!isTouchingItem(scene, scene.moveMinerBetweenRacks.pseudoImg, pointer)
			) {
				scene.destroyMinerBetweenRacks();
				scene.highlightMinerPlaces(false);
			}
		},
		this
	);
};
const pushToInventoryAndRefresh = (scene, item) => {
	let data = {};
	if (item.itemInfo.itemType === "miner") {
		data = {
			item_id: item.itemInfo.miner_id,
			item_type: "miner",
			type: item.itemInfo.type,
			user_item_id: item.itemInfo._id,
			width: item.itemInfo.width,
			level: item.itemInfo.level,
			power: item.itemInfo.power,
		};
	} else {
		data = {
			item_id: item.itemInfo.rack_id,
			item_type: "rack",
			user_item_id: item.itemInfo._id,
			height: item.itemInfo.rack_info.height,
			width: item.itemInfo.rack_info.width,
		};
	}
	const icon = createIcon(scene, data);
	scene.table.add(icon, 1, 0, "top", 10, true);
	scene.game.inventoryData.push(data);
	scene.refreshScrollablePanel();
};
const moveRackToInventory = (scene, id) => {
	const currentRack = scene.racksGroup.getChildren().find((item) => item.itemInfo._id === id);
	const { racksContainer } = scene.rooms[`level_${currentRack.itemInfo.level}`];
	const { placement, rack_info: rackInfo } = currentRack.itemInfo;
	const heightForMove = scene.getHeightForMoveToInventory();
	scene.fillRoomGrid(placement.x, placement.y, rackInfo, currentRack.itemInfo.level, 0);
	clearMinersGrid(currentRack.parentContainer);
	pushToInventoryAndRefresh(scene, currentRack);
	scene.physics.moveTo(currentRack, currentRack.x, heightForMove, 800, 500);
	collapseMenu(scene);
	scene.time.delayedCall(600, () => {
		racksContainer.remove(currentRack.parentContainer);
		currentRack.destroy(true);
		scene.addRacksHighlight();
	});
	postMoveRackToInventory(scene, id);
};
const clearMinersGrid = (rack) => {
	rack.minersGrid.forEach((y) =>
		y.forEach((x) => {
			if (x && x.oneCell) {
				x.oneCell.destroy(true);
			}
			if (x && x.twoCell) {
				x.twoCell.destroy(true);
			}
		})
	);
};
const collapseMenu = (scene) => {
	if (scene.popupMenu) {
		scene.popupMenu.collapse();
		scene.popupMenu = undefined;
	}
};
const moveMinersFromRack = async (scene, rackId) => {
	const miners = scene.minersGroup.getChildren();
	const currentRack = scene.getRacksById(rackId);
	currentRack.rackSprite.setFrame(0);
	const minersInRack = miners.filter((item) => item.itemInfo.placement.user_rack_id === rackId);
	const minersIds = minersInRack.map((miner) => miner.itemInfo._id);
	await moveMinerToInventory(scene, minersIds);
};
const moveMinerToInventory = async (scene, ids) => {
	const minersIds = Array.isArray(ids) ? ids : [ids];
	minersIds.forEach((id) => {
		const currentMiner = scene.minersGroup.getChildren().find((item) => item.itemInfo._id === id);
		const heightForMove = scene.getHeightForMoveToInventory();
		addCustomMinerHighlight(scene, currentMiner);
		pushToInventoryAndRefresh(scene, currentMiner);
		scene.physics.moveTo(currentMiner, currentMiner.x, heightForMove, 800, 500);
		collapseMenu(scene);
		scene.time.delayedCall(600, () => {
			scene.minersGroup.remove(currentMiner);
			currentMiner.destroy();
		});
	});
	scene.scene.run("Loader");
	try {
		for (let i = 0; i < minersIds.length; i += 1) {
			// eslint-disable-next-line no-await-in-loop
			await postMoveMinerToInventory(scene, minersIds[i]);
		}
	} catch (e) {
		scene.scene.run("ErrorScreen");
	}
	scene.scene.sleep("Loader");
};
const addCustomMinerHighlight = (scene, currentMiner) => {
	const { x, y } = currentMiner.placement;
	const { minersGrid } = currentMiner.parentRack;
	minersGrid[y][x] = {};
	minersGrid[y][x].oneCell = scene.addMinerLightSprite(x, y, currentMiner.parentRack, 1);
	if (currentMiner.cellWidth === 1 && minersGrid[y][x + 1] && minersGrid[y][x + 1].type !== "Container") {
		minersGrid[y][x].twoCell = scene.addMinerLightSprite(x, y, currentMiner.parentRack, 2);
	}
	if (currentMiner.cellWidth === 1 && minersGrid[y][x - 1] && minersGrid[y][x - 1].type !== "Container" && !minersGrid[y][x - 1].twoCell) {
		minersGrid[y][x - 1].twoCell = scene.addMinerLightSprite(x - 1, y, currentMiner.parentRack, 2);
	}
	if (currentMiner.cellWidth === 2) {
		minersGrid[y][x + 1] = {};
		minersGrid[y][x].twoCell = scene.addMinerLightSprite(x, y, currentMiner.parentRack, 2);
		minersGrid[y][x + 1].oneCell = scene.addMinerLightSprite(x + 1, y, currentMiner.parentRack, 1);
	}
};
const getMenuCoordDependsWorldBounds = (scene, x, y, items) => {
	const returnObj = {
		x,
		y,
	};
	const { height, width } = scene.game.config;
	const levelMaxY = scene.currentLevel ? height * (scene.currentLevel + 1) : height;
	const itemHeight = 50;
	const itemWidth = 80;
	const totalHeight = itemHeight * items.length;
	const heightDiff = levelMaxY - (totalHeight + y);
	const widthDiff = width - (itemWidth + x);
	if (heightDiff < 0) {
		returnObj.y += heightDiff;
	}
	if (widthDiff < 0) {
		returnObj.x += widthDiff;
	}
	return returnObj;
};
const addPopupMenu = (scene, id, x, y, itemType) => {
	if (scene.popupMenu) {
		scene.popupMenu.collapse();
		scene.popupMenu = undefined;
	}
	if (scene.isInventoryOpen) {
		scene.isForceHide = true;
	}
	scene.destroyMinerBetweenRacks();
	const { height, width } = scene.game.config;
	const roomsQuantity = scene.roomLevelsConfig.length;
	const globRectangle = new Phaser3.Geom.Rectangle();
	const items = itemType === "miner" ? menuItemsMiners : menuItemsRacks;
	const coord = getMenuCoordDependsWorldBounds(scene, x, y, items);
	scene.popupMenu = scene.rexUI.add.menu({
		x: coord.x,
		y: coord.y,
		bounds: globRectangle.setTo(0, 0, width, height * roomsQuantity),
		items,
		createButtonCallback: (item) => {
			const isActive = item.isActiveFn ? item.isActiveFn(scene, id) : item.isActive;
			const label = scene.rexUI.add.label({
				background: scene.rexUI.add.roundRectangle(0, 0, 2, 2, 0, COLOR_PRIMARY),
				text: scene.add.text(0, 0, item.name, {
					font: '24px "Roboto"',
					color: isActive ? "#e2e2e5" : "#5f6070",
				}),
				icon: scene.add.image(0, 0, item.icon).setAlpha(isActive ? 1 : 0.3),
				space: {
					left: 10,
					right: 10,
					top: 10,
					bottom: 10,
					icon: 10,
				},
			});
			label.isActive = isActive;
			label.callback = item.callback;
			label.itemId = id;
			label.setInteractive({ cursor: "pointer" });
			// label.on("pointerup", (pointer, labelX, labelY, event) => {
			// 	event.stopPropagation();
			// });
			// label.on("pointerdown", (pointer, labelX, labelY, event) => {
			// 	event.stopPropagation();
			// 	if (isActive) {
			// 		item.callback(scene, id);
			// 	}
			// });
			return label;
		},
		easeIn: {
			duration: 500,
			orientation: "y",
		},
		easeOut: {
			duration: 100,
			orientation: "y",
		},
		// expandEvent: 'button.over'
	});
	scene.popupMenu
		.on("button.over", (button) => {
			button.getElement("background").setStrokeStyle(1, 0xffffff);
			if (button.isActive) {
				button.getElement("text").setColor("#ffffff");
			}
		})
		.on("button.out", (button) => {
			button.getElement("background").setStrokeStyle();
			if (button.isActive) {
				button.getElement("text").setColor("#e2e2e5");
			}
		})
		.on("button.click", (button, index, pointer, event) => {
			if (button.isActive) {
				button.callback(scene, button.itemId);
				collapseMenu(scene);
			}
			event.stopPropagation();
		});
	scene.input.on(
		"pointerdown",
		(pointer) => {
			if (scene.popupMenu && !isTouchingItem(scene, scene.popupMenu, pointer)) {
				collapseMenu(scene);
				scene.toggleActiveItem();
			}
		},
		this
	);
};
const isTouchingItem = (scene, item, pointer) => {
	let result = false;
	const { worldX, worldY } = pointer;
	const widthRange = { min: item.x, max: item.x + item.width };
	const heightRange = { min: item.y, max: item.y + item.height };
	if (worldX >= widthRange.min && worldX <= widthRange.max && worldY >= heightRange.min && worldY <= heightRange.max) {
		result = true;
	}
	return result;
};
export default addPopupMenu;
