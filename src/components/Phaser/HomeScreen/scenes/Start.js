import Phaser3, { Scene } from "phaser";
import store from "../../../../store";
import * as actions from "../../../../actions/game";
import addPopupMenu from "../components/addPopupMenu";
import addScrollablePanel from "../components/addScrollablePanel";
import addChangeRoomsUI from "../components/addChangeRoomUI";
import { addRatingTrophies, addAdditionalObjects } from "../components/addAdditionalObject";
import addInventoryUi from "../components/addInventoryUi";
import clearGridFromHighlight from "../helpers/clearGridFromHighlight";
import { moveMinerFromInventory, postMoveRackFromInventory } from "../helpers/fetchRequests";
import fetchWithToken from "../../../../services/fetchWithToken";
import config from "../config/config";
import { MINERS_TYPES } from "../../../../constants/Storage";

const MAX_INV_ITEM_WIDTH = 58;
const MAX_INV_ITEM_HEIGHT = 86;
const MAX_ITEMS_IN_ROW = 10;

export default class Start extends Scene {
	constructor() {
		super({ key: "Start" });
		this.controllers = {};
		this.signals = {};
	}

	create() {
		this.CELLS_IN_ROW = 4;
		this.basicElements = this.game.roomsConfig.appearance.basic_elements;
		this.roomLevelsConfig = this.game.roomsConfig.appearance.room_levels_config;
		const { width, height } = this.game.config;
		const roomsQuantity = this.game.roomsConfig.skin.max_room_level + 1;
		this.cameras.main.setBounds(0, 0, width, height * roomsQuantity);
		this.physics.world.setBounds(0, 0, width, height * roomsQuantity);
		this.rltBalance = this.game.roomsConfig.balance.rlt;
		// global object of all rooms
		this.rooms = {};
		// current level (room)
		this.currentLevel = 0;
		// fires if room change
		this.changeRoomAction = false;
		// fires on change room animation, ends on animation end
		this.changeRoomUIAction = false;
		// switch room action
		this.isSwitchRoomAvailable = true;
		// fire inventory hide
		this.broken = this.game.roomsConfig.miners_broken;
		this.isUserFromSession = this.game.roomsConfig.is_user_from_session;
		this.minersPlaces = this.physics.add.group();
		this.addRooms();
		addAdditionalObjects(this);
		this.addRacks();
		this.addRacksHighlight();
		this.addMiners();
		if (this.isUserFromSession) {
			this.setInteractiveRack();
		}
		this.addMinersHighlight();
		addRatingTrophies(this);
		addChangeRoomsUI(this);
		if (this.isUserFromSession) {
			this.addInventoryEvn();
		}
		// listen destroy event
		this.events.on("destroy", this.onDestroy);
		this.game.setPhaserScreenInputManager(this.input.manager);
		this.game.setRoomLoadedStatus(true);
	}

	addInventoryEvn = () => {
		const { height } = this.game.config;
		this.inventory = {};
		this.activeItem = null;
		this.isInventoryOpen = this.game.inventoryData.some((item) => item.is_new);
		this.inventoryContainer = this.add.container(0, this.isInventoryOpen ? height : height + 100);
		this.isForceHide = false;
		this.isInventoryMoving = false;
		this.isItemsChengingInInventory = false;
		this.currentItemIndex = 0;
		addInventoryUi(this);
		addScrollablePanel(this);
		this.totalItemsCount = this.game.inventoryData.length;
	};

	highlightRacksPlaces = (value) => {
		this.racksPlaces.getChildren().forEach((item) => {
			item.setVisible(value);
		});
	};

	highlightMinerPlaces = (value, width) => {
		let places = this.minersPlaces.getChildren();
		if (value) {
			places = places.map((item) => item.setActive(item.cellWidth === width));
			places = places.filter((filterItem) => filterItem.cellWidth === width);
		}
		places.forEach((item) => {
			item.setVisible(value);
		});
	};

	coordinatesToPixels = (x, y, level, coordinatesType) => {
		switch (coordinatesType) {
			case "grid":
				return { x: x * config.rowWidth, y: y * config.colHeight + level * this.game.config.height };
			case "pixel":
			default:
				return { x, y: y + level * this.game.config.height };
		}
	};

	handleUpgradeRoom = () => {
		const { price, _id } = this.game.roomsConfig.skin_available;
		this.scene.run("UpgradeSkin", { balance: this.rltBalance, price, id: _id, refreshGame: this.refreshGame, changeRoom: this.changeRoom, wsReact: this.game.wsReact });
	};

