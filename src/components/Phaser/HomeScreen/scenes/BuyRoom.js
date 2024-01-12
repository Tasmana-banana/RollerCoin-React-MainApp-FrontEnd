import Phaser3, { Scene } from "phaser";
import config from "../config/config";
import fetchWithToken from "../../../../services/fetchWithToken";
import { addConfirmationText, addNotEnoughText, addCongratsText } from "../components/buyAndUpgradeRoomTexts";
import currenciesDecimalAdjust from "../helpers/currenciesDecimalAdjust";

export default class BuyRoom extends Scene {
	constructor() {
		super({ key: "BuyRoom" });
	}

	init(data) {
		this.roomPrice = data.price;
		this.currentLevel = data.level || 0;
		this.changeRoom = data.changeRoom;
		this.wsReact = data.wsReact;
		this.roomId = data.id;
		this.balance = data.balance;
		this.reactHistoryObject = data.reactHistoryObject;
		this.refreshGame = data.refreshGame;
	}

	create() {
		const { width, height } = this.game.config;
		const marginTop = 170;
		const centerX = width / 2;
		const adjustedPrice = currenciesDecimalAdjust(this.game.roomsConfig.rollerCurrencies, this.roomPrice, "rlt");
		this.addAnimations();
		const graphics = this.add.graphics();
		graphics.fillStyle(0x000000, 0.4);
		graphics.fillRect(0, 0, width, height);
		graphics.setInteractive(new Phaser3.Geom.Rectangle(0, 0, width, height), Phaser3.Geom.Rectangle.Contains);
		graphics.on("pointerdown", (pointer, x, y, event) => {
			event.stopPropagation();
		});
		this.buyRoomContainer = this.add.container(centerX, 0);
		this.buyRoomLock = this.add
			.sprite(centerX, marginTop, "lock")
			.setScale(2)
			.setDepth(1);
		this.fireworks = this.add.sprite(centerX, this.buyRoomLock.y, "fireworks").setVisible(false);
		const lockedText = this.add.text(0, this.buyRoomLock.y + 200, "Room is locked", config.defaultTitleFont).setOrigin(0.5);
		const moreSpace = this.add.text(0, lockedText.y + 55, "If you want more space for your miners unlock this room", config.defaultFont).setOrigin(0.5);
		const rlt = this.add.text(40, moreSpace.y + 50, `${adjustedPrice} RLT`, config.defaultPriceFont).setOrigin(0.5);
		const price = this.add.text(-50, moreSpace.y + 50, "Price:", config.defaultBoldFont).setOrigin(0.5);
		const unlockButton = this.add.image(0, price.y + 80, "unlock_button").setInteractive({ cursor: "pointer" });
		unlockButton.on("pointerup", () => {
			this.setVisibleContainer("confirmationContainer");
		});
		const cancelButton = this.add.image(0, unlockButton.y + 80, "cancel_button").setInteractive({ cursor: "pointer" });
		cancelButton.on("pointerup", () => {
			this.scene.stop();
			this.changeRoom(0);
		});
		this.buyRoomContainer.add([unlockButton, cancelButton, lockedText, moreSpace, rlt, price]);
		addConfirmationText(this, () => this.setVisibleContainer("buyRoomContainer"), this.buyRoom, this.roomPrice);
		addNotEnoughText(this, this.roomPrice, () => {
			this.changeRoom(0);
			this.scene.stop();
		});
		addCongratsText(this, () => {
			this.refreshGame();
		});
		if (this.balance < this.roomPrice) {
			this.setVisibleContainer("notEnoughContainer");
		}
	}

	addAnimations = () => {
		this.anims.create({
			key: "fireworks",
			frameRate: 12,
			repeat: -1,
			frames: this.anims.generateFrameNames("fireworks"),
		});
		this.anims.create({
			key: "lock",
			frameRate: 10,
			repeat: 0,
			frames: this.anims.generateFrameNames("lock"),
		});
	};

	setVisibleContainer = (visibleContainer) => {
		const containers = [
			{ name: "confirmationContainer", isLockVisible: true },
			{ name: "buyRoomContainer", isLockVisible: true },
			{ name: "notEnoughContainer", isLockVisible: false },
			{ name: "congratsContainer", isLockVisible: true },
		];
		const lockStatus = containers.find(({ name }) => name === visibleContainer);
		containers.forEach(({ name }) => {
			this[name].setVisible(name === visibleContainer);
		});
		this.buyRoomLock.setVisible(lockStatus.isLockVisible);
	};

	createSignalAndController = () => {
		if (this.controller) {
			this.controller.abort();
		}
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	};

	buyRoom = async () => {
		this.createSignalAndController();
		const json = await fetchWithToken(`/api/game/buy-room`, {
			method: "POST",
			body: JSON.stringify({ room_id: this.roomId }),
			signal: this.signal,
		});
		if (!json.success) {
			// render error step
			this.scene.stop();
			this.scene.run("ErrorScreen");
		}
		this.refreshBalance();
		this.setVisibleContainer("congratsContainer");
		this.buyRoomLock.play("lock");
		this.buyRoomLock.once("animationcomplete", () => {
			this.fireworks.setVisible(true).play("fireworks");
		});
	};

	refreshBalance = () => {
		this.wsReact.send(
			JSON.stringify({
				cmd: "balance_request",
			})
		);
	};
}
