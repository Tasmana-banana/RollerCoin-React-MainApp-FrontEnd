import Phaser3, { Scene } from "phaser";
import config from "../config/config";

export default class ErrorScreen extends Scene {
	constructor() {
		super({ key: "ErrorScreen" });
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
		const centerX = width / 2;
		this.add.image(centerX, 270, "error_icon").setOrigin(0.5);
		this.add.text(centerX, 380, "Something went wrong", config.redBoldTitleFont).setOrigin(0.5);
		this.add.text(centerX, 450, "Please refresh the page", config.defaultFont).setOrigin(0.5);
		this.add.text(centerX, 510, "If the problem persists, contact support", config.defaultFont).setOrigin(0.5);
		this.add.text(centerX, 570, "support@rollercoin.com", config.defaultPriceFont).setOrigin(0.5);
	}
}
