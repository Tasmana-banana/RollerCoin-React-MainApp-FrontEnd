import { Scene } from "phaser";
import { MersenneTwister19937, Random } from "random-js";
import formatTime from "../../helpers/formatTime";

const gameOptions = {
	fieldSize: 8,
	gemColors: 4,
	gemSize: 80,
	swapSpeed: 250,
	fallSpeed: 200,
	destroySpeed: 200,
	centerX: 160,
	centerY: 35,

	get centerRowDif() {
		return this.centerY / this.gemSize;
	},

	get centerColDif() {
		return this.centerX / this.gemSize;
	},
};
const HORIZONTAL = 1;
const VERTICAL = 2;

export default class Game extends Scene {
	constructor() {
		super("Game");
	}

	create() {
		this.diff = this.game.customOptions.level;
		this.currentDiffScore = this.game.rewardsList[this.diff];
		this.random = (min, max) => {
			const randomNum = new Random(MersenneTwister19937.autoSeed());
			return randomNum.integer(min, max);
		};
		gameOptions.gemColors = this.countOrbColorsByDiff();
		this.WIN_COUNT_GEMS = 59 + this.diff;
		this.countKilledAll = 0;
		this.canPick = true;
		this.dragging = false;
		this.drawField();
		this.selectedGem = null;
		this.input.on("pointerdown", this.gemSelect, this);
		this.input.on("pointermove", this.startSwipe, this);
		this.input.on("pointerup", this.stopSwipe, this);
		this.gameTime = 70000;
		this.score = 0;

		this.add.tileSprite(0, 0, this.game.config.width, this.game.config.height, "startBackground").setOrigin(0, 0);

		this.scoreBg = this.add.sprite(0, 0, "scoreSprite").setOrigin(0, 0);
		this.countBg = this.add.sprite(this.game.config.width - 165, this.game.config.height - 91, "countSprite").setOrigin(0, 0);
		this.countText = this.add
			.text(this.game.config.width - 95, this.game.config.height - 45, "0", {
				font: "24px 'Roboto'",
				fill: "#a3aeb4",
				align: "center",
			})
			.setOrigin(0, 0);
		this.scoreText = this.add
			.text(85, 60, "0", {
				font: "24px 'Roboto'",
				fill: "#a3aeb4",
				align: "center",
			})
			.setOrigin(0.5);
		this.timeBg = this.add.sprite(this.game.config.width - 165, 0, "timeSprite").setOrigin(0, 0);
		this.timer = this.time.delayedCall(this.gameTime, () => this.destroyGame(1));
		this.timeText = this.add
			.text(this.game.config.width - 85, 60, "0", {
				font: "24px 'Roboto'",
				fill: "#a3aeb4",
				align: "center",
			})
			.setOrigin(0.5);
	}

	update() {
		const currentTime = formatTime(((this.gameTime - this.timer.elapsed) / 1000).toFixed(0));
		this.timeText.setText(currentTime);
		this.scoreText.setText(this.score);
		this.countText.setText(this.countKilledAll);
	}

	countOrbColorsByDiff() {
		let countOrbs = 4;
		switch (true) {
			case this.diff >= 3 && this.diff <= 5:
				countOrbs = 5;
				break;
			case this.diff > 5 && this.diff <= 7:
				countOrbs = 6;
				break;
			case this.diff > 7:
				countOrbs = 7;
				break;
			default:
				break;
		}
		return countOrbs;
	}

	drawField() {
		this.gameArray = [];
		this.poolArray = [];
		this.gemContainer = this.add.container(gameOptions.centerX, gameOptions.centerY);
		this.gemContainer.setSize(gameOptions.fieldSize * gameOptions.gemSize);
		this.gemContainer.setDepth(1);
		for (let i = 0; i < gameOptions.fieldSize; i += 1) {
			this.gameArray[i] = [];
			for (let j = 0; j < gameOptions.fieldSize; j += 1) {
				const gem = this.add.sprite(gameOptions.gemSize * j + gameOptions.gemSize / 2, gameOptions.gemSize * i + gameOptions.gemSize / 2, "orbs");
				this.gemContainer.add(gem);
				do {
					const randomColor = this.random(0, gameOptions.gemColors - 1);
					gem.setFrame(randomColor);
					this.gameArray[i][j] = {
						gemColor: randomColor,
						gemSprite: gem,
						isEmpty: false,
					};
				} while (this.isMatch(i, j));
			}
		}
	}

