import { Scene } from "phaser";
import getCrownByRatingPosition from "../helpers/getCrownByRatingPosition";
import { RARITY_DATA_BY_LEVEL } from "../../../../constants/Storage";
import RACKS_LIST from "../config/racks_list";

const VERSION = "?v=1.3.6";

export default class Preload extends Scene {
	constructor() {
		super({ key: "Preload" });
	}

	init(data) {
		this.isRefresh = data.isRefresh || false;
	}

	preload() {
		this.loadingTexts = [
			{ text: "Сonnecting to the server...", min: 0, max: 10 },
			{ text: "Сonnecting to nodes...", min: 11, max: 20 },
			{ text: "Loading physics...", min: 21, max: 30 },
			{ text: "Loading executable files...", min: 31, max: 40 },
			{ text: "Loading sprites...", min: 41, max: 50 },
			{ text: "Loading user data...", min: 51, max: 60 },
			{ text: "Loading UI...", min: 61, max: 70 },
			{ text: "Loading textures...", min: 71, max: 80 },
			{ text: "Verify files", min: 81, max: 99 },
			{ text: "Loading is complete", min: 100, max: 100 },
		];
		const { width, height } = this.cameras.main;
		this.progressBox = this.add.graphics();
		this.cameras.main.setBackgroundColor("#2f3045");
		this.progressBox.fillStyle(0x181928, 1);
		this.progressBox.fillRect(453, height / 2 - 20, 310, 51);
		this.loaderImage = this.add.tileSprite(459, height / 2 - 15, 0, 42, "loadBlock").setOrigin(0);
		this.loadingText = this.make.text({
			x: width / 2 - 10,
			y: height / 2 - 50,
			text: "Loading...",
			style: { font: '32px "Roboto"', fill: "#03e1e4", fontWeight: 700 },
		});
		this.loadingText.setOrigin(0.5, 0.5);
		this.percentText = this.make.text({
			x: width / 2 + 90,
			y: height / 2 - 50,
			text: "0%",
			style: { font: '32px "Roboto"', fill: "#03e1e4", fontWeight: 700 },
		});
		this.percentText.setOrigin(0.5, 0.5);

		this.assetText = this.make.text({
			x: 613,
			y: height / 2 + 60,
			text: "",
			style: { font: '20px "Roboto"', fill: "#fff" },
		});
		this.assetText.setOrigin(0.5, 0.5);

		this.load.on("progress", (value) => {
			this.progressEventHandler(value);
		});
		this.load.on("complete", () => {
			const texts = ["progressBox", "loadingText", "percentText", "assetText"];
			texts.forEach((item) => {
				if (this[item]) {
					this[item].destroy();
				}
			});
		});

		const {
			userId,
			avatarVersion,
			trophies,
			appearance,
			racks,
			miners,
			inventory,
			users_hat: usersHat,
			rooms_available: roomsAvailable,
			skin_available: skinAvailable,
			token_rating_position: ratingPosition,
			miners_broken: broken,
		} = this.game.roomsConfig;

		// Loader
		this.load.spritesheet("loader", `/static/img/game/hamster_loader.png${VERSION}`, { frameWidth: 126, frameHeight: 126 });
		// Racks
		const userRacksUniqIDs = new Set();
		racks.forEach(({ rack_id: rackID }) => userRacksUniqIDs.add(rackID.toString()));
		inventory.forEach(({ item_type: itemType, item_id: itemID }) => {
			if (itemType === "rack") {
				userRacksUniqIDs.add(itemID.toString());
			}
		});
		const userRacksIDs = [...userRacksUniqIDs];
		userRacksIDs.forEach((id) => {
			this.load.spritesheet(id, `${this.game.staticUrl}/static/img/game/room/rack/${id}.png${VERSION}`, RACKS_LIST[id]);
		});
		// Miners
		const userMinersUniqIDs = new Set();
		miners.forEach(({ miner_id: minerID }) => userMinersUniqIDs.add(minerID.toString()));
		inventory.forEach(({ item_type: itemType, item_id: itemID }) => {
			if (itemType === "miner") {
				userMinersUniqIDs.add(itemID.toString());
			}
		});
		const uniqueFullMiners = Array.from(userMinersUniqIDs).map((id) => {
			let currentMiner = miners.find((item) => item.miner_id.toString() === id);
			if (!currentMiner) {
				currentMiner = inventory.find((item) => item.miner_id?.toString() === id);
			}
			return {
				id: currentMiner.miner_id.toString(),
				filename: currentMiner.filename,
				frameSize: { frameWidth: currentMiner.frames_data.frame_width, frameHeight: currentMiner.frames_data.frame_height },
			};
		});
		if (broken) {
			uniqueFullMiners.forEach((item) => {
				this.load.image(item.id, `${this.game.staticUrl}/static/img/game/room/miners_static/${item.filename}.png${VERSION}`);
			});
		} else {
			uniqueFullMiners.forEach((item) => {
				this.load.spritesheet(item.id, `${this.game.staticUrl}/static/img/game/room/miners/${item.filename}.png${VERSION}`, item.frameSize);
			});
		}
		this.load.spritesheet("miner_level", `/static/img/game/miner_level_stars.png${VERSION}`, { frameWidth: 62, frameHeight: 15 });
		Object.values(RARITY_DATA_BY_LEVEL).forEach(({ arabic, icon }) => {
			this.load.spritesheet(`level_${arabic}`, `/static/img${icon}`, { frameWidth: 22, frameHeight: 16 });
		});
		// ROOMS
		const ELEMENTS_TYPES = {
			container: "image",
			image: "image",
			sprite: "spritesheet",
		};
		this.game.roomsConfig.elementsNames = [];
		// skins (appearances)
		appearance.room_levels_config.forEach((room) => {
			this.load.image(`${appearance.id}_level_${room.level}`, `${this.game.staticUrl}/static/img/game/room/appearances/${appearance.id}/level_${room.level}.png${VERSION}`);
			// elements
			if (room.elements && room.elements.length) {
				room.elements.forEach((element) => {
					this.game.roomsConfig.elementsNames.push(element.name);
					this.load[ELEMENTS_TYPES[element.type]](
						element.name,
						`${this.game.staticUrl}/static/img/game/room/items/${appearance.id}/${element.name}.png${VERSION}`,
						element.type === "sprite" ? { frameWidth: element.element_width, frameHeight: element.element_height } : ""
					);
				});
			}
		});
		// basic elements
		appearance.basic_elements.forEach((element) => {
			this.game.roomsConfig.elementsNames.push(element.name);
			this.load[ELEMENTS_TYPES[element.type]](
				element.name,
				`${this.game.staticUrl}/static/img/game/room/items/${appearance.id}/${element.name}.png${VERSION}`,
				element.type === "sprite" ? { frameWidth: element.element_width, frameHeight: element.element_height } : ""
			);
		});
		// computers
		this.load.spritesheet("computer_10000", `${this.game.staticUrl}/static/img/game/room/computers/computer_10000.png${VERSION}`, { frameWidth: 208, frameHeight: 206 });
		this.load.spritesheet("computer_10001", `${this.game.staticUrl}/static/img/game/room/computers/computer_10001.png${VERSION}`, { frameWidth: 216, frameHeight: 200 });
		this.load.spritesheet("computer_10002", `${this.game.staticUrl}/static/img/game/room/computers/computer_10002.png${VERSION}`, { frameWidth: 226, frameHeight: 246 });
		this.load.spritesheet("computer_10003", `${this.game.staticUrl}/static/img/game/room/computers/computer_10003.png${VERSION}`, { frameWidth: 238, frameHeight: 238 });
		// change rooms buttons
		this.load.image("button_change_head", `/static/img/game/ui/change-room/rooms_head.png${VERSION}`);
		this.load.image("button_change_connector", `/static/img/game/ui/change-room/connector.png${VERSION}`);
		this.load.spritesheet("button_open", `/static/img/game/ui/change-room/button_open.png${VERSION}`, { frameWidth: 48, frameHeight: 48 });
		this.load.spritesheet("button_locked", `/static/img/game/ui/change-room/button_locked.png${VERSION}`, { frameWidth: 48, frameHeight: 48 });
		this.load.image("upgrade_head", `/static/img/game/ui/change-room/upgrade.png${VERSION}`);
		this.load.image("upgrade_button_top", `/static/img/game/ui/change-room/upgrade_button_top.png${VERSION}`);
		this.load.image("close_button", `/static/img/game/ui/close_button.png${VERSION}`);
		// update room UI
		this.load.image("update_icon", `/static/img/game/ui/unlock-room/update/update_icon.png${VERSION}`);
		this.load.image("upgrade_button_screen", `/static/img/game/ui/unlock-room/update/upgrade_button.png${VERSION}`);
		this.load.image("paper_effect", `/static/img/game/ui/unlock-room/update/paper_effect.png${VERSION}`);
		this.load.image("button_apartment", `/static/img/game/ui/unlock-room/update/button_apartment.png${VERSION}`);
		// unlock room
		this.load.image("no_button", `/static/img/game/ui/unlock-room/no_button.png${VERSION}`);
		this.load.image("yes_button", `/static/img/game/ui/unlock-room/yes_button.png${VERSION}`);
		if (roomsAvailable.length || Object.keys(skinAvailable).length) {
			this.load.image("cancel_button", `/static/img/game/ui/unlock-room/cancel_button.png${VERSION}`);
			this.load.image("unlock_button", `/static/img/game/ui/unlock-room/unlock_button.png${VERSION}`);
			this.load.image("to_the_store_button", `/static/img/game/ui/unlock-room/to_the_store_button.png${VERSION}`);
			this.load.image("continue_button", `/static/img/game/ui/unlock-room/continue_button.png${VERSION}`);
			this.load.image("error_wallet", `/static/img/game/ui/unlock-room/error_wallet.png${VERSION}`);
			this.load.image("go_to_wallet", `/static/img/game/ui/unlock-room/go_to_wallet.png${VERSION}`);
			this.load.image("error_icon", `/static/img/game/ui/unlock-room/error_icon.png${VERSION}`);
			this.load.image("ok_button", `/static/img/game/ui/unlock-room/ok_button.png${VERSION}`);
			this.load.spritesheet("lock", `/static/img/game/ui/unlock-room/lock.png${VERSION}`, { frameWidth: 320, frameHeight: 160 });
			this.load.spritesheet("fireworks", `/static/img/game/ui/unlock-room/fireworks.png${VERSION}`, { frameWidth: 640, frameHeight: 320 });
		}
		// Crowns
		if (ratingPosition) {
			const crownImage = getCrownByRatingPosition(ratingPosition);
			this.load.image(crownImage, `${this.game.staticUrl}/static/img/game/room/crowns/${crownImage}.png${VERSION}`);
		}
		// Trophies
		if (trophies && trophies.length) {
			trophies.forEach((item) => {
				this.load.image(item, `${this.game.staticUrl}/static/img/game/room/trophies/${item}.png${VERSION}`);
			});
		}
		// Hat
		if (usersHat) {
			this.load.image("usersHat", `${this.game.staticUrl}/static/img/game/room/hats/${usersHat.id}.png${VERSION}`);
		}
		// Inventory
		this.load.image("inventoryButtonPressed", `/static/img/game/inventory/button_pressed.png${VERSION}`);
		this.load.image("inventoryButtonDisabled", `/static/img/game/inventory/button_disabled.png${VERSION}`);
		this.load.image("inventoryItemPanel", `/static/img/game/inventory/item_panel.png${VERSION}`);
		this.load.image("inventoryHeadButton", `/static/img/game/inventory/inventory_button.png${VERSION}`);
		this.load.image("moveToItemsIcon", `/static/img/game/inventory/move_to_items.png${VERSION}`);
		this.load.image("sellIcon", `/static/img/game/inventory/sell_icon.png${VERSION}`);
		this.load.image("infoIcon", `/static/img/game/inventory/info_icon.png${VERSION}`);
		this.load.image("closeIcon", `/static/img/icon/close-light.svg${VERSION}`);
		this.load.image("demountIcon", `/static/img/game/inventory/demont.png${VERSION}`);
		this.load.image("transposeIcon", `/static/img/game/inventory/transpose.png${VERSION}`);
		this.load.image("goToStore", `/static/img/game/inventory/go_to_store.png${VERSION}`);
		this.load.image("inventoryInsertAll", `/static/img/game/inventory/insert_all.png${VERSION}`);
		this.load.image("confirm_icon", `/static/img/game/ui/confirm_icon.png${VERSION}`);
		this.load.spritesheet("transpose", `/static/img/game/inventory/arrow_transpose.png${VERSION}`, { frameWidth: 94, frameHeight: 76 });
		this.load.spritesheet("minerLight", `/static/img/game/inventory/miner_light.png${VERSION}`, { frameWidth: 56, frameHeight: 36 });
		this.load.spritesheet("minerLightTwoCell", `/static/img/game/inventory/miner_light_two_cell.png${VERSION}`, { frameWidth: 122, frameHeight: 36 });
		this.load.spritesheet("rackLight", `/static/img/game/inventory/rack_light.png${VERSION}`, { frameWidth: 154, frameHeight: 42 });
		this.load.spritesheet("inventoryItemButton", `/static/img/game/inventory/item_button.png${VERSION}`, { frameWidth: 38, frameHeight: 42 });
		if (userId) {
			this.load.image("avatar", `${process.env.AVATARS_STATIC_URL}/static/avatars/thumbnails/60/${userId}.png?v=${avatarVersion}`);
		}
	}

	progressEventHandler = (value) => {
		const intValue = parseInt(value * 100, 10);
		if (intValue < 1) {
			return false;
		}
		this.percentText.setText(`${intValue}%`);
		this.loaderImage.setSize(300 * value || 30, 42);
		const currentText = this.loadingTexts.find((item) => intValue >= item.min && intValue <= item.max);
		this.assetText.setText(currentText.text);
	};

	create() {
		this.load.off("progress", this.progressEventHandler);
		this.scene.start("Start");
	}
}
