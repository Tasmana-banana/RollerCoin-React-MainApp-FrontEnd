import Phaser3 from "phaser";

export default class Pipe extends Phaser3.GameObjects.Sprite {
	constructor(scene, x, y, texture, isFlipped) {
		super(scene, x, y, texture);
		this.isFlipped = isFlipped;
		this.scene = scene;
		this.scene.add.existing(this);
		this.scene.physics.add.existing(this);
		this.initialization();
	}

	initialization() {
		this.setOrigin(0, this.isFlipped ? 1 : 0);
		this.setFlipY(this.isFlipped);
		this.setAlive(true);
		this.isWithScore = this.isFlipped;
		this.scene.events.on("update", this.checkUpdate, this);
	}

	checkUpdate() {
		if (this.active && this.isWithScore && this.body.x + this.body.width < this.scene.player.x) {
			this.isWithScore = false;
			this.scene.addScore();
		}
		if (this.active && this.body.x + this.body.width < 0) {
			this.setAlive(false);
		}
	}

	updateOff() {
		this.scene.events.off("update", this.checkUpdate, this);
	}

	setAlive(status) {
		this.body.enable = status;
		this.setVisible(status);
		this.setActive(status);
	}

	spawn(x, y, texture, isFlipped) {
		this.setAlive(true);
		this.body.reset(x, y);
		this.setTexture(texture);
		this.setFlipY(isFlipped);
		this.isWithScore = isFlipped;
	}
}