	isMatch(row, col) {
		return this.isHorizontalMatch(row, col) || this.isVerticalMatch(row, col);
	}

	isHorizontalMatch(row, col) {
		return this.gemAt(row, col).gemColor === this.gemAt(row, col - 1).gemColor && this.gemAt(row, col).gemColor === this.gemAt(row, col - 2).gemColor;
	}

	isVerticalMatch(row, col) {
		return this.gemAt(row, col).gemColor === this.gemAt(row - 1, col).gemColor && this.gemAt(row, col).gemColor === this.gemAt(row - 2, col).gemColor;
	}

	gemAt(row, col) {
		if (row < 0 || row >= gameOptions.fieldSize || col < 0 || col >= gameOptions.fieldSize) {
			return -1;
		}
		return this.gameArray[row][col];
	}

	gemSelect(pointer) {
		if (this.canPick) {
			this.dragging = true;
			const row = Math.floor(pointer.y / gameOptions.gemSize - gameOptions.centerRowDif);
			const col = Math.floor(pointer.x / gameOptions.gemSize - gameOptions.centerColDif);
			const pickedGem = this.gemAt(row, col);
			if (pickedGem !== -1) {
				if (this.selectedGem === null) {
					pickedGem.gemSprite.setScale(1.2);
					pickedGem.gemSprite.setDepth(1);
					this.selectedGem = pickedGem;
				} else if (this.areTheSame(pickedGem, this.selectedGem)) {
					this.selectedGem.gemSprite.setScale(1);
					this.selectedGem = null;
				} else if (this.areNext(pickedGem, this.selectedGem)) {
					this.selectedGem.gemSprite.setScale(1);
					this.swapGems(this.selectedGem, pickedGem, true);
				} else {
					this.selectedGem.gemSprite.setScale(1);
					pickedGem.gemSprite.setScale(1.2);
					this.selectedGem = pickedGem;
				}
			}
		}
	}

	startSwipe(pointer) {
		if (this.dragging && this.selectedGem !== null) {
			const deltaX = pointer.downX - pointer.x;
			const deltaY = pointer.downY - pointer.y;
			let deltaRow = 0;
			let deltaCol = 0;
			if (deltaX > gameOptions.gemSize / 2 && Math.abs(deltaY) < gameOptions.gemSize / 4) {
				deltaCol = -1;
			}
			if (deltaX < -gameOptions.gemSize / 2 && Math.abs(deltaY) < gameOptions.gemSize / 4) {
				deltaCol = 1;
			}
			if (deltaY > gameOptions.gemSize / 2 && Math.abs(deltaX) < gameOptions.gemSize / 4) {
				deltaRow = -1;
			}
			if (deltaY < -gameOptions.gemSize / 2 && Math.abs(deltaX) < gameOptions.gemSize / 4) {
				deltaRow = 1;
			}
			if (deltaRow + deltaCol !== 0) {
				const pickedGem = this.gemAt(this.getGemRow(this.selectedGem) + deltaRow, this.getGemCol(this.selectedGem) + deltaCol);
				if (pickedGem !== -1) {
					this.selectedGem.gemSprite.setScale(1);
					this.swapGems(this.selectedGem, pickedGem, true);
				}
			}
		}
	}

	stopSwipe() {
		this.dragging = false;
	}

	areTheSame(gem1, gem2) {
		return this.getGemRow(gem1) === this.getGemRow(gem2) && this.getGemCol(gem1) === this.getGemCol(gem2);
	}

	// eslint-disable-next-line class-methods-use-this
	getGemRow(gem) {
		return Math.floor(gem.gemSprite.y / gameOptions.gemSize);
	}

	// eslint-disable-next-line class-methods-use-this
	getGemCol(gem) {
		return Math.floor(gem.gemSprite.x / gameOptions.gemSize);
	}

	areNext(gem1, gem2) {
		return Math.abs(this.getGemRow(gem1) - this.getGemRow(gem2)) + Math.abs(this.getGemCol(gem1) - this.getGemCol(gem2)) === 1;
	}

