import Phaser3 from "phaser";
import { getItemInfo } from "../helpers/fetchRequests";

const CAN_BE_SOLD = "Can be sold";
const CAN_NOT_BE_SOLD = "Can't be sold";
const POP_UP_WIDTH = 312;

const styles = {
	titleStyle: {
		fontSize: 20,
		fontFamily: "Roboto",
		fontWeight: 700,
		align: "left",
	},
	characteristicsStyle: {
		fontSize: 20,
		fontFamily: "Roboto",
		align: "left",
	},
	cyanAccentTextStyle: {
		fontSize: 20,
		fontFamily: "Roboto",
		fontWeight: 700,
		color: "#03e1e4",
		align: "left",
	},
	descriptionStyle: {
		fontSize: 20,
		fontFamily: "Roboto",
		align: "left",
		lineSpacing: 8,
		wordWrap: { width: 286, useAdvancedWrap: true },
	},
	statusOfSellStyle: {
		fontSize: 18,
		fontFamily: "Roboto",
		align: "left",
	},
};

export const addMinerInfoPopup = async (scene, minerId) => {
	const { width, height } = scene.game.config;
	const minerData = await getItemInfo(scene, "miner", minerId);
	if (!minerData) {
		return null;
	}
	const statusOfSell = minerData?.is_can_be_sold_on_mp === false ? CAN_NOT_BE_SOLD : CAN_BE_SOLD;
	const statusOfSellColor = minerData?.is_can_be_sold_on_mp === false ? "#d53f3f" : "#5ce319";

	let fullDescription = minerData.description.en;
	if (minerData.created_by_title && minerData.created_by_title.text) {
		fullDescription = `${minerData.description.en} ${minerData.created_by_title.text}`;
	}
	const rackBonusHeight = minerData.rack_bonus_power ? 44 : 0;
	const descriptionText = scene.add.text(16, 0, fullDescription, styles.descriptionStyle);
	const descriptionHeight = fullDescription ? descriptionText.height + 28 : 0;
	const baseHeight = 358;
	const backgroundHeight = baseHeight + rackBonusHeight + descriptionHeight;
	const containerY = scene.currentLevel ? scene.currentLevel * height : 0;
	scene.dialogContainer = scene.add.container(width / 2 - 120, containerY + height / 2 - backgroundHeight / 2);
	const backgroundBorder = scene.add.graphics();
	backgroundBorder.fillStyle("0x6a668a", 1);
	backgroundBorder.fillRoundedRect(-1, -1, POP_UP_WIDTH, backgroundHeight + 2, 4);
	backgroundBorder.setInteractive(new Phaser3.Geom.Rectangle(-1, -1, POP_UP_WIDTH, backgroundHeight + 2), Phaser3.Geom.Rectangle.Contains);
	backgroundBorder.on("pointerdown", (pointer, x, y, event) => {
		event.stopPropagation();
	});
	const background = scene.add.graphics();
	background.fillStyle("0x2f3045", 1);
	background.fillRoundedRect(0, 0, 310, backgroundHeight, 4);
	const closeIcon = scene.add.image(283, 8, "closeIcon");
	closeIcon.setSize(20, 20);
	closeIcon.setOrigin(0);
	closeIcon.setInteractive({ cursor: "pointer" });
	closeIcon.on("pointerup", () => {
		scene.toggleActiveItem();
		scene.tweens.add({
			targets: scene.dialogContainer,
			alpha: { from: 1, to: 0 },
			ease: "Linear",
			duration: 150,
			repeat: 0,
			callbackScope: scene,
			onComplete() {
				scene.dialogContainer.destroy();
				scene.dialogContainer = null;
			},
			yoyo: false,
		});
	});
	const title = scene.add.text(16, 11, minerData.name.en, styles.titleStyle);
	const minerBackground = scene.add.graphics();
	minerBackground.fillStyle("0x1f1f2d", 1);
	minerBackground.fillRoundedRect(16, title.y + 29, 277, 180, 4);
	const minerImg = scene.add.sprite(154, 128, minerData.miner_id);
	minerImg.setFrame(0);
	minerImg.setOrigin(0.5, 0.5);

	const statusOfSellText = scene.add.text(POP_UP_WIDTH / 2, title.y + 222, `${statusOfSell}`, { ...styles.statusOfSellStyle, color: statusOfSellColor }).setOrigin(0.5, 0);
	const statusOfSellTexDivider = scene.add.graphics();
	statusOfSellTexDivider.fillStyle("0x6a668a", 4);
	statusOfSellTexDivider.fillRect(16, statusOfSellText.y + 31, 277, 1);

	const cellsTitle = scene.add.text(16, statusOfSellText.y + 44, "Width", styles.characteristicsStyle);
	cellsTitle.setOrigin(0);
	const cellsText = scene.add.text(292, statusOfSellText.y + 44, `${minerData.width} Cell(s)`, styles.characteristicsStyle);
	cellsText.setOrigin(1, 0);
	const cellsDivider = scene.add.graphics();
	cellsDivider.fillStyle("0x6a668a", 1);
	cellsDivider.fillRect(16, cellsTitle.y + 31, 277, 1);

	const powerTitle = scene.add.text(16, cellsTitle.y + 44, "Power:", styles.characteristicsStyle);
	powerTitle.setOrigin(0);
	const powerText = scene.add.text(292, cellsTitle.y + 44, `${minerData.power} Gh/s`, styles.characteristicsStyle);
	powerText.setOrigin(1, 0);

	const dialogItems = [
		backgroundBorder,
		title,
		background,
		closeIcon,
		minerBackground,
		minerImg,
		statusOfSellText,
		statusOfSellTexDivider,
		cellsTitle,
		cellsText,
		cellsDivider,
		powerTitle,
		powerText,
	];
	if (minerData.rack_bonus_power || fullDescription) {
		const powerDivider = scene.add.graphics();
		powerDivider.fillStyle("0x6a668a", 1);
		powerDivider.fillRect(16, powerTitle.y + 31, 277, 1);
		dialogItems.push(powerDivider);
	}
	let descriptionMargin = powerTitle.y;
	if (minerData.rack_bonus_power) {
		const rackBonusTitle = scene.add.text(16, powerTitle.y + 44, "Rack bonus:", styles.characteristicsStyle);
		rackBonusTitle.setOrigin(0);
		dialogItems.push(rackBonusTitle);
		const rackBonusText = scene.add.text(292, powerTitle.y + 44, `+${minerData.rack_bonus_power} Gh/s`, styles.cyanAccentTextStyle);
		rackBonusText.setOrigin(1, 0);
		dialogItems.push(rackBonusText);
		if (fullDescription) {
			const rackBonusDivider = scene.add.graphics();
			rackBonusDivider.fillStyle("0x6a668a", 1);
			rackBonusDivider.fillRect(16, rackBonusTitle.y + 31, 277, 1);
			dialogItems.push(rackBonusDivider);
			descriptionMargin = rackBonusTitle.y;
		}
	}
	descriptionText.y = descriptionMargin + 44;
	dialogItems.push(descriptionText);
	scene.dialogContainer.add(dialogItems);
	scene.dialogContainer.sendToBack(background);
	scene.dialogContainer.sendToBack(backgroundBorder);
	scene.dialogContainer.setAlpha(0);
	scene.tweens.add({
		targets: scene.dialogContainer,
		alpha: { from: 0, to: 1 },
		ease: "Linear",
		duration: 150,
		repeat: 0,
		yoyo: false,
	});
	scene.input.on(
		"pointerdown",
		() => {
			if (scene.dialogContainer) {
				scene.dialogContainer.destroy();
				scene.dialogContainer = null;
				scene.toggleActiveItem();
			}
		},
		this
	);
};

