import Phaser3, { Scene } from "phaser";

const isNull = (value) => value === null;
export default class Game extends Scene {
	constructor() {
		super({ key: "Game" });
	}

	create() {
		this.diff = this.game.customOptions.level;
		this.currentDiffScore = this.game.rewardsList[this.diff];
		this.gameConfig = {
			1: { viruses: ["virusBitcoin", "virusDash"], offsetVirusByY: 6 },
			2: { viruses: ["virusBitcoin", "virusDash"], offsetVirusByY: 6 },
			3: { viruses: ["virusBitcoin", "virusDash"], offsetVirusByY: 6 },
			4: { viruses: ["virusBitcoin", "virusDash"], offsetVirusByY: 5 },
			5: { viruses: ["virusBitcoin", "virusDash", "virusTether"], offsetVirusByY: 5 },
			6: { viruses: ["virusBitcoin", "virusDash", "virusTether"], offsetVirusByY: 5 },
			7: { viruses: ["virusBitcoin", "virusDash", "virusTether"], offsetVirusByY: 4 },
			8: { viruses: ["virusBitcoin", "virusDash", "virusTether"], offsetVirusByY: 4 },
			9: { viruses: ["virusBitcoin", "virusDash", "virusTether"], offsetVirusByY: 3 },
			10: { viruses: ["virusBitcoin", "virusDash", "virusTether"], offsetVirusByY: 3 },
			gameChips: ["bitcoin", "dash", "tether"],
			initialCoordinatesToPushChips: [
				{ row: 0, col: 3 },
				{ row: 0, col: 4 },
			],
		};
		this.objectColorsConfig = {
			virusBitcoin: "orange",
			bitcoin: "orange",
			bitcoinHamsterMiniature: "orange",
			virusDash: "blue",
			dash: "blue",
			dashHamsterMiniature: "blue",
			virusTether: "green",
			tether: "green",
			tetherHamsterMiniature: "green",
		};
		this.gameKeys = [];
		this.currentChips = {};
		this.currentChipsOrientation = "horizontal";
		this.COLS = 8;
		this.ROWS = 10;
		this.COL_HEIGHT = 66;
		this.ROW_WIDTH = 66;
		this.DIVIDER = 6;
		this.FALL_TIME = 475;
		this.countDestroyed = 0;
		// add background
		this.add.image(0, 0, "background").setOrigin(0);
		// add game board
		this.gameBoard = [...Array(this.ROWS)].map(() => Array(this.COLS).fill(null));
		// add timer to board
		this.gameTime = 60000;
		this.timeText = this.add.text(840, 340, `00:${this.gameTime / 1000}`).setOrigin(0.5);
		this.timedEvent = this.time.addEvent({ delay: 1000, callback: this.onTimerEvent, loop: true });
		// add sore on board
		this.score = 0;
		this.scoreText = this.add.text(840, 283, `${this.score}`).setOrigin(0.5);
		// add containers
		this.boardContainer = this.add.container(54, 54);
		this.boardContainer.setSize(582, 726);
		this.virusGroup = this.add.group();
		this.virusContainer = this.add.container(720, 380);
		// add hamster to container
		this.hamster = this.add.sprite(820, 200, "hamster").setOrigin(0.5, 1);
		this.nextChipsPreview = this.physics.add.group();
		// array of viruses in current game
		this.isIterationFinished = true;
		// fire functions
		this.addAnimations();
		this.addVirusOnBoard();
		this.nextChips = this.generateChips();
		this.addChips();
		this.generatePreview();
		this.addInputEvents();
		this.addVirusToUI();
		this.addFallTimer();
	}

	addFallTimer = () => {
		this.fallTimer = this.time.addEvent({
			delay: this.FALL_TIME - (this.diff - 1) * 15,
			callback: this.fallItems,
			loop: true,
		});
	};

	speedUp = () => {
		this.fallTimer.timeScale = 2.5;
	};

	resetSpeed = () => {
		this.fallTimer.timeScale = 1;
	};

	activeVelocityToNextChips = () => {
		this.nextChipsPreview.getChildren().forEach((item) => {
			item.body.setVelocityY(-230);
		});
		this.hamster.play("hamster");
	};

