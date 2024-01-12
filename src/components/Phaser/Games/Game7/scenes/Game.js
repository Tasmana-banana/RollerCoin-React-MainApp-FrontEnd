import Phaser3, { Scene } from "phaser";
import { MersenneTwister19937, Random } from "random-js";
import RewardsGroup from "../gameObjects/RewardsGroup";
import Reward from "../gameObjects/Reward";

export default class Game extends Scene {
	constructor() {
		super({ key: "Game" });
	}

	create() {
		this.gameOptions = {
			tileSize: this.textures.get("tile").getSourceImage().width,
			size: 4,
			numberSettings: {
				0: { frame: 0, color: 0xffffff },
				2: { frame: 0, color: 0xffffff },
				4: { frame: 1, color: 0xffeeee },
				8: { frame: 2, color: 0xffdddd },
				16: { frame: 3, color: 0xffcccc },
				32: { frame: 4, color: 0xffbbbb },
				64: { frame: 5, color: 0xffaaaa },
				128: { frame: 6, color: 0xff9999 },
				256: { frame: 7, color: 0xff8888 },
				512: { frame: 8, color: 0xff7777 },
				1024: { frame: 9, color: 0xff6666 },
				2048: { frame: 10, color: 0xff5555 },
			},
			goal: {
				1: 128,
				2: 256,
				3: 384,
				4: 464,
				5: 484,
				6: 512,
				7: 548,
				8: 600,
				9: 664,
				10: 1024,
			},
			gameTime: {
				1: 60,
				2: 60,
				3: 60,
				4: 60,
				5: 60,
				6: 75,
				7: 75,
				8: 75,
				9: 75,
				10: 75,
			},
			differentTilesForSelect: [4, 8, 16, 32],
			tweenSpeed: 75,
		};
		this.score = 0;
		this.diff = this.game.customOptions.level;
		this.currentDiffScore = this.game.rewardsList[this.diff];
		this.gameTime = this.gameOptions.gameTime[this.diff];
		this.notTwoTilesPercent = 30;
		this.notTwoTilesAvailible = Math.ceil(this.gameOptions.size ** 2 * (this.notTwoTilesPercent / 100));
		this.bg = this.add.tileSprite(this.game.config.width / 2, this.game.config.height / 2, this.game.config.width, this.game.config.height, "main_screen");
		this.physics.world.setBounds(
			0,
			this.textures.get("headerSprite").getSourceImage().height,
			this.game.config.width,
			this.game.config.height - this.textures.get("headerSprite").getSourceImage().height
		);

		// Randomizer with seed
		this.random = (min, max) => {
			const randomNum = new Random(MersenneTwister19937.autoSeed());
			return randomNum.integer(min, max);
		};

		// Init header and field
		this.createHeader();
		this.timerEvent = this.time.addEvent({ delay: 1000, callback: this.onTimerEvent, callbackScope: this, loop: true });
		this.paddingTopForElements = this.gameHeader.height + 100;
		this.paddingLeftForElements = 72;
		this.fieldArray = [];
		this.fieldGroup = this.add.group();
		for (let i = 0; i < this.gameOptions.size; i += 1) {
			this.fieldArray[i] = [];
			for (let j = 0; j < this.gameOptions.size; j += 1) {
				const twoContainer = this.add.container(this.tileDestination(j, true), this.tileDestination(i), this.add.sprite(0, 0, "tiles", 0).setOrigin(0.5, 0.5));
				twoContainer.add(this.add.sprite(0, 0, "coins", 0).setOrigin(0.5, 0.5));
				twoContainer.setAlpha(0);
				twoContainer.setVisible(false);
				this.fieldArray[i][j] = {
					tileValue: 0,
					tileSprite: twoContainer,
					canUpgrade: true,
				};
				this.fieldGroup.add(twoContainer);
			}
		}

		// Rewards
		this.rewardsGroup = new RewardsGroup(this);
		this.physics.add.overlap(this.progressContainer, this.rewardsGroup, this.addScore, null, this);

		// Controls: mouse
		this.input.on("pointerup", this.mouseUp, this);
		this.input.on("pointerdown", this.mouseDown, this);

		// Controls: Keyboard
		const keyboardKeys = ["up", "down", "right", "left", "w", "a", "s", "d"];
		keyboardKeys.forEach((key) => this.input.keyboard.addKey(key).on("down", this.handleKey, this));

		// Init start tiles
		this.canMove = false;
		this.addTwo();
		this.addTwo();
	}