	swapGems(gem1, gem2, swapBack) {
		this.swappingGems = 2;
		this.canPick = false;
		this.dragging = false;
		const fromColor = gem1.gemColor;
		const fromSprite = gem1.gemSprite;
		const toColor = gem2.gemColor;
		const toSprite = gem2.gemSprite;
		const gem1Row = this.getGemRow(gem1);
		const gem1Col = this.getGemCol(gem1);
		const gem2Row = this.getGemRow(gem2);
		const gem2Col = this.getGemCol(gem2);
		this.gameArray[gem1Row][gem1Col].gemColor = toColor;
		this.gameArray[gem1Row][gem1Col].gemSprite = toSprite;
		this.gameArray[gem2Row][gem2Col].gemColor = fromColor;
		this.gameArray[gem2Row][gem2Col].gemSprite = fromSprite;
		this.tweenGem(gem1, gem2, swapBack);
		this.tweenGem(gem2, gem1, swapBack);
	}

	tweenGem(gem1, gem2, swapBack) {
		const row = this.getGemRow(gem1);
		const col = this.getGemCol(gem1);
		this.tweens.add({
			targets: this.gameArray[row][col].gemSprite,
			x: col * gameOptions.gemSize + gameOptions.gemSize / 2,
			y: row * gameOptions.gemSize + gameOptions.gemSize / 2,
			duration: gameOptions.swapSpeed,
			callbackScope: this,
			onComplete() {
				this.swappingGems -= 1;
				if (this.swappingGems === 0) {
					if (!this.matchInBoard() && swapBack) {
						this.swapGems(gem1, gem2, false);
					} else if (this.matchInBoard()) {
						this.handleMatches();
					} else {
						this.canPick = true;
						this.selectedGem = null;
					}
				}
			},
		});
	}

	matchInBoard() {
		for (let i = 0; i < gameOptions.fieldSize; i += 1) {
			for (let j = 0; j < gameOptions.fieldSize; j += 1) {
				if (this.isMatch(i, j)) {
					return true;
				}
			}
		}
		return false;
	}

	handleMatches() {
		this.removeMap = [];
		for (let i = 0; i < gameOptions.fieldSize; i += 1) {
			this.removeMap[i] = [];
			for (let j = 0; j < gameOptions.fieldSize; j += 1) {
				this.removeMap[i].push(0);
			}
		}
		this.markMatches(HORIZONTAL);
		this.markMatches(VERTICAL);
		this.destroyGems();
	}

	markMatches(direction) {
		for (let i = 0; i < gameOptions.fieldSize; i += 1) {
			let colorStreak = 1;
			let currentColor = -1;
			let startStreak = 0;
			let colorToWatch = 0;
			for (let j = 0; j < gameOptions.fieldSize; j += 1) {
				if (direction === HORIZONTAL) {
					colorToWatch = this.gemAt(i, j).gemColor;
				}
				if (direction === VERTICAL) {
					colorToWatch = this.gemAt(j, i).gemColor;
				}
				if (colorToWatch === currentColor) {
					colorStreak += 1;
				}
				if (colorToWatch !== currentColor || j === gameOptions.fieldSize - 1) {
					if (colorStreak >= 3) {
						for (let k = 0; k < colorStreak; k += 1) {
							this.score = this.calculateScore(this.score);
							this.countKilledAll += 1;
							if (this.countKilledAll >= this.WIN_COUNT_GEMS) {
								if (this.game && !this.game.pendingDestroy) {
									this.destroyGame(3);
								}
								break;
							}
						}
						switch (colorStreak) {
							case 3:
								for (let k = 0; k < colorStreak; k += 1) {
									if (direction === HORIZONTAL) {
										this.removeMap[i][startStreak + k] += 1;
									}
									if (direction === VERTICAL) {
										this.removeMap[startStreak + k][i] += 1;
									}
								}
								break;
							case 4:
								for (let k = 0; k < gameOptions.fieldSize; k += 1) {
									if (direction === HORIZONTAL) {
										this.removeMap[i][k] += 1;
									}
									if (direction === VERTICAL) {
										this.removeMap[k][i] += 1;
									}
								}
								break;
							default:
								for (let k = 0; k < gameOptions.fieldSize; k += 1) {
									for (let l = 0; l < gameOptions.fieldSize; l += 1) {
										if (this.gemAt(k, l).gemColor === currentColor) {
											this.removeMap[k][l] += 1;
										}
									}
								}
								break;
						}
					}
					startStreak = j;
					colorStreak = 1;
					currentColor = colorToWatch;
				}
			}
		}
	}