	changeRoom = (level) => {
		if (this.currentLevel === level || !this.isSwitchRoomAvailable) {
			return false;
		}
		const { height } = this.game.config;
		this.changeRoomUIAction = true;
		this.cameras.main.pan(0, height * level + height / 2, 300, "Power2", false, (data) => this.endCameraAnimation(data, level));
		this.currentLevel = level;
		this.changeRoomAction = true;
	};

	endCameraAnimation = (data, level) => {
		if (data.panEffect.progress === 1) {
			const { isRoomActive, unlockRoomInfo } = this.rooms[`level_${level}`];
			this.changeRoomUIAction = false;
			if (!isRoomActive) {
				this.scene.run("BuyRoom", {
					...unlockRoomInfo,
					refreshGame: this.refreshGame,
					changeRoom: this.changeRoom,
					wsReact: this.game.wsReact,
					balance: this.rltBalance,
					reactHistoryObject: this.game.roomsConfig.reactHistoryObject,
				});
			}
		}
	};

	addRooms = () => {
		const openRooms = this.game.roomsConfig.rooms;
		const appearanceID = this.game.roomsConfig.appearance.id;
		this.roomLevelsConfig.forEach((room) => {
			const levelName = `level_${room.level}`;
			const { height } = this.textures.get(`${appearanceID}_${levelName}`).getSourceImage();
			const isRoomOpen = openRooms.find((item) => item.room_info.level === room.level);
			const roomBg = this.add.image(0, 0, `${appearanceID}_${levelName}`).setOrigin(0);
			this.rooms[levelName] = this.add.container(0, height * room.level);
			this.rooms[levelName].racksZone = room.racks_zone;
			this.rooms[levelName].isRoomActive = true;
			this.rooms[levelName].roomId = room.roomId;
			this.rooms[levelName].add(roomBg);
			if (!isRoomOpen) {
				const lockedRoom = this.game.roomsConfig.rooms_available.find((item) => item.level === room.level);
				this.rooms[levelName].unlockRoomInfo = {
					price: lockedRoom.price,
					id: lockedRoom._id,
					level: room.level,
				};
				this.rooms[levelName].isRoomActive = false;
			}
		});
	};

	generateEmptyGrid = (rows, cols, factor) => {
		const grid = [];
		for (let i = 0; i < rows * factor; i += 1) {
			grid[i] = new Array(cols).fill(0);
		}
		return grid;
	};

	addRacksHighlight = () => {
		const activeRoomKeys = Object.keys(this.rooms).filter((key) => this.rooms[key].isRoomActive);
		activeRoomKeys.forEach((key) => {
			const { racksGrid, racksContainer, roomConfig, racksZone } = this.rooms[key];
			for (let i = 3; i < racksGrid.length; i += 4) {
				for (let j = 0; j < racksGrid[0].length; j += 1) {
					if (j % 2 === 0 && i && !racksGrid[i][j]) {
						const coord = this.getCoordInRackZone(roomConfig, racksZone.row_shift, j / 2, (i + 1) / 4 - 1);
						racksGrid[i][j] = this.physics.add.sprite(coord.x, coord.y, "rackLight", 0).setOrigin(0, 1);
						racksGrid[i][j].setCollideWorldBounds(true).setVisible(false);
						racksGrid[i][j].cellWidth = 2;
						racksGrid[i][j].placement = {
							x: j,
							y: i,
							coord: {
								x: coord.x,
								y: coord.y,
							},
						};
						this.racksPlaces.add(racksGrid[i][j]);
						racksContainer.add(racksGrid[i][j]);
					}
				}
			}
		});
	};

	addMinerLightSprite = (x, y, rack, width) => {
		const spriteTexture = width === 1 ? "minerLight" : "minerLightTwoCell";
		const coord = this.getPositionInRack(x, y, rack, width === 2, "light");
		const sprite = this.physics.add.sprite(coord.x, coord.y, spriteTexture).setOrigin(0.5).setVisible(false);
		const coordOfMiner = this.getPositionInRack(x, y, rack, width === 2, "miner");
		sprite.cellWidth = width;
		sprite.placement = {
			rackId: rack.characteristics.rack_id,
			x,
			y,
			coord: {
				x: coordOfMiner.x,
				y: coordOfMiner.y,
			},
		};
		this.minersPlaces.add(sprite);
		rack.add(sprite);
		return sprite;
	};