	addAnimations = () => {
		// add virus animation
		this.gameConfig[this.diff].viruses.forEach((item) => {
			this.anims.create({
				key: item,
				frames: this.anims.generateFrameNames(item, { start: 0, end: 3 }),
				frameRate: 6,
				repeat: -1,
				repeatDelay: 2000,
			});
		});
		// add virus animation on destroy
		this.gameConfig[this.diff].viruses.forEach((item) => {
			this.anims.create({
				key: `destroy_${item}`,
				frames: this.anims.generateFrameNames(item, { start: 2, end: 7 }),
				frameRate: 8,
				repeat: 0,
			});
		});
		// chips animation
		this.gameConfig.gameChips.forEach((item) => {
			this.anims.create({
				key: `destroy_${item}`,
				frames: this.anims.generateFrameNames(item),
				frameRate: 8,
				repeat: 0,
			});
		});
		// hamster animation
		this.anims.create({
			key: "hamster",
			frames: this.anims.generateFrameNames("hamster"),
			frameRate: 6,
			repeat: 0,
		});
	};

	isAvailableSpaceForMove = (mainChip) => {
		const pair = mainChip.halfLink;
		const nextRow = mainChip.coordinates.row + 1;
		const isNextExists = !!this.gameBoard[nextRow];
		if (!isNextExists) {
			return false;
		}
		switch (mainChip.orientation) {
			case "horizontal": {
				const firstCondition = isNull(this.gameBoard[nextRow][mainChip.coordinates.col]);
				let secondCondition = !pair;
				if (!secondCondition) {
					const neighborCol = pair.coordinates.col;
					secondCondition = isNull(this.gameBoard[nextRow][neighborCol]);
				}
				return firstCondition && secondCondition;
			}
			case "vertical": {
				const currentCol = mainChip.coordinates.col;
				return isNull(this.gameBoard[nextRow][currentCol]);
			}
			default:
				break;
		}
		return false;
	};

	checkFour = (direction = "vertical") => {
		let matrixSize = [this.COLS, this.ROWS];
		if (direction === "horizontal") {
			matrixSize = matrixSize.reverse();
		}
		const [COLS, ROWS] = matrixSize;
		let chipsToDestroy = [];
		for (let x = 0; x < COLS; x += 1) {
			let chipsAccumulator = [];
			let currentColor = "";
			for (let y = 0; y < ROWS; y += 1) {
				let dots = [x, y];
				if (direction === "horizontal") {
					dots = dots.reverse();
				}
				const [col, row] = dots;
				let isColorChanged = false;
				const isLastItem = y === ROWS - 1;
				let tmpChipsAcc = [...chipsAccumulator];
				if (this.gameBoard[row][col]) {
					const { color } = this.gameBoard[row][col];
					if (currentColor !== color) {
						currentColor = color;
						chipsAccumulator = [];
						isColorChanged = true;
					}
					if (currentColor === color) {
						chipsAccumulator.push([...this.gameBoard][row][col]);
					}
				} else {
					isColorChanged = true;
					currentColor = "";
					chipsAccumulator = [];
				}
				if (!isColorChanged && isLastItem) {
					tmpChipsAcc = [...chipsAccumulator];
				}
				if ((isColorChanged || isLastItem) && tmpChipsAcc.length >= 4) {
					chipsToDestroy = [...chipsToDestroy, ...tmpChipsAcc];
				}
			}
		}
		if (chipsToDestroy.length) {
			this.destroyChips(chipsToDestroy);
		}
		return chipsToDestroy.length > 0;
	};

	destroyChips = (coordinates) => {
		this.fallTimer.paused = true;
		coordinates.forEach((currentChip) => {
			const textureName = currentChip.texture.key;
			currentChip.isPendingDestroy = true;
			currentChip.play(`destroy_${textureName}`, true, 0);
			const neighborChip = currentChip.halfLink;
			if (neighborChip) {
				neighborChip.halfLink = null;
				neighborChip.mainChip = neighborChip;
			}
			currentChip.on("animationcomplete", () => {
				if (this.virusGroup.contains(currentChip)) {
					this.virusGroup.remove(currentChip);
					const virusName = currentChip.texture.key;
					let activeVirusCount = 0;
					this.virusGroup.getChildren().forEach((child) => {
						if (child.texture.key === virusName && child.active) {
							activeVirusCount += 1;
						}
					});
					if (!activeVirusCount) {
						this.destroyVirusOnUI();
					}
				}
				currentChip.destroy();
				if (coordinates.every((obj) => !obj.active)) {
					this.fallTimer.paused = false;
					this.calculateScore();
				}
			});
		});
		this.renderBoard();
		this.countDestroyed += coordinates.length;
	};

