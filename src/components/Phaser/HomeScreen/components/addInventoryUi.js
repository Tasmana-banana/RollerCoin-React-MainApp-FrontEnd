import config from "../config/config";
import fillTheRoom from "../helpers/fillTheRoom";

const addInventoryUi = (scene) => {
	const { width } = scene.game.config;
	scene.inventory.background = scene.add.image(0, 0, "inventoryItemPanel").setOrigin(0, 1);
	scene.inventoryContainer.add(scene.inventory.background);
	scene.inventory.headButton = scene.add.image(20, -scene.inventory.background.height, "inventoryHeadButton").setOrigin(0, 1);
	scene.inventory.headButton.setInteractive({ cursor: "pointer" });
	scene.inventory.headButton.on("pointerup", () => {
		if (!scene.isInventoryMoving) {
			scene.isInventoryMoving = true;
			scene.isInventoryOpen = !scene.isInventoryOpen;
			scene.inventory.itemButton.setFrame(scene.isInventoryOpen ? 1 : 0);
		}
	});
	scene.inventoryContainer.add(scene.inventory.headButton);
	scene.inventory.itemButton = scene.add.sprite(355, scene.inventory.headButton.y - 19, "inventoryItemButton");
	scene.inventoryContainer.add(scene.inventory.itemButton);
	scene.inventory.itemsCount = scene.add.text(250, scene.inventory.headButton.y - 38, "(0)", config.defaultBoldFont);
	scene.inventoryContainer.add(scene.inventory.itemsCount);
	scene.inventory.leftButton = scene.add.image(55, (10 - scene.inventory.background.height) / 2, "inventoryButtonDisabled").setOrigin(0.5);
	scene.inventory.leftButton.on("pointerup", () => {
		scene.scrollablePanel.childOY += 89;
		scene.isItemsChengingInInventory = true;
		scene.currentItemIndex -= 1;
	});
	scene.inventoryContainer.add(scene.inventory.leftButton);
	scene.inventory.rightButton = scene.add.image(width - 165, (10 - scene.inventory.background.height) / 2, "inventoryButtonPressed").setOrigin(0.5);
	scene.inventory.rightButton.scaleX = -1;
	scene.inventory.rightButton.setInteractive({ cursor: "pointer" });
	scene.inventory.rightButton.on("pointerup", () => {
		scene.scrollablePanel.childOY -= 89;
		scene.isItemsChengingInInventory = true;
		scene.currentItemIndex += 1;
	});
	scene.inventory.insertAll = scene.add.image(width - 55, (10 - scene.inventory.background.height) / 2, "inventoryInsertAll").setOrigin(0.5);
	scene.inventory.insertAll.setInteractive({ cursor: "pointer" });
	scene.inventory.insertAll.on("pointerup", () => {
		scene.scene.run("ConfirmationScreen", {
			confirmationText: "Do you want to auto-arrange all miners and racks into your room?\nIf there is no empty space for the miner or rack, it will stay in the items panel.",
			yesCb: () => fillTheRoom(scene),
		});
	});
	[scene.inventory.leftButton, scene.inventory.rightButton, scene.inventory.insertAll].forEach((item) => {
		item.on("pointerover", () => {
			item.setAlpha(0.8);
		});
		item.on("pointerout", () => {
			item.setAlpha(1);
		});
	});
	scene.inventoryContainer.add(scene.inventory.rightButton);
	scene.inventoryContainer.add(scene.inventory.insertAll);
};
export default addInventoryUi;