	addMinersHighlight = (rackContainer) => {
		const racks = rackContainer ? [rackContainer] : this.getRacksById();
		racks.forEach((rack) => {
			for (let i = 0; i < rack.minersGrid.length; i += 1) {
				for (let j = 0; j < rack.minersGrid[i].length; j += 1) {
					const minerLight = {};
					if (!j && !rack.minersGrid[i][j]) {
						minerLight.oneCell = this.addMinerLightSprite(j, i, rack, 1);
					}
					if (j && !rack.minersGrid[i][j] && (!rack.minersGrid[i][j - 1].cellWidth || rack.minersGrid[i][j - 1].cellWidth !== 2)) {
						minerLight.oneCell = this.addMinerLightSprite(j, i, rack, 1);
					}
					if (!j && !rack.minersGrid[i][j] && !rack.minersGrid[i][j + 1]) {
						minerLight.twoCell = this.addMinerLightSprite(j, i, rack, 2);
					}
					rack.minersGrid[i][j] = Object.keys(minerLight).length ? minerLight : rack.minersGrid[i][j];
				}
			}
		});
	};

	getPositionInRack = (x, y, rack, isBig, type) => {
		const texture = this.textures.get(rack.characteristics.name).getSourceImage();
		const frameCount = this.textures.get(rack.characteristics.name).frameTotal - 1;
		let offsetY = type === "miner" ? 3 - texture.height : 12 - texture.height;
		const paddingBySides = 6;
		const workAreaX = texture.width / frameCount - paddingBySides * 2;
		const heightOfRackRow = 64;
		const middleFullWidth = workAreaX / 2;
		let oneCellPositionX = middleFullWidth / 2 + paddingBySides;
		if (!isBig && x) {
			oneCellPositionX = middleFullWidth + oneCellPositionX;
		}
		offsetY = y ? offsetY + heightOfRackRow * y : offsetY;
		return { x: isBig ? middleFullWidth + paddingBySides : oneCellPositionX, y: offsetY };
	};

	fillRoomGrid = (x, y, rackInfo, level, value) => {
		const { racksGrid } = this.rooms[`level_${level}`];
		const { height, width } = rackInfo;
		const yCoordInGrid = this.CELLS_IN_ROW - 1 + y * this.CELLS_IN_ROW;
		const xCoordInGrid = x > 0 ? x * 2 : x;
		for (let i = 0; i < height; i += 1) {
			for (let j = 0; j < width; j += 1) {
				const workY = +yCoordInGrid - i;
				const workX = +xCoordInGrid + j;
				racksGrid[workY][workX] = value;
			}
		}
	};

	checkOverlap = (pseudoImg, itemType, itemWidth) => {
		this.inventoryOverlapedItem = null;
		const childFrom = itemType === "miner" ? "minersPlaces" : "racksPlaces";
		let childSpriteKey = "rackLight";
		if (itemType === "miner") {
			childSpriteKey = itemWidth === 1 ? "minerLight" : "minerLightTwoCell";
		}
		const childTexture = this.textures.get(childSpriteKey);
		const frameCount = childTexture.frameTotal - 1;
		const childTextureWidth = childTexture.getSourceImage().width / frameCount / 2;
		this[childFrom].getChildren().forEach((item) => {
			item.setFrame(0);
		});
		const child = this.physics.overlapRect(pseudoImg.x - pseudoImg.displayWidth / 2, pseudoImg.y - pseudoImg.displayHeight / 2, pseudoImg.displayWidth, pseudoImg.displayHeight);
		const filteredChild = child.filter((item) => item.gameObject && item.gameObject.texture.key === childSpriteKey);
		if (filteredChild.length > 1) {
			let isItemLighting = false;
			filteredChild.forEach((item) => {
				if (Math.abs(pseudoImg.x - (item.x + childTextureWidth)) < 30 && !isItemLighting && item.gameObject.active) {
					item.gameObject.setFrame(1);
					isItemLighting = true;
					this.inventoryOverlapedItem = item.gameObject.placement;
				}
			});
		} else if (filteredChild.length && filteredChild[0].gameObject.active) {
			filteredChild[0].gameObject.setFrame(1);
			this.inventoryOverlapedItem = filteredChild[0].gameObject.placement;
		}
	};