	fallItems = () => {
		if (!this.isIterationFinished) {
			return null;
		}
		this.isIterationFinished = false;

		const isShouldCreatedArr = [];
		this.boardContainer.iterate((child) => {
			if (!child.isFallDisabled && JSON.stringify(child.mainChip) === JSON.stringify(child) && child.active) {
				isShouldCreatedArr.push(this.moveItem(child));
			}
		});
		if (isShouldCreatedArr.every((val) => !!val)) {
			this.currentChips = {};
			const isSomethingCanDestroyedVertical = this.checkFour();
			const isSomethingCanDestroyedAcross = this.checkFour("horizontal");
			if (!isSomethingCanDestroyedVertical && !isSomethingCanDestroyedAcross) {
				this.addChips();
			}
		}
		this.isIterationFinished = true;
	};

	addChips = () => {
		if (!isNull(this.gameBoard[0][3]) || !isNull(this.gameBoard[0][4])) {
			this.destroyGame(2);
			return false;
		}
		this.activeVelocityToNextChips();
		this.currentChips = { ...this.nextChips };
		this.currentChipsOrientation = "horizontal";
		Object.values(this.currentChips).forEach((item) => {
			item.active = true;
			item.setVisible(true);
		});
		this.renderBoard();
		this.nextChips = this.generateChips();
	};

	generateChips = () => {
		const { gameChips, initialCoordinatesToPushChips } = this.gameConfig;
		const result = {};
		for (let i = 0; i < 2; i += 1) {
			const chipTexture = gameChips[Phaser3.Math.Between(0, gameChips.length - 1)];
			const chip = this.add.sprite(0, 0, chipTexture).setOrigin(0);
			chip.setVisible(false);
			chip.coordinates = { ...initialCoordinatesToPushChips[i] };
			chip.color = this.objectColorsConfig[chipTexture];
			chip.isFallDisabled = false;
			chip.canFall = false;
			chip.active = false;
			chip.orientation = "horizontal";
			this.boardContainer.add(chip);
			result[`chip${i + 1}`] = chip;
		}
		// link to other half
		result.chip1.halfLink = result.chip2;
		result.chip2.halfLink = result.chip1;
		// set main chip
		result.chip1.mainChip = result.chip1;
		result.chip2.mainChip = result.chip1;
		return result;
	};

	colsAndRowsToBoardCoordinates = (row, col) => ({ y: row * this.ROW_WIDTH + row * this.DIVIDER, x: col * this.COL_HEIGHT + col * this.DIVIDER });

	addVirusOnBoard = () => {
		const { viruses, offsetVirusByY } = this.gameConfig[this.diff];
		let count = 0;
		while (viruses.length > count) {
			const row = Phaser3.Math.Between(offsetVirusByY, this.ROWS - 1);
			const col = Phaser3.Math.Between(0, this.COLS - 1);
			if (this.checkSpaceNearVirus(row, col)) {
				const virusArr = this.gameConfig[this.diff].viruses;
				const virus = virusArr[Phaser3.Math.Between(0, virusArr.length - 1)];
				const { x, y } = this.colsAndRowsToBoardCoordinates(row, col);
				const virusSprite = this.add.sprite(x, y, virus).setOrigin(0);
				virusSprite.color = this.objectColorsConfig[virus];
				virusSprite.coordinates = { row, col };
				virusSprite.isFallDisabled = true;
				virusSprite.canFall = false;
				virusSprite.play(virus, true, Phaser3.Math.Between(0, 3));
				// add virus on board
				this.gameBoard[row][col] = virusSprite;
				// add virus to container
				this.virusGroup.add(virusSprite);
				this.boardContainer.add(virusSprite);
				// this.virusGroup.add(virusSprite);
				count += 1;
			}
		}
	};

