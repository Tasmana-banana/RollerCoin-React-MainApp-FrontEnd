import { Scene } from "phaser";

export default class Start extends Scene {
	constructor() {
		super({ key: "Start" });
	}

	create() {
		this.tile = this.add.tileSprite(0, 0, this.game.config.width, this.game.config.height, "startBackground");
		this.tile.setOrigin(0, 0);
		const spriteControlsName = this.sys.game.device.os.desktop ? "controlsPC" : "controlsMobile";
		this.add.image(this.game.config.width / 2, 630, spriteControlsName).setOrigin(0.5);

		const startBtn = this.add.sprite(this.game.config.width / 2, this.game.config.height / 2 - 58, "start");
		startBtn.setInteractive({ cursor: "pointer" });
		startBtn.once("pointerdown", this.startGame);
		startBtn.setOrigin(0.5, 0.5);

		this.startFullScreenBtn = this.add
			.sprite(this.game.config.width / 2, this.game.config.height / 2 + 25, "startFullscreen")
			.setInteractive({ cursor: "pointer" })
			.once("pointerdown", this.startFullScreenGame, this);
		this.startFullScreenBtn.setOrigin(0.5, 0.5);
	}

	startGame = () => {
		this.scene.start("LoadGame");
	};

	startFullScreenGame = () => {
		this.scale.startFullscreen();
		this.scene.start("LoadGame");
	};
}