	generatePseudoInventoryItem = (x, y, imageRealHeightAndWidth, imgNewCharacteristics, itemInfo) => {
		if (this.pseudoInventoriImg) {
			this.pseudoInventoriImg.destroy(true);
			this.highlightMinerPlaces(false);
			this.highlightRacksPlaces(false);
		}
		const heightForMove = this.getHeightForMoveToInventory();
		const pseudoImg = this.physics.add.sprite(x, y, itemInfo.texture);
		this.pseudoInventoriImg = pseudoImg;
		this.inventoryOverlapedItem = null;
		pseudoImg.setInteractive({ cursor: "pointer" });
		pseudoImg.scaled = false;
		pseudoImg.drag = this.plugins.get("rexDrag").add(pseudoImg);
		pseudoImg.on("pointerup", (pointer, pointerCoordX, pointerCoordY, event) => {
			event.stopPropagation();
		});
		pseudoImg.on("dragstart", () => {
			this.toggleGrabCursor(true);
			pseudoImg.setSize(imageRealHeightAndWidth.width, imageRealHeightAndWidth.height);
			pseudoImg.setDisplaySize(imageRealHeightAndWidth.width, imageRealHeightAndWidth.height);
			pseudoImg.scaled = true;
			if (itemInfo.type === "miner") {
				this.highlightMinerPlaces(true, itemInfo.width);
			} else {
				this.highlightRacksPlaces(true);
			}
		});
		pseudoImg.on("drag", () => {
			this.toggleGrabCursor(true);
			this.checkOverlap(pseudoImg, itemInfo.type, itemInfo.width);
		});
		pseudoImg.on("dragend", async () => {
			this.toggleGrabCursor(false);
			const maxTime = 300;
			if (itemInfo.type === "miner") {
				this.highlightMinerPlaces(false);
			} else {
				this.highlightRacksPlaces(false);
			}
			if (!this.inventoryOverlapedItem) {
				pseudoImg.drag.dragend();
				pseudoImg.off("drag");
				pseudoImg.off("dragstart");
				pseudoImg.off("dragend");
				pseudoImg.on("pointerup", (pointer, pseudoX, pseudoY, event) => {
					event.stopPropagation();
				});
				pseudoImg.on("pointerdown", (pointer, pseudoX, pseudoY, event) => {
					event.stopPropagation();
				});
				this.physics.moveTo(pseudoImg, pseudoImg.x, heightForMove, 2000);
				this.time.delayedCall(maxTime, () => pseudoImg.destroy());
			} else {
				const { x: originalX, y: originalY, rackId } = this.inventoryOverlapedItem;
				this.game.inventoryData = this.game.inventoryData.filter((inventoryItem) => inventoryItem.user_item_id !== itemInfo.id);
				if (this.isInventoryMoving || this.isForceHide) {
					this.time.delayedCall(1000, () => this.refreshScrollablePanel());
				} else {
					this.refreshScrollablePanel();
				}
				if (itemInfo.type === "miner") {
					const data = {
						itemType: "miner",
						type: itemInfo.miner_type,
						miner_id: itemInfo.texture,
						placement: { user_rack_id: rackId, x: originalX, y: originalY },
						width: itemInfo.width,
						level: itemInfo.level,
						power: itemInfo.power,
						_id: itemInfo.id,
					};
					const rackContainer = this.getRacksById(rackId);
					clearGridFromHighlight(this, originalX, originalY, rackContainer.minersGrid, "miner", itemInfo.width);
					this.addOneMiner(data);
					const moveMinerResponse = await moveMinerFromInventory(this, itemInfo.id, rackId, originalX, originalY);
					if (moveMinerResponse) {
						store.dispatch(actions.setIsFirstMiningInGame(true));
					}
				} else {
					const { racksGrid, roomConfig } = this.rooms[`level_${this.currentLevel}`];
					const placement = { x: this.inventoryOverlapedItem.x / 2, y: (this.inventoryOverlapedItem.y + 1) / 4 - 1 };
					const data = {
						rack_info: { width: itemInfo.width, height: itemInfo.height },
						_id: itemInfo.id,
						rack_id: itemInfo.texture,
						placement,
					};
					clearGridFromHighlight(this, originalX, originalY, racksGrid, "rack", itemInfo.width, itemInfo.height);
					const newRackContainer = this.addOneRack(data);
					this.setInteractiveRack(newRackContainer);
					this.addMinersHighlight(newRackContainer);
					postMoveRackFromInventory(this, roomConfig._id, itemInfo.id, placement.x, placement.y);
				}
				pseudoImg.removeAllListeners();
				pseudoImg.setActive(false).setVisible(false);
				this.pseudoInventoriImg = null;
			}
		});
		pseudoImg.setSize(imgNewCharacteristics.width, imgNewCharacteristics.height);
		pseudoImg.setDisplaySize(imgNewCharacteristics.width, imgNewCharacteristics.height);
		pseudoImg.drag.drag();
	};

	getHeightForMoveToInventory = () => {
		const { height } = this.game.config;
		return this.currentLevel ? height * (this.currentLevel + 1) : height;
	};

