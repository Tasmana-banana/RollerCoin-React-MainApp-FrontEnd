import config from "../config/config";
import currenciesDecimalAdjust from "../helpers/currenciesDecimalAdjust";

export const addConfirmationText = (scene, noCallback, yesCallback, price, description) => {
	const { width } = scene.game.config;
	const marginTop = 160;
	const centerX = width / 2;
	scene.confirmationContainer = scene.add.container(centerX, marginTop);
	const confirmTitleText = scene.add.text(0, scene.buyRoomLock.y + 40, "Confirm your purchase", config.defaultTitleFont).setOrigin(0.5);
	const confirmDescription = scene.add.text(-50, confirmTitleText.y + 55, description || "Do you want to buy new room for", config.defaultBoldFont).setOrigin(0.5);
	const confirmPrice = scene.add.text(210, confirmDescription.y, `${currenciesDecimalAdjust(scene.game.roomsConfig.rollerCurrencies, price, "rlt")} RLT`, config.defaultPriceFont).setOrigin(0.5);
	const yesButton = scene.add.image(-90, confirmPrice.y + 90, "yes_button").setInteractive({ cursor: "pointer" });
	const noButton = scene.add.image(90, confirmPrice.y + 90, "no_button").setInteractive({ cursor: "pointer" });
	noButton.on("pointerup", noCallback);
	yesButton.once("pointerup", () => {
		yesCallback();
		yesButton.setAlpha(0.8);
		yesButton.disableInteractive();
		noButton.setAlpha(0.8);
		noButton.disableInteractive();
	});
	scene.confirmationContainer.add([confirmTitleText, confirmDescription, confirmPrice, yesButton, noButton]);
	scene.confirmationContainer.setVisible(false);
};

export const addNotEnoughText = (scene, price, cancelCallback) => {
	const centerX = scene.game.config.width / 2;
	const errorWalletImg = scene.add.image(0, 220, "error_wallet");
	const errorTitleText = scene.add.text(0, 320, "Not enough funds", config.redBoldTitleFont).setOrigin(0.5);
	const errorDescription = scene.add.text(-170, 385, "You must have minimum", config.defaultFont).setOrigin(0.5);
	const errorPrice = scene.add.text(15, 383, `${currenciesDecimalAdjust(scene.game.roomsConfig.rollerCurrencies, price, "rlt")} RLT`, config.redBoldFont).setOrigin(0.5);
	const errorDescriptionRest = scene.add.text(155, 385, "on your account", config.defaultFont).setOrigin(0.5);
	const errorAdditionalText = scene.add.text(-30, 435, "Please refill your wallet and try again", config.defaultFont).setOrigin(0.5);
	const goToWalletBtn = scene.add.image(0, 520, "go_to_wallet").setInteractive({ cursor: "pointer" });
	goToWalletBtn.once("pointerup", () => {
		scene.game.roomsConfig.reactHistoryObject.push("/wallet");
	});
	const errorCancelBtn = scene.add.image(0, 610, "cancel_button").setInteractive({ cursor: "pointer" });
	errorCancelBtn.on("pointerup", cancelCallback);
	scene.notEnoughContainer = scene.add
		.container(centerX, 0, [errorWalletImg, errorCancelBtn, errorTitleText, errorDescription, errorPrice, errorDescriptionRest, errorAdditionalText, goToWalletBtn])
		.setVisible(false);
};
export const addCongratsText = (scene, continueCallback, description, isUpgrade) => {
	const centerX = scene.game.config.width / 2;
	scene.congratsContainer = scene.add.container(centerX, 170).setVisible(false);
	const descriptionText = description || "Your new room us ready. It's time to add some racks and miners";
	const congratsTitle = scene.add.text(0, 200, "Congratulations", config.defaultTitleFont).setOrigin(0.5);
	scene.congratsContainer.add(congratsTitle);
	const congratsDescription = scene.add.text(-30, 275, descriptionText, config.defaultBoldFont).setOrigin(0.5);
	scene.congratsContainer.add(congratsDescription);
	if (isUpgrade) {
		const toApartmentButton = scene.add.image(0, 370, "button_apartment").setInteractive({ cursor: "pointer" });
		toApartmentButton.once("pointerup", continueCallback);
		scene.congratsContainer.add(toApartmentButton);
	} else {
		const toStoreButton = scene.add.image(0, 370, "to_the_store_button").setInteractive({ cursor: "pointer" });
		toStoreButton.on("pointerup", () => {
			scene.reactHistoryObject.push("/game/market");
		});
		scene.congratsContainer.add(toStoreButton);
		const continueButton = scene.add.image(0, 460, "continue_button").setInteractive({ cursor: "pointer" });
		continueButton.once("pointerup", continueCallback);
		scene.congratsContainer.add(continueButton);
	}
};