	update() {
		this.scoreText.setText(`${(+this.score).toFixed(0)}`);
		if (this.mouseIsDown) {
			const distX = Math.abs(this.input.x - this.startX);
			const distY = Math.abs(this.input.y - this.startY);
			if (distY > distX) {
				if (distY > 100) {
					this.swipeDone("vertical");
				}
			} else if (distX > 100) {
				this.swipeDone("horizontal");
			}
		}
	}

	tileDestination(pos, isX) {
		return isX
			? pos * this.gameOptions.tileSize + this.paddingLeftForElements + this.gameOptions.tileSize / 2
			: pos * this.gameOptions.tileSize + this.paddingTopForElements + this.gameOptions.tileSize / 2;
	}

	mouseDown() {
		this.mouseIsDown = true;
		this.startX = this.input.x;
		this.startY = this.input.y;
	}

	mouseUp() {
		this.mouseIsDown = false;
	}

	swipeDone(type) {
		const endX = this.input.x;
		const endY = this.input.y;
		if (type === "horizontal") {
			if (endX < this.startX) {
				return this.handleKey({ keyCode: Phaser3.Input.Keyboard.KeyCodes.LEFT });
			}
			if (endX > this.startX) {
				this.handleKey({ keyCode: Phaser3.Input.Keyboard.KeyCodes.RIGHT });
			}
		}
		if (type === "vertical") {
			if (endY < this.startY) {
				return this.handleKey({ keyCode: Phaser3.Input.Keyboard.KeyCodes.UP });
			}
			if (endY > this.startY) {
				this.handleKey({ keyCode: Phaser3.Input.Keyboard.KeyCodes.DOWN });
			}
		}
	}

	getEmptyTiles() {
		const emptyTiles = [];
		for (let i = 0; i < this.gameOptions.size; i += 1) {
			for (let j = 0; j < this.gameOptions.size; j += 1) {
				if (this.fieldArray[i][j].tileValue === 0) {
					emptyTiles.push({
						row: i,
						col: j,
					});
				}
			}
		}
		return emptyTiles;
	}

	addTwo() {
		const emptyTiles = this.getEmptyTiles();
		if (!emptyTiles.length) {
			return null;
		}
		const getRandom = Phaser3.Utils.Array.GetRandom;

		const choosenTile = getRandom(emptyTiles);
		let valueToAdd = 2;

		if (this.notTwoTilesAvailible > 0 && this.random(0, 100) < this.notTwoTilesPercent) {
			valueToAdd = getRandom(this.gameOptions.differentTilesForSelect);
			this.notTwoTilesAvailible -= 1;
		}
		this.fieldArray[choosenTile.row][choosenTile.col].tileValue = valueToAdd;
		this.fieldArray[choosenTile.row][choosenTile.col].tileSprite.setVisible(true);
		this.fieldArray[choosenTile.row][choosenTile.col].tileSprite.getAt(0).setFrame(this.gameOptions.numberSettings[valueToAdd].frame);
		this.fieldArray[choosenTile.row][choosenTile.col].tileSprite.getAt(1).setFrame(this.gameOptions.numberSettings[valueToAdd].frame);
		this.tweens.add({
			targets: this.fieldArray[choosenTile.row][choosenTile.col].tileSprite,
			alpha: 1,
			duration: this.gameOptions.tweenSpeed,
			ease: Phaser3.Math.Easing.Linear.None,
			onComplete(tween) {
				tween.parent.scene.canMove = true;
				tween.parent.scene.checkGameOver();
			},
		});
	}