	refreshScrollablePanel = () => {
		if (!this.totalItemsCount && this.game.inventoryData.length) {
			this.table.remove(this.goToStore, true);
			this.table.resetGrid(this.game.inventoryData.length, 1, 1, 1, { column: 10, row: 10 });
		}
		this.currentItemIndex = 0;
		this.totalItemsCount = this.game.inventoryData.length;
		this.game.inventoryData = this.game.inventoryData.sort((a, b) => {
			if (a.item_type > b.item_type) {
				return 1;
			}
			if (a.item_type < b.item_type) {
				return -1;
			}
			return 0;
		});
		this.scrollablePanel.clear(true);
		this.inventoryContainer.remove(this.scrollablePanel);
		addScrollablePanel(this);
	};

	getCoordInRackZone = (roomConfig, shift, x, y) => {
		const largestRackParam = { width: 300, height: 240, frameCount: 2 };
		const paddingForRack = 10;
		const realCols = roomConfig.cols / 2;
		const workHeight = (largestRackParam.height + paddingForRack) * roomConfig.rows;
		const workWidth = (largestRackParam.width / largestRackParam.frameCount) * realCols;
		const col = workWidth / realCols;
		const row = workHeight / roomConfig.rows;
		const rowShift = -(roomConfig.rows - y - 1) * shift;
		return { x: x * col + rowShift * config.rowWidth, y: y * row };
	};

	addRacks = () => {
		const { racks } = this.game.roomsConfig;
		this.racksPlaces = this.physics.add.group();
		this.racksGroup = this.physics.add.group();
		let openRooms = this.roomLevelsConfig.filter((item) => this.game.roomsConfig.rooms.find((room) => item.level === room.room_info.level));
		openRooms = openRooms.sort((a, b) => a.level - b.level);
		// add racks containers in rooms
		openRooms.forEach((room) => {
			const currentRoomColsAndRows = this.game.roomsConfig.rooms.find((searchRoom) => searchRoom.room_info.level === room.level);
			const rackZoneCoordinates = this.coordinatesToPixels(room.racks_zone.x, room.racks_zone.y, room.level, "grid");
			this.rooms[`level_${room.level}`].racksGrid = this.generateEmptyGrid(currentRoomColsAndRows.room_info.rows, currentRoomColsAndRows.room_info.cols, this.CELLS_IN_ROW);
			this.rooms[`level_${room.level}`].racksContainer = this.add.container(rackZoneCoordinates.x, rackZoneCoordinates.y);
			this.rooms[`level_${room.level}`].roomConfig = currentRoomColsAndRows.room_info;
			this.rooms[`level_${room.level}`].roomConfig._id = currentRoomColsAndRows._id;
		});
		racks
			.filter((filterItem) => filterItem.placement.user_room_id)
			.forEach((item) => {
				this.addOneRack(item);
			});
	};

	addOneRack = (item) => {
		const openRooms = this.roomLevelsConfig.filter((filterItem) => this.game.roomsConfig.rooms.find((room) => filterItem.level === room.room_info.level));
		let levelConfigByRoomId = this.game.roomsConfig.rooms.find((roomItem) => roomItem.room_info.level === this.currentLevel);
		if (item.placement.user_room_id) {
			levelConfigByRoomId = this.game.roomsConfig.rooms.find((roomItem) => roomItem._id === item.placement.user_room_id);
		}
		const currentRackRoom = openRooms.find((openRoom) => openRoom.level === levelConfigByRoomId.room_info.level);
		const coord = this.getCoordInRackZone(levelConfigByRoomId.room_info, currentRackRoom.racks_zone.row_shift, item.placement.x, item.placement.y);
		const rackContainer = this.add.container(coord.x, coord.y);
		rackContainer.characteristics = {
			rack_id: item._id,
			name: item.rack_id,
			shelfQuantity: item.rack_info.height,
			capacity: item.rack_info.height * item.rack_info.width,
		};
		rackContainer.minersGrid = this.generateEmptyGrid(item.rack_info.height, item.rack_info.width, 1);
		const rack = this.add.sprite(0, 0, item.rack_id).setOrigin(0, 1);
		rackContainer.rackSprite = rack;
		rack.itemInfo = item;
		rack.itemInfo.level = currentRackRoom.level;
		this.racksGroup.add(rack);
		rackContainer.add(rack);
		rackContainer.sendToBack(rack);
		// add rack container to racks container
		this.rooms[`level_${currentRackRoom.level}`].racksContainer.add(rackContainer);
		this.fillRoomGrid(item.placement.x, item.placement.y, item.rack_info, levelConfigByRoomId.room_info.level, 1);
		if (!item.placement.user_room_id) {
			return rackContainer;
		}
	};

