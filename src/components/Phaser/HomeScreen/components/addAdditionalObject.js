import config from "../config/config";
import getCrownByRatingPosition from "../helpers/getCrownByRatingPosition";

export const addAdditionalObjects = (scene) => {
	const addContainers = (elements, level) => {
		elements.forEach((element) => {
			const coordinates = scene.coordinatesToPixels(element.x, element.y, level, element.coordinates_type);
			scene[element.name] = scene.add.image(0, 0, element.name).setOrigin(0, element.coordinates_type === "grid" ? 1 : 0);
			scene[`${element.name}Container`] = scene.add.container(coordinates.x, coordinates.y, scene[element.name]);
		});
	};
	const addImages = (elements, level) => {
		elements.forEach((element) => {
			if (element.container_name && !scene[`${element.container_name}Container`]) {
				return false;
			}
			if (element.container_name) {
				const addedElement = scene.add.image(element.x, element.y, element.name).setOrigin(0);
				scene[`${element.container_name}Container`].add(addedElement);
			} else {
				const coordinates = scene.coordinatesToPixels(element.x, element.y, level, element.coordinates_type);
				scene.add.image(coordinates.x, coordinates.y, element.name).setOrigin(0, element.coordinates_type === "grid" ? 1 : 0);
			}
		});
	};
	const addSprites = (elements, level) => {
		elements.forEach((element) => {
			if (element.container_name && !scene[`${element.container_name}Container`]) {
				return false;
			}
			let addedElement = null;
			if (element.container_name) {
				addedElement = scene.add.sprite(element.x, element.y, element.name).setOrigin(0);
				scene[`${element.container_name}Container`].add(addedElement);
			} else {
				const coordinates = scene.coordinatesToPixels(element.x, element.y, level, element.coordinates_type);
				addedElement = scene.add.sprite(coordinates.x, coordinates.y, element.name).setOrigin(0, element.coordinates_type === "grid" ? 1 : 0);
			}
			scene.anims.create({
				key: element.name,
				frames: scene.anims.generateFrameNames(element.name),
				repeat: -1,
				frameRate: element.frame_rate,
			});
			addedElement.play(element.name);
		});
	};
	// add "decoration" Elements to ROOM
	scene.roomLevelsConfig.forEach((room) => {
		if (room.elements && room.elements.length) {
			const sortedElements = room.elements.reduce(
				(acc, val) => {
					acc[val.type] = [...acc[val.type], val];
					return acc;
				},
				{ container: [], image: [], sprite: [] }
			);
			addContainers(sortedElements.container, room.level);
			addImages(sortedElements.image, room.level);
			addSprites(sortedElements.sprite, room.level);
		}
	});
	// add Bookshelf
	const bookshelfProps = scene.basicElements.find((item) => item.name === "bookshelf");
	const bookshelfCoordinates = scene.coordinatesToPixels(bookshelfProps.x, bookshelfProps.y, 0, "grid");
	scene.bookshelf = scene.add.image(0, 0, "bookshelf").setOrigin(0, 1);
	scene.bookshelfContainer = scene.add.container(bookshelfCoordinates.x, bookshelfCoordinates.y, scene.bookshelf);
	// add Table
	const tableProps = scene.basicElements.find((item) => item.name === "table");
	const tableCoordinates = scene.coordinatesToPixels(tableProps.x, tableProps.y, 0, "grid");
	scene.table = scene.add.image(0, 0, "table").setOrigin(0, 1);
	scene.tableContainer = scene.add.container(tableCoordinates.x, tableCoordinates.y, scene.table);
	// add Avatar
	const avatar = scene.add.sprite(0, 0, "avatar").setOrigin(0, 1);
	scene.avatarContainer = scene.add.container(80, -132, avatar);
	scene.tableContainer.add(scene.avatarContainer);
	// add Computer
	const { configPC } = config;
	const { user_trophy: userTrophy } = scene.game.roomsConfig;
	const userPC = userTrophy.toString() || "default";
	scene.avatarContainer.x -= configPC[userPC].marginUser;
	scene.computer = scene.add.sprite(configPC[userPC].x, configPC[userPC].y, `computer_${userPC}`).setOrigin(0, 1);
	scene.tableContainer.add(scene.computer);
	scene.anims.create({
		key: "computerAnimation",
		frames: scene.anims.generateFrameNames(`computer_${userPC}`),
		repeat: -1,
		frameRate: 5,
	});
	scene.computer.play("computerAnimation");
	// add Fan
	const fanProps = scene.basicElements.find((item) => item.name === "fan");
	if (!fanProps) {
		return false;
	}
	scene.fan = scene.add.sprite(fanProps.x, fanProps.y, "fan").setOrigin(0);
	scene.tableContainer.add(scene.fan);
	scene.tableContainer.bringToTop(scene.fan);
	scene.anims.create({
		key: "fan",
		frames: scene.anims.generateFrameNames("fan"),
		repeat: -1,
		frameRate: fanProps.frame_rate,
	});
	scene.fan.play("fan");
};

const addCrown = (scene, position) => {
	const crown = scene.add.sprite(30, -70, getCrownByRatingPosition(position));
	crown.setScale(1.4);
	scene.avatarContainer.add(crown);
};

export const addRatingTrophies = (scene) => {
	const { avatarType, users_hat: usersHat } = scene.game.roomsConfig;
	const hatYCoordinatesConfig = {
		default: -58,
		nft: -56,
	};
	if (usersHat && Object.keys(hatYCoordinatesConfig).includes(avatarType) && scene.avatarContainer) {
		const hat = scene.add.sprite(30, hatYCoordinatesConfig[avatarType], "usersHat");
		scene.avatarContainer.add(hat);
	} else {
		const tokenRatingPosition = scene.game.roomsConfig.token_rating_position;
		if (tokenRatingPosition && scene.avatarContainer) {
			addCrown(scene, tokenRatingPosition);
		}
	}
	if (!scene.bookshelfContainer) {
		return null;
	}
	const userTrophies = scene.game.roomsConfig.trophies;
	if (userTrophies.length) {
		const rowLength = 3; // default 3
		const bookshelfWidthPadding = 36;
		const bookshelfHeightPadding = 62;
		const distanceWidth = 48;
		const distanceHeight = 52;
		userTrophies.forEach((item, index) => {
			// Start row is 0, every 3 items (rowLength) add +1 row; (indexes 0-2 = 0 row, indexes 3-5 = 1 row, etc.)
			// This magic is needed to reset the first position in each new row.
			const row = Math.floor(index / rowLength);
			const x = bookshelfWidthPadding + distanceWidth * (index - rowLength * row);
			const y = bookshelfHeightPadding + distanceHeight * row - scene.bookshelf.height;
			const cup = scene.add.sprite(x, y, item).setOrigin(0.5, 1);
			scene.bookshelfContainer.add(cup);
		});
	}
};