	handleKey(e) {
		if (this.canMove) {
			const children = this.fieldGroup.getChildren();
			switch (e.keyCode) {
				case Phaser3.Input.Keyboard.KeyCodes.LEFT:
				case Phaser3.Input.Keyboard.KeyCodes.A:
					for (let i = 0; i < children.length; i += 1) {
						children[i].depth = children[i].x;
					}
					this.handleMove(0, -1);
					break;
				case Phaser3.Input.Keyboard.KeyCodes.RIGHT:
				case Phaser3.Input.Keyboard.KeyCodes.D:
					for (let i = 0; i < children.length; i += 1) {
						children[i].depth = this.game.config.width - children[i].x;
					}
					this.handleMove(0, 1);
					break;
				case Phaser3.Input.Keyboard.KeyCodes.UP:
				case Phaser3.Input.Keyboard.KeyCodes.W:
					for (let i = 0; i < children.length; i += 1) {
						children[i].depth = children[i].y;
					}
					this.handleMove(-1, 0);
					break;
				case Phaser3.Input.Keyboard.KeyCodes.DOWN:
				case Phaser3.Input.Keyboard.KeyCodes.S:
					for (let i = 0; i < children.length; i += 1) {
						children[i].depth = this.game.config.height - children[i].y;
					}
					this.handleMove(1, 0);
					break;
				default:
					break;
			}
		}
	}

	handleMove(deltaRow, deltaCol) {
		this.canMove = false;
		let somethingMoved = false;
		this.movingTiles = 0;
		for (let i = 0; i < this.gameOptions.size; i += 1) {
			for (let j = 0; j < this.gameOptions.size; j += 1) {
				const colToWatch = deltaCol === 1 ? this.gameOptions.size - 1 - j : j;
				const rowToWatch = deltaRow === 1 ? this.gameOptions.size - 1 - i : i;
				const { tileValue } = this.fieldArray[rowToWatch][colToWatch];
				if (tileValue !== 0) {
					let colSteps = deltaCol;
					let rowSteps = deltaRow;
					while (this.isInsideBoard(rowToWatch + rowSteps, colToWatch + colSteps) && this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].tileValue === 0) {
						colSteps += deltaCol;
						rowSteps += deltaRow;
					}
					if (
						this.isInsideBoard(rowToWatch + rowSteps, colToWatch + colSteps) &&
						this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].tileValue === tileValue &&
						this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].canUpgrade &&
						this.fieldArray[rowToWatch][colToWatch].canUpgrade
					) {
						const rewardConfig = {
							x: this.tileDestination(colToWatch + colSteps, true),
							y: this.tileDestination(rowToWatch + rowSteps),
							frame: this.gameOptions.numberSettings[this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].tileValue].frame,
							damageValue: this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].tileValue,
						};

						const rewardSprite = new Reward(this, rewardConfig);
						this.rewardsGroup.add(rewardSprite);
						this.physics.moveToObject(rewardSprite, this.progressContainer, 800);