	setInteractiveRack = (rackContainer) => {
		const racks = rackContainer ? [rackContainer] : this.getRacksById();
		racks.forEach((rack) => {
			rack.rackSprite.setInteractive({ cursor: "pointer" });
			rack.rackSprite.on("pointerdown", (pointer) => {
				const { worldX, worldY } = pointer;
				addPopupMenu(this, rack.characteristics.rack_id, worldX, worldY, "rack", rack.rackSprite);
				this.toggleActiveItem(rack.rackSprite, 1);
			});
		});
	};

	toggleActiveItem = (item, frame) => {
		if (this.activeItem) {
			this.activeItem.setFrame(0);
		}
		if (!item && this.activeItem) {
			this.activeItem.setFrame(0);
			this.activeItem.anims.resume();
			this.activeItem = null;
			return null;
		}
		if (item) {
			this.activeItem = item;
			item.anims.pause();
			if (!this.broken) {
				item.setFrame(frame);
			}
		}
	};

	getRacksById = (id) => {
		let racks = [];
		const activeRoomKeys = Object.keys(this.rooms).filter((key) => this.rooms[key].isRoomActive);
		activeRoomKeys.forEach((roomKey) => {
			const { racksContainer } = this.rooms[roomKey];
			racks = [...racks, ...racksContainer.list.filter((item) => item.type === "Container")];
		});
		return id ? racks.find((item) => item.characteristics.rack_id === id) : racks;
	};

	addMiners = () => {
		const { miners } = this.game.roomsConfig;
		this.minersGroup = this.physics.add.group();
		miners.forEach((miner) => {
			this.addOneMiner(miner);
		});
	};

	addOneMiner = (miner) => {
		const isTwoCell = miner.width > 1;
		const rackContainer = this.getRacksById(miner.placement.user_rack_id);
		const coord = this.getPositionInRack(miner.placement.x, miner.placement.y, rackContainer, isTwoCell, "miner");
		const minerContainer = this.add.container(coord.x, coord.y);
		const minerSprite = this.add.sprite(0, 0, miner.miner_id).setOrigin(0.5);
		minerSprite.setName("miner");
		minerContainer.parentRack = rackContainer;
		minerContainer.placement = miner.placement;
		minerContainer.cellWidth = miner.width;
		minerContainer.itemId = miner.miner_id;
		minerContainer.itemInfo = miner;
		minerContainer.texture = minerSprite.texture;
		minerContainer.itemInfo.itemType = "miner";
		minerContainer.power = miner.power;
		if (this.isUserFromSession) {
			minerSprite.setInteractive({ cursor: "pointer" });
			minerSprite.on("pointerdown", (pointer, minerX, minerY, event) => {
				this.destroyMinerBetweenRacks();
				event.stopPropagation();
			});
			minerSprite.on("pointerup", (pointer, minerX, minerY, event) => {
				const { worldX, worldY } = pointer;
				addPopupMenu(this, miner._id, worldX, worldY, "miner");
				this.toggleActiveItem(minerSprite, 4);
				event.stopPropagation();
			});
		}
		minerContainer.add(minerSprite);
		this.minersGroup.add(minerContainer);
		if (miner.level && miner.type === MINERS_TYPES.MERGE) {
			const levelXShift = isTwoCell ? -38 : -23;
			const levelYShift = isTwoCell ? -10 : -2;

			const minerLevel = this.add.sprite(levelXShift, levelYShift, `level_${miner.level + 1}`, 1).setOrigin(isTwoCell ? 1 : 0.5, 1);
			minerContainer.add(minerLevel);
			minerContainer.bringToTop(minerLevel);
		}
		if (miner.level && miner.type === MINERS_TYPES.OLD_MERGE) {
			let levelXShift = 4;
			if (!isTwoCell) {
				levelXShift = minerSprite.displayWidth > 60 ? -2 : 2;
			}
			const minerLevel = this.add.sprite(levelXShift, -10, "miner_level", miner.level - 1).setOrigin(isTwoCell ? 1 : 0.5, 1);
			minerContainer.add(minerLevel);
			minerContainer.bringToTop(minerLevel);
		}

		rackContainer.minersGrid[miner.placement.y][miner.placement.x] = minerContainer;
		if (miner.width === 2) {
			rackContainer.minersGrid[miner.placement.y][miner.placement.x + 1] = 1;
		}
		if (!this.broken) {
			// -1 cose miner animation have lightbox for miner
			const frameCount = this.textures.get(miner.miner_id).frameTotal - 1;
			this.anims.create({
				key: `miner_${miner.miner_id}`,
				frames: this.anims.generateFrameNames(miner.miner_id, { end: 3 }),
				repeat: -1,
				frameRate: 5,
			});
			minerSprite.play(`miner_${miner.miner_id}`, true, Phaser3.Math.Between(0, frameCount));
		}
		rackContainer.add(minerContainer);
		rackContainer.bringToTop(minerContainer);
		if (this.isUserFromSession) {
			minerSprite.input.hitArea.setTo(0, 0, minerSprite.displayWidth, minerSprite.displayHeight);
		}
	};

