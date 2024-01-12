import Phaser3, { Scene } from "phaser";
import config from "../config/config";

const MAX_TEXT_IN_ROW_LENGTH = 1100;

export default class ConfirmationScreen extends Scene {
	constructor() {
		super({ key: "ConfirmationScreen" });
	}

	init(data) {
		this.yesCb = () => this.yesCallback(data.yesCb);
		this.noCb = data.noCb || this.shotDownScene;
		this.confirmationText = data.confirmationText;
	}

	shotDownScene = () => {
		this.scene.stop();
	};

	yesCallback = (callbackFromProps) => {
		callbackFromProps();
		this.shotDownScene();
	};

	create() {
		const { width, height } = this.game.config;
		const graphics = this.add.graphics();
		const color = 0x000000;
		const alpha = 0.6;
		graphics.fillStyle(color, alpha);
		graphics.fillRect(0, 0, width, height);
		graphics.setInteractive(new Phaser3.Geom.Rectangle(0, 0, width, height), Phaser3.Geom.Rectangle.Contains);
		graphics.on("pointerdown", (pointer, x, y, event) => {
			event.stopPropagation();
		});
		const centerX = width / 2;
		const image = this.add.image(centerX, 270, "confirm_icon").setOrigin(0.5);
		const mainText = this.add.text(centerX, image.y + 100, "Confirmation required", config.defaultTitleFont).setOrigin(0.5);
		const confirmText = this.make.text({
			x: centerX,
			y: mainText.y + 90,
			text: this.confirmationText,
			origin: { x: 0.5, y: 0.5 },
			style: {
				...config.defaultFont,
				align: "center",
				wordWrap: { width: MAX_TEXT_IN_ROW_LENGTH },
			},
		});
		const yesButton = this.add
			.image(centerX, confirmText.y + 105, "yes_button")
			.setInteractive({ cursor: "pointer" })
			.setOrigin(1, 0.5);
		yesButton.on("pointerup", this.yesCb);
		const cancelButton = this.add
			.image(yesButton.x + 20, yesButton.y, "no_button")
			.setInteractive({ cursor: "pointer" })
			.setOrigin(0, 0.5);
		cancelButton.on("pointerup", this.noCb);
	}
}
