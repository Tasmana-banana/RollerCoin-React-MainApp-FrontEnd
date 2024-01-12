import Phaser3, { Scene } from "phaser";

export default class Loader extends Scene {
	constructor() {
		super({ key: "Loader" });
	}

	create() {
		const { width, height } = this.game.config;
		const graphics = this.add.graphics();
		const color = 0x000000;
		const alpha = 0.3;
		graphics.fillStyle(color, alpha);
		graphics.fillRect(0, 0, width, height);
		graphics.setInteractive(new Phaser3.Geom.Rectangle(0, 0, width, height), Phaser3.Geom.Rectangle.Contains);
		graphics.on("pointerdown", (pointer, x, y, event) => {
			event.stopPropagation();
		});
		const sprite = this.add.sprite(width / 2, height / 2, "loader");
		this.anims.create({
			key: "loader",
			frameRate: 6,
			repeat: -1,
			frames: this.anims.generateFrameNames("loader"),
		});
		sprite.play("loader");
	}
}
