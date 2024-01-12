import { Scene } from "phaser";

export default class Start extends Scene {
	constructor() {
		super({ key: "Start" });
	}

	// remove this.tile or add this.controlSprite, or refactor to consts
	create() {
		const { width, height } = this.game.config;
		const cursor = { cursor: "pointer" };

		this.tile = this.add.tileSprite(0, 0, width, height, "startBackground");
		this.tile.setOrigin(0, 0);
		const spriteControlsName = this.sys.game.device.os.desktop ? "controls" : "controls_mobile";
		this.add.image(width / 2, 650, spriteControlsName).setOrigin(0.5);

		const startBtn = this.add.sprite(width / 2, height / 2 - 58, "start");
		startBtn.setInteractive(cursor);
		startBtn.once("pointerdown", this.startGame);
		startBtn.setOrigin(0.5, 0.5);

		this.startFullScreenBtn = this.add
			.sprite(width / 2, height / 2 + 25, "start_fullscreen")
			.setInteractive(cursor)
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