	addVirusToUI = () => {
		const virusCoordinatesByCount = {
			1: [{ x: 95, y: 90 }],
			2: [
				{ x: 50, y: 100 },
				{ x: 140, y: 100 },
			],
			3: [
				{ x: 95, y: 55 },
				{ x: 50, y: 145 },
				{ x: 140, y: 145 },
			],
		};
		const activeViruses = [...new Set(this.virusGroup.getChildren().map((children) => children.texture.key))];
		const config = virusCoordinatesByCount[activeViruses.length];
		activeViruses.forEach((virusName, index) => {
			const virusSprite = this.add.sprite(config[index].x, config[index].y, virusName);
			virusSprite.play(virusName, true, Phaser3.Math.Between(0, 3));
			this.virusContainer.add(virusSprite);
		});
	};

	destroyVirusOnUI = () => {
		const notActiveViruses = [...new Set(this.virusGroup.getChildren().map((children) => children.texture.key))];
		this.virusContainer.iterate((item) => {
			const virusName = item.texture.key;
			const isVirusFound = notActiveViruses.find((virus) => virus === virusName);
			if (!isVirusFound) {
				item.play(`destroy_${virusName}`, true, 0);
				item.on("animationcomplete", () => {
					item.destroy();
				});
			}
		});
	};

	checkSpaceNearVirus = (x, y) => {
		for (let i = -2; i < 4; i += 1) {
			if ((this.gameBoard[x + i] && !isNull(this.gameBoard[x + i][y])) || (this.gameBoard[x][y + i] && !isNull(this.gameBoard[x][y + i]))) {
				return false;
			}
		}
		return true;
	};

	isMoveBySidesAvailable = (direction) => {
		if (!Object.keys(this.currentChips).length) {
			return false;
		}
		let moveIsAvailable = false;
		const moveInCols = direction === "left" ? -1 : 1;
		const { chip1, chip2 } = this.currentChips;
		const nextCol = this.gameBoard[chip1.coordinates.row][chip1.coordinates.col - 1];
		const secondChipNextCol = this.gameBoard[chip2.coordinates.row][chip2.coordinates.col + 1];
		const chip1MoveVertical = this.gameBoard[chip1.coordinates.row][chip1.coordinates.col + moveInCols];
		const secondChipMoveVertical = this.gameBoard[chip2.coordinates.row][chip2.coordinates.col + moveInCols];
		if (this.currentChipsOrientation === "horizontal" && ((direction === "left" && isNull(nextCol)) || (direction === "right" && isNull(secondChipNextCol)))) {
			moveIsAvailable = true;
		}
		if (this.currentChipsOrientation === "vertical" && isNull(chip1MoveVertical) && isNull(secondChipMoveVertical)) {
			moveIsAvailable = true;
		}
		return moveIsAvailable;
	};

	renderBoard = () => {
		this.gameBoard = [...Array(this.ROWS)].map(() => Array(this.COLS).fill(null));
		this.boardContainer.iterate((child) => {
			if (child.active && !child.isPendingDestroy) {
				const { col, row } = child.coordinates;
				if (!this.gameBoard[row]) {
					return null;
				}
				this.gameBoard[row][col] = child;
				const { x, y } = this.colsAndRowsToBoardCoordinates(row, col);
				child.setPosition(x, y);
			}
		});
	};

	moveItem = (mainChipItem) => {
		const isAvailableSpaceForMove = this.isAvailableSpaceForMove(mainChipItem);
		if (!isAvailableSpaceForMove) {
			return true;
		}
		mainChipItem.coordinates.row += 1;
		const pair = mainChipItem.halfLink;
		if (pair) {
			pair.coordinates.row += 1;
		}
		this.renderBoard();
		return false;
	};

	moveChipsBySides = (direction) => {
		const moveInCols = direction === "left" ? -1 : 1;
		if (this.isMoveBySidesAvailable(direction)) {
			const mainCurrentChip = this.currentChips.chip1.mainChip;
			const pair = mainCurrentChip.halfLink;
			mainCurrentChip.coordinates.col += moveInCols;
			pair.coordinates.col += moveInCols;
		}
		this.renderBoard();
	};

	toggleChipOrientation = () => {
		if (this.currentChipsOrientation === "horizontal") {
			this.currentChipsOrientation = "vertical";
		} else {
			this.currentChipsOrientation = "horizontal";
		}
		Object.values(this.currentChips).forEach((item) => {
			item.orientation = this.currentChipsOrientation;
		});
	};

