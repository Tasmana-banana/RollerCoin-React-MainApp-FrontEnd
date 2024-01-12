import { Scene } from "phaser";
import getRndBtnPosition from "../../../../../services/games/getRndBtnPosition";

export default class GameEnd extends Scene {
	constructor() {
		super({ key: "GameOverScene" });
	}

	init(data) {
		this.finishStatus = data.finishStatus;
		this.score = this.finishStatus === 3 ? data.score : 0;
	}

	create() {
		const { isEnglishLang } = this.game;
		this.userPower = this.game.customOptions.hashInfo; // NEED FROM PROPS
		this.add.tileSprite(0, 0, this.game.config.width, this.textures.get("startBackground").getSourceImage().height, "startBackground").setOrigin(0);
		const btnPosition = getRndBtnPosition();
		if (this.finishStatus === 3) {
			this.finishSprite = this.add.sprite(btnPosition.finishSprite.x, btnPosition.finishSprite.y, "youWin");
		} else {
			this.finishSprite = this.add.sprite(btnPosition.finishSprite.x, btnPosition.finishSprite.y, "gameOver");
		}
		this.finishSprite.setOrigin(0.5);
		this.scoreText = this.add.text(btnPosition.scoreText.x, btnPosition.scoreText.y, `${isEnglishLang ? "Score:" : "分数"} ${this.score} ${isEnglishLang ? "Points" : "分"}`, {
			font: "20px 'Roboto'",
			fill: "#ffffff",
		});
		this.scoreText.setOrigin(0.5);
		this.powerText = this.add.text(btnPosition.powerText.x, btnPosition.powerText.y, `${isEnglishLang ? "Your Power:" : "你的算力:"} ${this.userPower}`, {
			font: "24px 'Roboto'",
			fill: "#ffffff",
		});
		this.powerText.setOrigin(0.5);
		this.orText = this.add.text(btnPosition.orText.x, btnPosition.orText.y, `${isEnglishLang ? "OR" : "或"}`, { font: "20px 'Arcana'", fill: "#ffffff" });
		this.orText.setOrigin(0.5);

		// add RESTART BTN
		this.reStartBtn = this.add.sprite(btnPosition.reStart.x, btnPosition.reStart.y, "restartSprite");
		this.reStartBtn.setOrigin(0.5);
		this.reStartBtn.setInteractive({ cursor: "pointer" });
		this.reStartBtn.on("pointerdown", this.reStartGame);

		// add GAIN POWER BTN
		this.gainPowerBtn = this.add.sprite(btnPosition.gain.x, btnPosition.gain.y, this.finishStatus === 3 ? "gainSprite" : "quitButton");
		this.gainPowerBtn.setOrigin(0.5);
		this.gainPowerBtn.setInteractive({ cursor: "pointer" });
		this.gainPowerBtn.on("pointerdown", this.endThisGame);
	}

	reStartGame = () => {
		this.scene.restart("LoadGame");
		this.scene.start("LoadGame");
	};

	endThisGame = () => {
		this.sys.game.destroy(true);
		this.game.customOptions.callback(this.score, "9", "", this.finishStatus);
	};
}