						this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].tileValue = tileValue * 2;
						this.fieldArray[rowToWatch][colToWatch].tileValue = 0;
						this.moveTile(this.fieldArray[rowToWatch][colToWatch].tileSprite, rowToWatch + rowSteps, colToWatch + colSteps, Math.abs(rowSteps + colSteps), true);
						somethingMoved = true;
					} else {
						colSteps -= deltaCol;
						rowSteps -= deltaRow;
						if (colSteps !== 0 || rowSteps !== 0) {
							this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].tileValue = tileValue;
							this.fieldArray[rowToWatch][colToWatch].tileValue = 0;
							this.moveTile(this.fieldArray[rowToWatch][colToWatch].tileSprite, rowToWatch + rowSteps, colToWatch + colSteps, Math.abs(rowSteps + colSteps), false);
							somethingMoved = true;
						}
					}
				}
			}
		}
		if (!somethingMoved) {
			this.canMove = true;
		}
		this.checkGameOver();
	}

	moveTile(tile, row, col, distance, changeNumber) {
		this.movingTiles += 1;
		this.tweens.add({
			targets: tile,
			x: this.tileDestination(col, true),
			y: this.tileDestination(row),
			duration: this.gameOptions.tweenSpeed * distance,
			ease: Phaser3.Math.Easing.Linear.None,
			onComplete: () => {
				this.movingTiles -= 1;
				if (changeNumber) {
					const tileFrame = this.gameOptions.numberSettings[this.fieldArray[row][col].tileValue].frame;
					this.movingTiles += 1;
					tile.getAt(0).setFrame(tileFrame);
					tile.getAt(1).setFrame(tileFrame);
					this.tweens.add({
						targets: tile,
						scale: 1.1,
						duration: this.gameOptions.tweenSpeed,
						ease: "Cubic.easeInOut",
						autoStart: true,
						delay: 0,
						repeat: 1,
						yoyo: true,
						onComplete: () => {
							this.movingTiles -= 1;
							if (this.movingTiles === 0) {
								this.resetTiles();
								this.addTwo();
							}
						},
					});
				}
				if (this.movingTiles === 0) {
					this.resetTiles();
					this.addTwo();
				}
			},
		});
	}

	resetTiles() {
		for (let i = 0; i < this.gameOptions.size; i += 1) {
			for (let j = 0; j < this.gameOptions.size; j += 1) {
				this.fieldArray[i][j].canUpgrade = true;
				this.fieldArray[i][j].tileSprite.x = this.tileDestination(j, true);
				this.fieldArray[i][j].tileSprite.y = this.tileDestination(i);
				if (this.fieldArray[i][j].tileValue > 0) {
					this.fieldArray[i][j].tileSprite.setAlpha(1);
					this.fieldArray[i][j].tileSprite.setVisible(true);
					this.fieldArray[i][j].tileSprite.getAt(1).setFrame(this.gameOptions.numberSettings[this.fieldArray[i][j].tileValue].frame);
				} else {
					this.fieldArray[i][j].tileValue = 0;
					this.fieldArray[i][j].tileSprite.setAlpha(0);
					this.fieldArray[i][j].tileSprite.setVisible(false);
				}
				this.fieldArray[i][j].tileSprite.getAt(0).setFrame(this.gameOptions.numberSettings[this.fieldArray[i][j].tileValue].frame);
			}
		}
	}

	checkGameOver() {
		const canAddNew = !!this.getEmptyTiles().length;
		const canMove = this.checkCanMove();
		if (!canAddNew && !canMove) {
			this.destroyGame(2);
		}
	}

	checkCanMove() {
		const deltaParams = {
			left: [0, -1],
			right: [0, 1],
			up: [-1, 0],
			down: [1, 0],
		};
		const canMoveArray = Object.keys(deltaParams).map((direction) => {
			const deltaCol = deltaParams[direction][1];
			const deltaRow = deltaParams[direction][0];
			for (let i = 0; i < this.gameOptions.size; i += 1) {
				for (let j = 0; j < this.gameOptions.size; j += 1) {
					const colToWatch = deltaCol === 1 ? this.gameOptions.size - 1 - j : j;
					const rowToWatch = deltaRow === 1 ? this.gameOptions.size - 1 - i : i;
					const { tileValue } = this.fieldArray[rowToWatch][colToWatch];
					if (tileValue !== 0) {
						let colSteps = deltaCol;
						let rowSteps = deltaRow;
						while (this.isInsideBoard(rowToWatch + rowSteps, colToWatch + colSteps) && this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].tileValue === 0) {
							colSteps += deltaCol;
							rowSteps += deltaRow;
						}
						if (
							this.isInsideBoard(rowToWatch + rowSteps, colToWatch + colSteps) &&
							this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].tileValue === tileValue &&
							this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].canUpgrade &&
							this.fieldArray[rowToWatch][colToWatch].canUpgrade
						) {
							return true;
						}
						colSteps -= deltaCol;
						rowSteps -= deltaRow;
						if (colSteps !== 0 || rowSteps !== 0) {
							return true;
						}
					}
				}
			}
			return false;
		});
		return canMoveArray.some((val) => val === true);
	}

	isInsideBoard(row, col) {
		return row >= 0 && col >= 0 && row < this.gameOptions.size && col < this.gameOptions.size;
	}

	createHeader() {
		this.headerBg = this.add.sprite(this.game.config.width / 2, 40, "headerSprite");
		this.gameHeader = this.add.container(0, 0, this.headerBg);
		this.scoreSprite = this.add.sprite(90, 40, "scoreSprite");
		this.gameHeader.add(this.scoreSprite);
		this.scoreText = this.add.text(this.scoreSprite.x + 25, 39, "0", {
			font: "24px 'Roboto'",
			fill: "#a3aeb4",
			align: "center",
		});
		this.scoreText.setOrigin(0.5);
		this.progressContainer = this.physics.add.sprite(this.game.config.width - this.textures.get("progressContainer").getSourceImage().width / 2 - 10, 40, "progressContainer");
		this.progressContainer.setOrigin(0.5);
		this.progressBar = this.add.sprite(this.game.config.width - this.textures.get("progressBar").getSourceImage().width / 2 - 22, 40, "progressBar");
		this.progressBar.pointsToCollect = this.gameOptions.goal[this.diff];
		this.progressBar.setOrigin(0.5);
		this.progressBar.setCrop(0, 0, 0, this.progressBar.height);
		this.progressBar.setDepth(11);
		this.timerSprite = this.add.sprite(this.scoreSprite.x + this.scoreSprite.width + 20, 40, "timeSprite");
		this.timerText = this.add
			.text(this.timerSprite.x + 25, this.timerSprite.height - 3, this.createTimerText(), { font: "24px 'Roboto'", fill: "#a3aeb4", align: "center" })
			.setOrigin(0.5)
			.setDepth(12);
	}

	onTimerEvent() {
		this.gameTime -= 1;
		if (this.gameTime < 0) {
			this.destroyGame(1);
		} else {
			this.timerText.setText(this.createTimerText());
		}
	}

	createTimerText() {
		if (this.gameTime >= 60) {
			if (this.gameTime < 70) {
				return `01:0${+this.gameTime - 60}`;
			}
			return `01:${+this.gameTime - 60}`;
		}
		if (this.gameTime >= 10) {
			return `00:${this.gameTime}`;
		}
		return `00:0${this.gameTime}`;
	}

	addScore(bar, rewardSprite) {
		rewardSprite.destroy();
		this.progressBar.pointsToCollect -= rewardSprite.damageValue;
		if (this.progressBar.pointsToCollect < 0) {
			this.progressBar.pointsToCollect = 0;
		}
		this.calculateGameScoreFromLifePercent();
		if (this.progressBar.pointsToCollect !== 0) {
			this.progressBar.setCrop(0, 0, this.textures.get("progressBar").getSourceImage().width * (1 - this.progressBar.pointsToCollect / this.gameOptions.goal[this.diff]), 40);
			return null;
		}
		this.canMove = false;
		this.destroyGame(3);
	}

	calculateGameScoreFromLifePercent() {
		const resultScore = this.currentDiffScore - Math.ceil(this.currentDiffScore * (this.progressBar.pointsToCollect / this.gameOptions.goal[this.diff]));
		if (resultScore > this.currentDiffScore) {
			this.score = this.currentDiffScore;
		}
		this.score = resultScore;
	}

	destroyGame(status) {
		this.timerEvent.remove();
		this.finishStatus = status;
		this.scene.start("GameEnd", { finishStatus: status, score: this.score });
	}
}
