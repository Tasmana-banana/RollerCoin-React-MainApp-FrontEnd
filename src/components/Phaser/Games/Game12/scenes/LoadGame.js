import { Scene } from "phaser";

export default class LoadGame extends Scene {
	constructor() {
		super({ key: "LoadGame" });
	}

	create() {
		this.tile = this.add.tileSprite(0, 0, this.game.config.width, this.game.config.height, "splashScreen");
		this.tile.setOrigin(0, 0);

		this.preloadGame = this.add.sprite(this.game.config.width / 2, this.game.config.height / 2, "preloadGame");

		this.anims.create({
			key: "screens",
			frames: this.anims.generateFrameNames("preloadGame"),
			frameRate: 1,
			repeat: 0,
		});
		this.anims.play("screens", this.preloadGame);
		this.preloadGame.on("animationcomplete", this.startPlayGame);
	}

	startPlayGame = () => {
		this.scene.start("Game");
	};
}
