import { Scene } from "phaser";
import scrollToElement from "../../../../services/scrollToElement";

export default class Boot extends Scene {
	constructor() {
		super({ key: "Boot", active: true });
	}

	create() {
		this.loadingText = this.add.text(0, 0, "Loading...", {
			font: '24px "Roboto"',
			fill: "#FFFFFF",
			stroke: "#000000",
			strokeThickness: 3,
			align: "center",
		});
		this.loadingText.setPosition(this.cameras.main.centerX, this.cameras.main.centerY);
		this.loadingText.setOrigin(0.5, 0.5);
		scrollToElement("#phaserGame", 0);
		this.scene.start("Preload");
	}
}