	destroyMinerBetweenRacks = () => {
		if (this.moveMinerBetweenRacks) {
			const { backlight, pseudoImg, currentMiner } = this.moveMinerBetweenRacks;
			if (backlight) {
				backlight.destroy(true);
			}
			if (pseudoImg) {
				pseudoImg.destroy(true);
			}
			if (currentMiner) {
				currentMiner.setAlpha(1);
			}
			this.moveMinerBetweenRacks = null;
			this.highlightMinerPlaces(false);
		}
	};

	getImgNewCharacteristics = (img) => {
		const { width, height } = img;
		const ratio = Math.min(MAX_INV_ITEM_WIDTH / width, MAX_INV_ITEM_HEIGHT / height);
		return { width: width * ratio, height: height * ratio };
	};

	switchButtonState = (button, state = "disable") => {
		if (state === "disable") {
			this.inventory[button].setTexture("inventoryButtonDisabled");
			this.inventory[button].disableInteractive();
		} else {
			this.inventory[button].setTexture("inventoryButtonPressed");
			this.inventory[button].setInteractive({ cursor: "pointer" });
		}
		if (button === "rightButton") {
			this.inventory[button].scaleX = -1;
		}
	};

	createSignalAndController = (id) => {
		if (this.controllers[id]) {
			this.controllers[id].abort();
		}
		this.controllers[id] = new AbortController();
		this.signals[id] = this.controllers[id].signal;
	};

	refreshGame = async (clearTextures = false) => {
		this.createSignalAndController("refreshGame");
		const scenes = ["BuyRoom", "UpgradeSkin", "ErrorScreen"];
		const { userId } = this.game.roomsConfig;
		try {
			const json = await fetchWithToken(`/api/game/room-config/${userId}`, {
				method: "GET",
				signal: this.signals.refreshGame,
			});
			if (!json.success) {
				return false;
			}
			const { data } = json;
			if (!data.is_user_from_session) {
				data.appearance.room_levels_config = data.appearance.room_levels_config.filter((item) => data.rooms.find((room) => room.room_info.level === item.level));
			}
			data.appearance.room_levels_config = data.appearance.room_levels_config.sort((a, b) => a.level - b.level);
			this.game.roomsConfig = { ...this.game.roomsConfig, ...data };
			scenes.forEach((scene) => this.scene.stop(scene));
			// Clean old textures cache
			if (clearTextures && this.game.roomsConfig.elementsNames && this.game.roomsConfig.elementsNames.length) {
				this.game.roomsConfig.elementsNames.forEach((element) => {
					this.anims.remove(element);
					this.textures.remove(element);
				});
			}
			this.scene.start("Preload", { isRefresh: true });
		} catch (e) {
			console.error(e);
		}
	};

