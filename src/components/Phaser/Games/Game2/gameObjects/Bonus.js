import Phaser3 from "phaser";

export default class Bonus extends Phaser3.GameObjects.Sprite {
	constructor(scene, x, y, texture) {
		super(scene, x, y, texture);
		this.type = texture;
		this.scene.add.existing(this);
		this.scene.physics.add.existing(this);
		this.setAlive(false);
	}

	checkUpdate() {
		if (this.active && this.body.y > this.scene.game.config.height) {
			this.death();
		}
	}

	death() {
		this.setAlive(false);
		this.scene.events.off("update", this.checkUpdate, this);
		this.destroy();
	}

	move() {
		this.body.setVelocityY(this.scene.ENEMY_BONUS_VELOCITY());
	}

	setAlive(status) {
		this.body.enable = status;
		this.setVisible(status);
		this.setActive(status);
	}

	spawn(x, y) {
		this.setAlive(true);
		this.body.reset(x, y);
		this.move();
		this.scene.events.on("update", this.checkUpdate, this);
	}
}