export const addRackInfoPopup = async (scene, rackID) => {
	const { width, height } = scene.game.config;
	const rackData = await getItemInfo(scene, "rack", rackID);
	if (!rackData) {
		return null;
	}
	const rackBonusHeight = rackData.rack_bonus_percent ? 44 : 0;
	const descriptionText = scene.add.text(16, 0, rackData.description.en, styles.descriptionStyle);
	const descriptionHeight = rackData.description.en ? descriptionText.height + 28 : 0;
	const baseHeight = 270;
	const backgroundHeight = baseHeight + rackBonusHeight + descriptionHeight;
	const containerY = scene.currentLevel ? scene.currentLevel * height : 0;
	scene.dialogContainer = scene.add.container(width / 2 - 120, containerY + height / 2 - backgroundHeight / 2);
	const backgroundBorder = scene.add.graphics();
	backgroundBorder.fillStyle("0x6a668a", 1);
	backgroundBorder.fillRoundedRect(-1, -1, POP_UP_WIDTH, backgroundHeight + 2, 4);
	backgroundBorder.setInteractive(new Phaser3.Geom.Rectangle(-1, -1, POP_UP_WIDTH, backgroundHeight + 2), Phaser3.Geom.Rectangle.Contains);
	backgroundBorder.on("pointerdown", (pointer, x, y, event) => {
		event.stopPropagation();
	});
	const background = scene.add.graphics();
	background.fillStyle("0x2f3045", 1);
	background.fillRoundedRect(0, 0, 310, backgroundHeight, 4);
	const closeIcon = scene.add.image(283, 8, "closeIcon");
	closeIcon.setSize(20, 20);
	closeIcon.setOrigin(0);
	closeIcon.setInteractive({ cursor: "pointer" });
	closeIcon.on("pointerup", () => {
		scene.toggleActiveItem();
		scene.tweens.add({
			targets: scene.dialogContainer,
			alpha: { from: 1, to: 0 },
			ease: "Linear",
			duration: 150,
			repeat: 0,
			callbackScope: scene,
			onComplete() {
				scene.dialogContainer.destroy();
				scene.dialogContainer = null;
			},
			yoyo: false,
		});
	});
	const title = scene.add.text(16, 11, rackData.name.en, styles.titleStyle);
	const rackBackground = scene.add.graphics();
	rackBackground.fillStyle("0x1f1f2d", 1);
	rackBackground.fillRoundedRect(16, title.y + 29, 277, 180, 4);
	const rackImg = scene.add.sprite(154, 130, rackData.rack_id);
	rackImg.setFrame(0);
	rackImg.setScale(0.6);
	rackImg.setOrigin(0.5, 0.5);
	const capacityTitle = scene.add.text(16, title.y + 222, "Rack size:", styles.characteristicsStyle);
	capacityTitle.setOrigin(0);
	const capacityText = scene.add.text(292, title.y + 222, `${rackData.capacity} Cell(s)`, styles.characteristicsStyle);
	capacityText.setOrigin(1, 0);
	const dialogItems = [backgroundBorder, title, background, closeIcon, rackBackground, rackImg, capacityTitle, capacityText];
	if (rackData.rack_bonus_percent || rackData.description.en) {
		const capacityDivider = scene.add.graphics();
		capacityDivider.fillStyle("0x6a668a", 1);
		capacityDivider.fillRect(16, capacityTitle.y + 31, 277, 1);
		dialogItems.push(capacityDivider);
	}
	let descriptionMargin = capacityTitle.y;
	if (rackData.rack_bonus_percent) {
		const rackBonusTitle = scene.add.text(16, capacityTitle.y + 44, "Rack bonus:", styles.characteristicsStyle);
		rackBonusTitle.setOrigin(0);
		dialogItems.push(rackBonusTitle);
		const rackBonusText = scene.add.text(292, capacityTitle.y + 44, `+${rackData.rack_bonus_percent}%`, styles.cyanAccentTextStyle);
		rackBonusText.setOrigin(1, 0);
		dialogItems.push(rackBonusText);
		if (rackData.description.en) {
			const rackBonusDivider = scene.add.graphics();
			rackBonusDivider.fillStyle("0x6a668a", 1);
			rackBonusDivider.fillRect(16, rackBonusTitle.y + 31, 277, 1);
			dialogItems.push(rackBonusDivider);
			descriptionMargin = rackBonusTitle.y;
		}
	}
	descriptionText.y = descriptionMargin + 44;
	dialogItems.push(descriptionText);
	scene.dialogContainer.add(dialogItems);
	scene.dialogContainer.sendToBack(background);
	scene.dialogContainer.sendToBack(backgroundBorder);
	scene.dialogContainer.setAlpha(0);
	scene.tweens.add({
		targets: scene.dialogContainer,
		alpha: { from: 0, to: 1 },
		ease: "Linear",
		duration: 150,
		repeat: 0,
		yoyo: false,
	});
	scene.input.on(
		"pointerdown",
		() => {
			if (scene.dialogContainer) {
				scene.dialogContainer.destroy();
				scene.dialogContainer = null;
				scene.toggleActiveItem();
			}
		},
		this
	);
};
