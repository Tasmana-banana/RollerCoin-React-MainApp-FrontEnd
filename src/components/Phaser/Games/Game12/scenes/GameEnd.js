import { Scene } from "phaser";
import getRndPositionResponsive from "../../../../../services/games/getRndPositionResponsive";

export default class ThisGameEnd extends Scene {
	constructor() {
		super({ key: "ThisGameEnd" });
	}

	init(data) {
		this.finishStatus = data.finishStatus;
		this.gameId = data.gameId;
		this.score = this.finishStatus === 3 ? data.score : 0;
	}

	create() {
		this.userPower = this.game.customOptions.hashInfo; // NEED FROM PROPS
		const textStyle = {
			font: "22px 'Arcana'",
			fill: "#ffffff",
		};
		const btnPosition = getRndPositionResponsive();
		const centerX = this.game.config.width / 2;
		const centerY = this.game.config.height / 2;

		this.add.tileSprite(0, 0, this.game.config.width, this.game.config.height, "splashScreen").setOrigin(0, 0);

		if (this.finishStatus === 3) {
			this.finishSprite = this.add.sprite(centerX, centerY + btnPosition.infoY, "youWin");
		} else {
			this.finishSprite = this.add.sprite(centerX, centerY + btnPosition.infoY, "gameOver");
		}
		this.finishSprite.setOrigin(0.5, 0.5);

		this.scoreText = this.add.text(centerX, this.finishSprite.y + 140, `Score: ${this.score} Points`, textStyle);
		this.scoreText.setShadow(0, 2, "rgba(0, 0, 0, 0.3)", 1);
		this.scoreText.setOrigin(0.5, 0.5);
		this.powerText = this.add.text(centerX, this.scoreText.y + 40, `Your Power: ${this.userPower}`, textStyle);
		this.powerText.setShadow(0, 2, "rgba(0, 0, 0, 0.3)", 1);
		this.powerText.setOrigin(0.5, 0.5);

		// add RESTART BTN
		this.reStartBtn = this.add.sprite(centerX + btnPosition.reStart.x, centerY + btnPosition.reStart.y, "restartSprite");
		this.reStartBtn.setOrigin(0.5, 0.5);
		this.reStartBtn.setInteractive({ cursor: "pointer" });
		this.reStartBtn.on("pointerdown", this.reStartGame);

		// text OR
		this.orText = this.add.text(centerX + btnPosition.orText.x, centerY + btnPosition.orText.y, "OR", textStyle);
		this.orText.setOrigin(0.5);

		// add GAIN POWER BTN
		this.gainPowerBtn = this.add.sprite(centerX + btnPosition.gain.x, centerY + btnPosition.gain.y, this.finishStatus === 3 ? "gainSprite" : "quitButton");
		this.gainPowerBtn.setOrigin(0.5, 0.5);
		this.gainPowerBtn.setInteractive({ cursor: "pointer" });
		this.gainPowerBtn.on("pointerdown", this.endThisGame);
	}

	reStartGame = () => {
		this.scene.start("LoadGame");
	};

	endThisGame = () => {
		this.sys.game.destroy(true);
		this.game.customOptions.callback(this.score, this.finishStatus, this.gameId);
	};
}