	inventoryUpdate = () => {
		if (!this.isUserFromSession) {
			return false;
		}
		const { height } = this.game.config;
		const { rightButton } = this.inventory;
		let inventoryAnimationSpeed = 4;
		const inventoryOpenPositionY = !this.currentLevel ? height : height * (this.currentLevel + 1);
		const inventoryClosePositionY = !this.currentLevel ? height + 100 : height * (this.currentLevel + 1) + 100;
		const { panel, panelContainer } = this.originInventoryY;
		const offsetYPanel = this.isInventoryOpen ? panel.open : panel.close;
		const offsetYContainer = this.isInventoryOpen ? panelContainer.open : panelContainer.close;
		if (this.changeRoomUIAction) {
			this.inventoryContainer.setPosition(0, inventoryOpenPositionY + offsetYContainer);
			this.scrollablePanel.setPosition(560, inventoryOpenPositionY + offsetYPanel);
		}
		// animate show and hide panel
		if (this.isInventoryMoving && this.isInventoryOpen && this.inventoryContainer.y > inventoryOpenPositionY) {
			this.inventoryContainer.y -= inventoryAnimationSpeed;
			this.scrollablePanel.y -= inventoryAnimationSpeed;
		} else if (this.isInventoryMoving && this.isInventoryOpen && this.inventoryContainer.y <= inventoryOpenPositionY) {
			this.isInventoryMoving = false;
		}
		if (this.isInventoryMoving && !this.isInventoryOpen && this.inventoryContainer.y < inventoryClosePositionY) {
			this.inventoryContainer.y += inventoryAnimationSpeed;
			this.scrollablePanel.y += inventoryAnimationSpeed;
		} else if (this.isInventoryMoving && !this.isInventoryOpen && this.inventoryContainer.y >= inventoryClosePositionY) {
			this.isInventoryMoving = false;
		}
		if (this.isForceHide && !this.isInventoryMoving && this.inventoryContainer.y < inventoryClosePositionY) {
			inventoryAnimationSpeed = 12;
			this.inventoryContainer.y += inventoryAnimationSpeed;
			this.scrollablePanel.y += inventoryAnimationSpeed;
		} else if (this.isForceHide && this.inventoryContainer.y >= inventoryClosePositionY) {
			this.isForceHide = false;
			this.isInventoryOpen = false;
			this.inventory.itemButton.setFrame(this.isInventoryOpen ? 1 : 0);
		}
		// handle left and right buttons
		if (this.currentItemIndex + MAX_ITEMS_IN_ROW >= this.totalItemsCount) {
			this.switchButtonState("rightButton");
		} else if (rightButton.texture.key !== "inventoryButtonPressed") {
			this.switchButtonState("rightButton", "enable");
		}
		if (this.isItemsChengingInInventory && !this.currentItemIndex) {
			this.switchButtonState("leftButton");
		} else if (this.isItemsChengingInInventory && this.currentItemIndex) {
			this.switchButtonState("leftButton", "enable");
		}
		// correct inventory position
		if (!this.isInventoryMoving && !this.isForceHide && !this.isInventoryOpen && this.inventoryContainer.y > inventoryClosePositionY) {
			this.inventoryContainer.setPosition(0, inventoryClosePositionY + offsetYContainer);
			this.scrollablePanel.setPosition(560, inventoryClosePositionY + offsetYPanel);
		}
	};

	changeRoomUpdate = () => {
		// update changeRoomsUI after change room
		if (this.changeRoomAction) {
			Object.keys(this.changeRoomsUI.buttons).forEach((key) => {
				const levelName = `level_${this.currentLevel}`;
				if (key === levelName) {
					this.changeRoomsUI.buttons[key].setFrame(2);
					this.changeRoomsUI.buttons[key].on("pointerover", () => this.changeRoomsUI.buttons[key].setFrame(2));
					this.changeRoomsUI.buttons[key].on("pointerout", () => this.changeRoomsUI.buttons[key].setFrame(2));
				}
				if (key !== levelName) {
					this.changeRoomsUI.buttons[key].setFrame(0);
					this.changeRoomsUI.buttons[key].on("pointerover", () => this.changeRoomsUI.buttons[key].setFrame(1));
					this.changeRoomsUI.buttons[key].on("pointerout", () => this.changeRoomsUI.buttons[key].setFrame(0));
				}
			});
			this.changeRoomAction = false;
		}
		if (this.changeRoomUIAction) {
			this.changeRoomsUIContainer.setPosition(0, this.cameras.main.scrollY);
		}
	};

	toggleGrabCursor = (value) => {
		this.game.canvas.style.cursor = value ? "grab" : "default";
	};

	checkNewItemsInInventory = () => {
		if (!this.table) {
			return null;
		}
		if (!this.isInventoryOpen && this.game.inventoryData.some((item) => item.is_new)) {
			this.game.inventoryData = this.game.inventoryData.map((item) => ({ ...item, is_new: false }));
			this.game.setJustBoughtItem("");
			this.table.getElement("items").forEach((label) => {
				const sprite = label.children[0];
				if (sprite.isNew && sprite.itemType === "miner") {
					this.anims.create({
						key: `miner_inventory_${sprite.texture.key}`,
						frames: this.anims.generateFrameNames(sprite.texture.key, { end: 3 }),
						repeat: -1,
						frameRate: 5,
					});
					sprite.play(`miner_inventory_${sprite.texture.key}`);
				} else {
					sprite.setFrame(0);
				}
			});
		}
	};

	update() {
		this.changeRoomUpdate();
		this.inventoryUpdate();
		this.checkNewItemsInInventory();
	}

	onDestroy = () => {
		if (this.controller) {
			this.controller.abort();
		}
		this.plugins.removeScenePlugin("rexUI");
	};
}
