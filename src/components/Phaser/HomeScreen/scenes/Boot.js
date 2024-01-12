import { Scene } from "phaser";

export default class Boot extends Scene {
	constructor() {
		super({ key: "Boot", active: true });
	}

	preload() {
		this.load.image("loadBlock", "/static/img/game/ui/load-block.png");
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
		this.scene.start("Preload");
	}
}
