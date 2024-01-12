const addChangeRoomsUI = (scene) => {
	scene.changeRoomsUI = {};
	scene.changeRoomsUI.buttons = {};
	scene.changeRoomsUI.separetors = {};
	scene.changeRoomsUIContainer = scene.add.container(0, 0).setDepth(5);
	const openRooms = scene.game.roomsConfig.rooms;
	const { roomsConfig } = scene.game;
	const isUserFromSession = scene.game.roomsConfig.is_user_from_session;
	// add header of ui
	if (Object.keys(roomsConfig.skin_available).length && isUserFromSession) {
		scene.changeRoomsUI.buttonChangeHead = scene.add.image(0, 0, "upgrade_head").setOrigin(0);
		scene.changeRoomsUI.upgradeButtonHead = scene.add.image(140, 8, "upgrade_button_top").setOrigin(0);
		scene.changeRoomsUI.upgradeButtonHead.setInteractive({ cursor: "pointer" });
		scene.changeRoomsUI.upgradeButtonHead.on("pointerdown", scene.handleUpgradeRoom);
	} else {
		scene.changeRoomsUI.buttonChangeHead = scene.add.image(0, 0, "button_change_head").setOrigin(0);
	}
	scene.changeRoomsUI.buttonChangeHead.setDepth(1);
	scene.changeRoomsUIContainer.add(scene.changeRoomsUI.buttonChangeHead);
	if (scene.changeRoomsUI.upgradeButtonHead) {
		scene.changeRoomsUIContainer.add(scene.changeRoomsUI.upgradeButtonHead);
	}
	let lastImageAdded = scene.changeRoomsUI.buttonChangeHead;
	scene.roomLevelsConfig.forEach((room, index) => {
		const isRoomOpen = openRooms.find((item) => item.room_info.level === room.level);
		const roomName = `level_${room.level}`;
		const offset = lastImageAdded.getBottomCenter().y;
		if (isRoomOpen) {
			const initialFrameNumber = index ? 0 : 2;
			const initialHoverNumber = index ? 1 : 2;
			scene.changeRoomsUI.buttons[roomName] = scene.add
				.sprite(4, offset - 2, "button_open", initialFrameNumber)
				.setOrigin(0)
				.setInteractive({ cursor: "pointer" });
			// add events to buttons
			scene.changeRoomsUI.buttons[roomName].on("pointerup", () => scene.changeRoom(room.level));
			scene.changeRoomsUI.buttons[roomName].on("pointerover", () => scene.changeRoomsUI.buttons[roomName].setFrame(initialHoverNumber));
			scene.changeRoomsUI.buttons[roomName].on("pointerout", () => scene.changeRoomsUI.buttons[roomName].setFrame(initialFrameNumber));
		}
		if (!isRoomOpen) {
			scene.changeRoomsUI.buttons[roomName] = scene.add
				.sprite(4, offset - 2, "button_locked", 0)
				.setOrigin(0)
				.setInteractive({ cursor: "pointer" });
			// add events to buttons
			scene.changeRoomsUI.buttons[roomName].on("pointerup", () => scene.changeRoom(room.level));
			scene.changeRoomsUI.buttons[roomName].on("pointerover", () => scene.changeRoomsUI.buttons[roomName].setFrame(1));
			scene.changeRoomsUI.buttons[roomName].on("pointerout", () => scene.changeRoomsUI.buttons[roomName].setFrame(0));
		}
		// add element to container
		scene.changeRoomsUIContainer.add(scene.changeRoomsUI.buttons[roomName]);
		// set z-index to button
		scene.changeRoomsUIContainer.sendToBack(scene.changeRoomsUI.buttons[roomName]);
		// for connect additional images to the bottom of last image
		lastImageAdded = scene.changeRoomsUI.buttons[roomName];
		// add separator if not last image
		if (index !== scene.roomLevelsConfig.length - 1) {
			const offsetForConnector = scene.changeRoomsUI.buttons[roomName].getBottomCenter().y;
			scene.changeRoomsUI.separetors[`${roomName}_separator`] = scene.add.image(22, offsetForConnector - 2, "button_change_connector").setOrigin(0);
			// set z-index to button
			scene.changeRoomsUIContainer.add(scene.changeRoomsUI.separetors[`${roomName}_separator`]);
			scene.changeRoomsUIContainer.bringToTop(scene.changeRoomsUI.separetors[`${roomName}_separator`]);
			lastImageAdded = scene.changeRoomsUI.separetors[`${roomName}_separator`];
		}
	});
};
export default addChangeRoomsUI;
