import Phaser3 from "phaser";

export default class Reward extends Phaser3.GameObjects.Sprite {
	constructor(scene, x, y, texture) {
		super(scene, x, y, texture);
		this.setDepth(11);
		this.scene.add.existing(this);
		this.scene.physics.add.existing(this);
		this.setAlive(false);
	}

	death() {
		this.setAlive(false);
		this.scene.rewards.isAllDead();
	}

	move() {
		this.scene.physics.moveToObject(this, this.scene.scoreText, 500);
	}

	setAlive(status) {
		this.body.enable = status;
		this.setVisible(status);
		this.setActive(status);
	}

	respawn(x, y) {
		this.body.reset(x, y);
		this.setAlive(true);
	}
}