	rotateChips = () => {
		if (!Object.keys(this.currentChips).length) {
			return false;
		}
		this.isIterationFinished = false;
		const { chip1, chip2 } = this.currentChips;
		let moveIsDone = false;
		const secondChipPrevRow = chip2.coordinates.row - 1;
		const secondChipPrevCol = chip2.coordinates.col - 1;
		const firstChipNextCol = this.gameBoard[chip1.coordinates.row][chip1.coordinates.col + 1];

		if (this.currentChipsOrientation === "horizontal" && this.gameBoard[secondChipPrevRow] && isNull(this.gameBoard[secondChipPrevRow][secondChipPrevCol])) {
			chip2.coordinates.row -= 1;
			chip2.coordinates.col -= 1;
			moveIsDone = true;
		}
		if (this.currentChipsOrientation === "vertical" && isNull(firstChipNextCol)) {
			chip1.coordinates.col += 1;
			chip2.coordinates.row += 1;
			moveIsDone = true;
			// set main chip
			this.currentChips.chip1.mainChip = this.currentChips.chip2;
			this.currentChips.chip2.mainChip = this.currentChips.chip2;
			// refactor
			const tmp = this.currentChips.chip1;
			this.currentChips.chip1 = this.currentChips.chip2;
			this.currentChips.chip2 = tmp;
		}
		if (moveIsDone) {
			this.toggleChipOrientation();
		}
		this.renderBoard();
		this.isIterationFinished = true;
	};

	onTimerEvent = () => {
		this.gameTime -= 1000;
		this.timeText.setText(`00:${this.gameTime / 1000}`);
		if (this.gameTime <= 0) {
			this.destroyGame(1);
		}
	};

	destroyGame = (status) => {
		this.fallTimer.remove(false);
		this.timedEvent.remove(false);
		this.gameKeys.forEach((key) => key.destroy());
		this.scene.start("GameEnd", { finishStatus: status, score: this.score });
	};

	addInputEvents = () => {
		const keyLeft = this.input.keyboard.addKey("left");
		keyLeft.on("up", () => {
			this.moveChipsBySides("left");
		});
		const keyRight = this.input.keyboard.addKey("right");
		keyRight.on("up", () => {
			this.moveChipsBySides("right");
		});
		const rotateChips = this.input.keyboard.addKey("space");
		rotateChips.on("up", this.rotateChips);
		const rotateChipsUpKey = this.input.keyboard.addKey("up");
		rotateChipsUpKey.on("up", this.rotateChips);
		const speedKey = this.input.keyboard.addKey("down");
		speedKey.on("down", this.speedUp);
		speedKey.on("up", this.resetSpeed);
		// touch events
		this.input.on("pointerup", (pointer) => {
			if (pointer.x > 342 && pointer.x < 684) {
				this.moveChipsBySides("right");
			}
			if (pointer.x < 342) {
				this.moveChipsBySides("left");
			}
		});
		const rotateImage = this.add.image(815, 700, "button");
		rotateImage.setInteractive({ cursor: "pointer" });
		rotateImage.on("pointerup", this.rotateChips);
		this.gameKeys = [keyLeft, keyRight, rotateChips, rotateChipsUpKey, speedKey];
	};

	calculateScore = () => {
		const WIN_COUNT_CHIPS_MIN = 16;
		const WIN_COUNT_CHIPS = (this.diff - 1) * 2 + WIN_COUNT_CHIPS_MIN;
		const step = this.currentDiffScore / WIN_COUNT_CHIPS;
		const resultScore = Math.round(this.countDestroyed * step);
		if (resultScore > this.currentDiffScore) {
			this.score = this.currentDiffScore;
		}
		this.score = resultScore;
		if (WIN_COUNT_CHIPS <= this.countDestroyed || !this.virusGroup.getFirstAlive()) {
			this.score = this.currentDiffScore;
			this.destroyGame(3);
		}
	};

	generatePreview = () => {
		this.nextChipsPreview.clear(false, true);
		Object.values(this.nextChips).forEach((child, i) => {
			this.nextChipsPreview.add(this.add.image(800 + i * 40, 130, `${child.texture.key}HamsterMiniature`));
		});
	};

	update() {
		if (this.nextChipsPreview.getLength() > 0 && this.nextChipsPreview.getFirstAlive().y <= 50) {
			this.generatePreview();
		}
		this.scoreText.setText(`${(+this.score).toFixed(0)}`);
	}
}
