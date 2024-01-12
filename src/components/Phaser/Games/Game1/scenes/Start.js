import { Scene } from "phaser";

export default class Start extends Scene {
	constructor() {
		super({ key: "Start" });
		this.startGame = this.startGame.bind(this);
		this.startFullScreenGame = this.startFullScreenGame.bind(this);
		this.create = this.create.bind(this);
	}

	create() {
		this.tile = this.add.tileSprite(0, 0, 0, 0, "startBackground");
		this.tile.setOrigin(0, 0);

		const startBtn = this.add.sprite(this.sys.game.config.width / 2, this.sys.game.config.height / 2 - 58, "start");
		startBtn.setInteractive({ cursor: "pointer" });
		startBtn.once("pointerdown", this.startGame);
		startBtn.setOrigin(0.5, 0.5);

		this.startFullScreenBtn = this.add
			.sprite(this.sys.game.config.width / 2, this.sys.game.config.height / 2 + 25, "start_fullscreen")
			.setInteractive({ cursor: "pointer" })
			.once("pointerdown", this.startFullScreenGame, this);
		this.startFullScreenBtn.setOrigin(0.5, 0.5);
	}

	startGame() {
		this.scene.start("LoadGame");
	}

	startFullScreenGame() {
		this.scale.startFullscreen();
		this.scene.start("LoadGame");
	}
}
