import Phaser3, { Scene } from "phaser";
import Card from "../gameObjects/Card";

export default class Game extends Scene {
	constructor() {
		super({ key: "Game" });
	}

	create() {
		this.diff = this.game.customOptions.level;
		this.currentDiffScore = this.game.rewardsList[this.diff];
		this.coins = ["bitcoin", "binance", "rollercoin", "ethereum", "litecoin", "monero", "ripple", "eos", "stellar", "tether"];
		this.openedCard = null;
		this.countAlive = 1;
		this.score = 0;
		this.gameTime = 60;
		this.gameOptions = {
			levelMap: {
				1: {
					cols: 3,
					rows: 4,
				},
				2: {
					cols: 3,
					rows: 4,
				},
				3: {
					cols: 3,
					rows: 4,
				},
				4: {
					cols: 4,
					rows: 4,
				},
				5: {
					cols: 4,
					rows: 4,
				},
				6: {
					cols: 4,
					rows: 4,
				},
				7: {
					cols: 4,
					rows: 4,
				},
				8: {
					cols: 5,
					rows: 4,
				},
				9: {
					cols: 5,
					rows: 4,
				},
				10: {
					cols: 5,
					rows: 4,
				},
			},
			tileSize: this.textures.getFrame(this.coins[0], 0).width,
			tileSpacingWidth: 3,
			tileSpacingHeight: 6,
		};
		this.totalCouples = (this.gameOptions.levelMap[this.diff].rows * this.gameOptions.levelMap[this.diff].cols) / 2;
		this.add.image(0, 0, "mainScreen").setOrigin(0, 0);
		this.add.image(0, 0, `shell_${this.gameOptions.levelMap[this.diff].cols}_${this.gameOptions.levelMap[this.diff].rows}`).setOrigin(0, 0);
		this.timerEvent = this.time.addEvent({ delay: 1000, callback: () => this.onTimerEvent(), loop: true });
		this.createHeader();
		this.createCards();
		this.initCards();
	}

	createCards() {
		this.cards = [];
		const countCardsForLevel = this.gameOptions.levelMap[this.diff].rows * this.gameOptions.levelMap[this.diff].cols;
		this.countAlive = Math.floor(countCardsForLevel / 2);
		const uniqueCardsArray = this.coins.slice(0, Math.floor(countCardsForLevel / 2));
		const allCardsArray = [...uniqueCardsArray, ...uniqueCardsArray];
		const randomizedCardsArray = Phaser3.Utils.Array.Shuffle(allCardsArray);

		for (let i = 0; i < randomizedCardsArray.length; i += 1) {
			this.cards.push(new Card(this, randomizedCardsArray[i]));
		}

		this.clickEvent = this.input.on("gameobjectdown", this.onCardClicked, this);
	}

	initCards() {
		const positions = [];
		const leftOffset = 216 - (this.gameOptions.levelMap[this.diff].cols - 3) * 87; // Max left offset (for 3 cols) = 216px. Each +1 column subtract 87px.
		const topOffset = this.gameHeader.height + 27;

		for (let row = 0; row < this.gameOptions.levelMap[this.diff].rows; row += 1) {
			for (let col = 0; col < this.gameOptions.levelMap[this.diff].cols; col += 1) {
				positions.push({
					x: leftOffset + col * (this.gameOptions.tileSize + this.gameOptions.tileSpacingWidth),
					y: topOffset + row * (this.gameOptions.tileSize + this.gameOptions.tileSpacingHeight),
				});
			}
		}
		this.cards.forEach((card, index) => {
			card.init(positions[index]);
		});
	}

	onCardClicked(pointer, card) {
		if (card.isOpened) {
			return false;
		}
		card.open();
		if (this.openedCard) {
			this.clickEvent.off("gameobjectdown");
			this.time.delayedCall(1000, () => {
				if (this.openedCard.value === card.value) {
					this.openedCard.collapse();
					card.collapse();
					this.updateScore();
					this.countAlive -= 1;
					if (this.countAlive <= 0) {
						this.destroyGame(3);
					}
				} else {
					this.openedCard.close();
					card.close();
				}
				this.openedCard = null;
				this.clickEvent = this.input.on("gameobjectdown", this.onCardClicked, this);
			});
		} else {
			this.openedCard = card;
		}
	}

	updateScore() {
		const step = Math.round(this.currentDiffScore / this.totalCouples);
		const resultScore = this.score + step;
		if (resultScore > this.currentDiffScore) {
			this.score = this.currentDiffScore;
		}
		this.score = resultScore;
		this.scoreText.setText(this.score);
	}

	createHeader() {
		this.gameHeader = this.add.image(0, 0, "header").setOrigin(0, 0);
		this.scoreSprite = this.add.image(20, 15, "score").setOrigin(0, 0);
		this.scoreText = this.add.text(this.scoreSprite.x + 101, this.scoreSprite.height / 2, "0", { font: "24px 'Roboto'", fill: "#a3aeb4", align: "center" }).setOrigin(0.5, 0);
		this.timerSprite = this.add.image(this.scoreSprite.x + this.scoreSprite.width + 15, 15, "time").setOrigin(0, 0);
		this.timerText = this.add.text(this.timerSprite.x + 62, this.timerSprite.height / 2, "01:00", { font: "24px 'Roboto'", fill: "#a3aeb4", align: "center" });
	}

	onTimerEvent() {
		this.gameTime -= 1;
		if (this.gameTime <= 0) {
			this.destroyGame(1);
		} else if (this.gameTime < 10) {
			this.timerText.setText(`00:0${this.gameTime}`);
		} else {
			this.timerText.setText(`00:${this.gameTime}`);
		}
	}

	destroyGame(status) {
		this.timerEvent.remove();
		this.scene.start("GameEnd", { finishStatus: status, score: this.score });
	}
}
