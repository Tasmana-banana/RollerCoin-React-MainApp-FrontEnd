import Phaser3, { Scene } from "phaser";
import config from "../config/config";
import { addConfirmationText, addNotEnoughText, addCongratsText } from "../components/buyAndUpgradeRoomTexts";
import currenciesDecimalAdjust from "../helpers/currenciesDecimalAdjust";
import fetchWithToken from "../../../../services/fetchWithToken";

export default class UpgradeSkin extends Scene {
	constructor() {
		super({ key: "UpgradeSkin" });
	}

	init(data) {
		this.price = data.price;
		this.changeRoom = data.changeRoom;
		this.wsReact = data.wsReact;
		this.balance = data.balance;
		this.reactHistoryObject = data.reactHistoryObject;
		this.refreshGame = data.refreshGame;
		this.skinId = data.id;
	}

	create() {
		const { width, height } = this.game.config;
		const centerX = width / 2;
		const adjustedPrice = currenciesDecimalAdjust(this.game.roomsConfig.rollerCurrencies, this.price, "rlt");
		const graphics = this.add.graphics();
		graphics.fillStyle(0x000000, 0.4);
		graphics.fillRect(0, 0, width, height);
		graphics.setInteractive(new Phaser3.Geom.Rectangle(0, 0, width, height), Phaser3.Geom.Rectangle.Contains);
		graphics.on("pointerdown", (pointer, x, y, event) => {
			event.stopPropagation();
		});
		this.paperEffect = this.add
			.image(0, 0, "paper_effect")
			.setOrigin(0)
			.setDepth(0)
			.setVisible(true);
		const updateIcon = this.add.image(centerX, 350, "update_icon").setOrigin(0.5, 1);
		const updateRoomTitle = this.add.text(centerX, updateIcon.y + 60, "Upgrade your apartment", config.defaultTitleFont).setOrigin(0.5, 1);
		const description = this.add.text(centerX, updateRoomTitle.y + 40, "Get more opportunities and storage in the new upgraded location.", config.defaultFont).setOrigin(0.5, 1);
		const description1 = this.add.text(centerX, description.y + 40, "Instantly receive a 3rd room for free!", config.defaultGoldFont).setOrigin(0.5, 1);
		const priceText = this.add.text(centerX - 55, description1.y + 40, "Price:", config.defaultBoldFont).setOrigin(0.5, 1);
		const priceValue = this.add.text(centerX + 30, description1.y + 40, `${adjustedPrice} RLT`, config.defaultPriceFont).setOrigin(0.5, 1);
		const upgradeButton = this.add.image(centerX, priceValue.y + 60, "upgrade_button_screen").setInteractive({ cursor: "pointer" });
		upgradeButton.on("pointerup", () => {
			this.setVisibleContainer("confirmationContainer");
		});
		const cancelButton = this.add.image(width, 10, "close_button").setOrigin(1, 0);
		cancelButton.setScale(1.5);
		cancelButton.setInteractive({ cursor: "pointer" });
		cancelButton.on("pointerup", () => {
			this.scene.stop();
		});
		this.buySkinContainer = this.add.container(0, 0, [updateIcon, updateRoomTitle, description, description1, priceText, upgradeButton, priceValue]).setVisible(true);
		const congratsDescription = "Welcome to your new home. Load it up with the latest equipment and happy mining!";
		this.buyRoomLock = this.add
			.sprite(centerX, 170, "lock")
			.setScale(2)
			.setDepth(1)
			.setVisible(false);
		this.fireworks = this.add.sprite(centerX, 170, "fireworks").setVisible(false);
		addCongratsText(
			this,
			() => {
				this.refreshGame(true);
			},
			congratsDescription,
			true
		);
		const confirmDescription = "Do you want to upgrade room for";
		addConfirmationText(this, () => this.setVisibleContainer("buySkinContainer"), this.buySkin, this.price, confirmDescription);
		addNotEnoughText(this, this.price, () => {
			this.scene.stop();
		});
		if (this.balance < this.price) {
			this.setVisibleContainer("notEnoughContainer");
		}
		this.addAnimations();
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
			{ name: "confirmationContainer", isPaperEffectVisible: true, isLockVisible: true },
			{ name: "buySkinContainer", isPaperEffectVisible: true, isLockVisible: false },
			{ name: "notEnoughContainer", isPaperEffectVisible: false, isLockVisible: false },
			{ name: "congratsContainer", isPaperEffectVisible: true, isLockVisible: true },
		];
		const paperEffectStatus = containers.find(({ name }) => name === visibleContainer);
		containers.forEach(({ name }) => {
			this[name].setVisible(name === visibleContainer);
		});
		this.paperEffect.setVisible(paperEffectStatus.isPaperEffectVisible);
		this.buyRoomLock.setVisible(paperEffectStatus.isLockVisible);
	};

	createSignalAndController = () => {
		if (this.controller) {
			this.controller.abort();
		}
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	};

	buySkin = async () => {
		this.createSignalAndController();
		try {
			const json = await fetchWithToken(`/api/game/buy-skin`, {
				method: "POST",
				body: JSON.stringify({ skin_id: this.skinId }),
				signal: this.signal,
			});
			if (!json.success) {
				this.scene.stop();
				this.scene.run("ErrorScreen");
			}
			await this.buyRoomsAfterUpgrade(json.data);
		} catch (e) {
			this.scene.stop();
			this.scene.run("ErrorScreen");
		}
	};

	buyRoomsAfterUpgrade = async (data) => {
		try {
			for (let i = 0; i < data.length; i += 1) {
				// eslint-disable-next-line no-await-in-loop
				await this.buyRoom(data[i]._id, null, 0);
			}
		} catch (e) {
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

	buyRoom = async (id) => {
		this.createSignalAndController();
		await fetchWithToken(`/api/game/buy-room`, {
			method: "POST",
			body: JSON.stringify({ room_id: id }),
			signal: this.signal,
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