	destroyGems() {
		let destroyed = 0;
		for (let i = 0; i < gameOptions.fieldSize; i += 1) {
			for (let j = 0; j < gameOptions.fieldSize; j += 1) {
				if (this.removeMap[i][j] > 0) {
					destroyed += 1;
					this.tweens.add({
						targets: this.gameArray[i][j].gemSprite,
						alpha: 0.5,
						duration: gameOptions.destroySpeed,
						callbackScope: this,
						// eslint-disable-next-line no-loop-func
						onComplete() {
							destroyed -= 1;
							this.gameArray[i][j].gemSprite.visible = false;
							this.poolArray.push(this.gameArray[i][j].gemSprite);
							if (destroyed === 0) {
								this.makeGemsFall();
								this.replenishField();
							}
						},
					});
					this.gameArray[i][j].isEmpty = true;
				}
			}
		}
	}

	makeGemsFall() {
		for (let i = gameOptions.fieldSize - 2; i >= 0; i -= 1) {
			for (let j = 0; j < gameOptions.fieldSize; j += 1) {
				if (!this.gameArray[i][j].isEmpty) {
					const fallTiles = this.holesBelow(i, j);
					if (fallTiles > 0) {
						this.tweens.add({
							targets: this.gameArray[i][j].gemSprite,
							y: this.gameArray[i][j].gemSprite.y + fallTiles * gameOptions.gemSize,
							duration: gameOptions.fallSpeed * fallTiles,
						});
						this.gameArray[i + fallTiles][j] = {
							gemSprite: this.gameArray[i][j].gemSprite,
							gemColor: this.gameArray[i][j].gemColor,
							isEmpty: false,
						};
						this.gameArray[i][j].isEmpty = true;
					}
				}
			}
		}
	}

	holesBelow(row, col) {
		let result = 0;
		for (let i = row + 1; i < gameOptions.fieldSize; i += 1) {
			if (this.gameArray[i][col].isEmpty) {
				result += 1;
			}
		}
		return result;
	}

	replenishField() {
		let replenished = 0;
		for (let j = 0; j < gameOptions.fieldSize; j += 1) {
			const emptySpots = this.holesInCol(j);
			if (emptySpots > 0) {
				for (let i = 0; i < emptySpots; i += 1) {
					replenished += 1;
					const randomColor = this.random(0, gameOptions.gemColors - 1);
					this.gameArray[i][j].gemColor = randomColor;
					this.gameArray[i][j].gemSprite = this.poolArray.pop();
					this.gameArray[i][j].gemSprite.setFrame(randomColor);
					this.gameArray[i][j].gemSprite.visible = true;
					this.gameArray[i][j].gemSprite.x = gameOptions.gemSize * j + gameOptions.gemSize / 2;
					this.gameArray[i][j].gemSprite.y = gameOptions.gemSize / 2 - (emptySpots - i) * gameOptions.gemSize;
					this.gameArray[i][j].gemSprite.alpha = 1;
					this.gameArray[i][j].isEmpty = false;
					this.tweens.add({
						targets: this.gameArray[i][j].gemSprite,
						y: gameOptions.gemSize * i + gameOptions.gemSize / 2,
						duration: gameOptions.fallSpeed * emptySpots,
						callbackScope: this,
						// eslint-disable-next-line no-loop-func
						onComplete() {
							replenished -= 1;
							if (replenished === 0) {
								if (this.matchInBoard()) {
									this.time.addEvent({
										delay: 250,
										callback: this.handleMatches(),
									});
								} else {
									this.canPick = true;
									this.selectedGem = null;
								}
							}
						},
					});
				}
			}
		}
	}

	holesInCol(col) {
		let result = 0;
		for (let i = 0; i < gameOptions.fieldSize; i += 1) {
			if (this.gameArray[i][col].isEmpty) {
				result += 1;
			}
		}
		return result;
	}

	calculateScore(scoreVal) {
		const step = this.currentDiffScore / this.WIN_COUNT_GEMS;
		const resultScore = Math.round(scoreVal + step);
		if (resultScore > this.currentDiffScore) {
			return this.currentDiffScore;
		}
		return resultScore;
	}

	destroyGame(status) {
		if (this.intervalBullet) {
			clearInterval(this.intervalBullet);
		}
		this.timer.remove();
		this.scene.start("GameEnd", { finishStatus: status, score: this.score });
	}
}
