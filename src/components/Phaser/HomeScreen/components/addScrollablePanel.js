import { isInsertAllAvailable } from "../helpers/fillTheRoom";
import { MINERS_TYPES } from "../../../../constants/Storage";

const COLOR_PRIMARY = 0x2f3047;

const addScrollablePanel = (scene) => {
	const heightForMove = scene.getHeightForMoveToInventory();
	scene.scrollablePanel = scene.rexUI.add
		.scrollablePanel({
			x: 560,
			y: scene.isInventoryOpen ? heightForMove - 52 : heightForMove + 52,
			width: 880,
			height: 100,
			scrollMode: 1,
			background: scene.rexUI.add.roundRectangle(0, 0, 2, 2, 0, COLOR_PRIMARY),
			panel: {
				child: createPanel(scene),
				mask: {
					updateMode: 0,
					padding: 1,
				},
			},
			slider: false,
			scroller: false,
			space: {
				left: 10,
				right: 10,
				top: 10,
				bottom: 10,
				panel: 10,
			},
		})
		.layout();
	scene.inventoryContainer.add(scene.scrollablePanel);
	scene.originInventoryY = {
		panel: {
			open: -52,
			close: 52,
		},
		panelContainer: {
			open: 0,
			close: 100,
		},
	};
	scene.input.topOnly = true;
};
const createPanel = (scene) => {
	scene.sizer = scene.rexUI.add
		.sizer({
			orientation: "x",
			space: { item: 10 },
		})
		.add(
			createTable(scene, 1), // child
			{ expand: true }
		);
	return scene.sizer;
};

const createTable = (scene, rows) => {
	let gridConfig = {
		column: 1,
		row: 1,
		rowProportions: 1,
		space: { column: 10, row: 10 },
		name: "items",
	};
	// set items count
	scene.inventory.itemsCount.setText(`(${scene.game.inventoryData.length})`);
	const isInsertAllButtonActive = isInsertAllAvailable(scene);
	if (scene.game.inventoryData.length) {
		const columns = Math.ceil(scene.game.inventoryData.length / rows);
		gridConfig = {
			column: columns,
			row: rows,
			rowProportions: 1,
			space: { column: 10, row: 10 },
			name: "items",
		};
		if (isInsertAllButtonActive) {
			scene.inventory.insertAll.setInteractive({ cursor: "pointer" });
			scene.inventory.insertAll.setAlpha(1);
			scene.inventory.insertAll.on("pointerover", () => {
				scene.inventory.insertAll.setAlpha(0.8);
			});
			scene.inventory.insertAll.on("pointerout", () => {
				scene.inventory.insertAll.setAlpha(1);
			});
		} else {
			scene.inventory.insertAll.setAlpha(0.4);
			scene.inventory.insertAll.removeInteractive();
		}
	}
	scene.table = scene.rexUI.add.gridSizer(gridConfig);

	if (!scene.game.inventoryData.length) {
		scene.goToStore = scene.add.image(880 / 2, 0, "goToStore");
		scene.goToStore.setOrigin(0.5).setInteractive({ cursor: "pointer" });
		scene.goToStore.on("pointerup", () => {
			scene.game.roomsConfig.reactHistoryObject.push("/game/market");
		});
		scene.goToStore.on("pointerover", () => {
			scene.goToStore.setAlpha(0.8);
		});
		scene.goToStore.on("pointerout", () => {
			scene.goToStore.setAlpha(1);
		});
		scene.table.add(scene.goToStore, 1, 1, "center", 10, true);
		scene.inventory.insertAll.setAlpha(0.4);
		scene.inventory.insertAll.removeInteractive();
	}
	let item;
	let r;
	let c;
	for (let i = 0, cnt = scene.game.inventoryData.length; i < cnt; i += 1) {
		item = scene.game.inventoryData[i];
		r = i % rows;
		c = (i - r) / rows;
		scene.table.add(createIcon(scene, item), c, r, "top", 10, true);
	}
	return scene.table;
};

export const createIcon = (scene, item) => {
	let img = null;
	const itemInfo = {
		texture: item.item_id,
		id: item.user_item_id,
		type: item.item_type,
		miner_type: item.type || null,
		width: item.width,
		level: item.level,
		height: item.height,
		power: item.power,
	};
	img = scene.add.sprite(0, 0, item.item_id);
	img.itemType = item.item_type;
	img.isNew = item.is_new;
	if (item.is_new && item.item_type === "miner") {
		img.setFrame(4);
	} else if (item.is_new) {
		img.setFrame(1);
	}
	if (item.item_type === "miner" && !item.is_new && !scene.broken) {
		scene.anims.create({
			key: `miner_inventory_${item.item_id}`,
			frames: scene.anims.generateFrameNames(item.item_id, { end: 3 }),
			repeat: -1,
			frameRate: 5,
		});
		img.play(`miner_inventory_${item.item_id}`);
	}
	const imageRealHeightAndWidth = { width: img.frame.width, height: img.frame.height };
	img.setInteractive({ cursor: "pointer" });
	const imgNewCharacteristics = scene.getImgNewCharacteristics(img);
	img.setSize(imgNewCharacteristics.width, imgNewCharacteristics.height);
	img.setDisplaySize(58, imgNewCharacteristics.height);
	const icon = scene.add.container(0, 0);
	icon.add(img);
	if (itemInfo.level && itemInfo.miner_type === MINERS_TYPES.MERGE) {
		icon.add(
			scene.add
				.sprite(-23, -6, `level_${itemInfo.level + 1}`, itemInfo.level - 1)
				.setScale(0.8)
				.setOrigin(0.5, 1)
		);
	}
	if (itemInfo.level && itemInfo.miner_type === MINERS_TYPES.OLD_MERGE) {
		icon.add(
			scene.add
				.sprite(-4, -10, "miner_level", itemInfo.level - 1)
				.setScale(0.8)
				.setOrigin(0.5, 1)
		);
	}

	icon.width = 58;
	icon.height = imgNewCharacteristics.height;
	const label = scene.rexUI.add.label({
		orientation: "horizontal",
		icon,
		space: { icon: 3 },
		name: item._id,
	});
	img.on("pointerdown", (pointer) => {
		const { worldX, worldY } = pointer;
		if (pointer.rightButtonDown()) {
			return false;
		}
		scene.isForceHide = true;
		scene.generatePseudoInventoryItem(worldX, worldY, imageRealHeightAndWidth, imgNewCharacteristics, itemInfo, label);
	});
	return label;
};
export default addScrollablePanel;
