import Phaser3 from "phaser";

export default class Bullet extends Phaser3.GameObjects.Sprite {
	constructor(scene, x, y, texture, damage, originY) {
		super(scene, x, y, texture);
		this.scene = scene;
		this.textureName = texture;
		this.damage = damage || 1;
		this.originY = originY || 0;
		this.scene.add.existing(this);
		this.scene.physics.add.existing(this);
		this.initialization();
	}

	initialization() {
		this.setOrigin(0.5, this.originY);
		this.setAlive(false);
		this.scene.events.on("update", this.checkUpdate, this);
		this.createAnimations(this.textureName);
		this.anims.play(this.textureName);
	}

	checkUpdate() {
		if (this.active && this.isDead()) {
			this.setAlive(false);
		}
	}

	updateOff() {
		this.scene.events.off("update", this.checkUpdate, this);
	}

	createAnimations(key) {
		this.scene.anims.create({
			key,
			frames: this.scene.anims.generateFrameNumbers(key, { start: 0, end: this.frame.texture.frameTotal - 2 }),
			frameRate: 6,
			repeat: -1,
		});
	}

	isDead() {
		return this.body.y + this.body.height < 100 || this.body.y > this.scene.game.config.height;
	}

	setAlive(status) {
		this.body.enable = status;
		this.setVisible(status);
		this.setActive(status);
	}

	death() {
		this.setAlive(false);
	}

	resurrection(data) {
		this.body.reset(data.startX, data.startY);
		this.setAlive(true);
		this.body.setVelocityY(data.speed);
		this.body.setVelocityX(data.sideSpeed);
	}
}
