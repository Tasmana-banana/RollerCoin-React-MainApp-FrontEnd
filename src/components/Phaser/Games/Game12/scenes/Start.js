import { Scene } from "phaser";

export default class Start extends Scene {
	constructor() {
		super({ key: "Start" });
	}

	create() {
		this.tile = this.add.tileSprite(0, 0, this.game.config.width, this.game.config.height, "splashScreen");
		this.tile.setOrigin(0, 0);

		const startBtn = this.add.sprite(this.game.config.width / 2, this.game.config.height / 2 - 58, "start");
		startBtn.setInteractive({ cursor: "pointer" });
		startBtn.once("pointerdown", this.startGame);
		startBtn.setOrigin(0.5, 0.5);

		this.startFullScreenBtn = this.add
			.sprite(this.game.config.width / 2, this.game.config.height / 2 + 25, "startFullscreen")
			.setInteractive({ cursor: "pointer" })
			.once("pointerdown", this.startFullScreenGame, this);
		this.startFullScreenBtn.setOrigin(0.5, 0.5);

		const controlsText = this.add.text(this.game.config.width / 2, this.startFullScreenBtn.y + 80, "CONTROLS", { font: "30px 'Arcana'", fill: "#ffffff", align: "center" }).setOrigin(0.5, 0);
		controlsText.setShadow(0, 2, "rgba(0, 0, 0, 0.3)", 1);

		const spriteControlsName = this.sys.game.device.os.desktop ? "controlsPC" : "controlsMobile";
		this.add.image(this.game.config.width / 2, controlsText.y + 80, spriteControlsName).setOrigin(0.5, 0);
	}

	startGame = () => {
		this.scene.start("LoadGame");
	};

	startFullScreenGame = () => {
		this.scale.startFullscreen();
		this.scene.start("LoadGame");
	};
}
