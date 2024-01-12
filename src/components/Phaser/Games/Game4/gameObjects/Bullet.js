import Phaser from "phaser";

export default class Bullet extends Phaser.GameObjects.Sprite {
	constructor(scene, data) {
		super(scene, data.x, data.y, data.texture);
		this.scene = scene;
		this.start = { x: data.x, y: data.y };
		this.textureName = data.texture;
		this.scene.add.existing(this);
		this.scene.physics.add.existing(this);
		this.bulletSpeed = 600;
		this.initialization();
	}

	initialization() {
		this.scene.events.on("update", this.checkUpdate, this);
		this.setDepth(103);
		this.body.setVelocityY(-this.bulletSpeed);
		this.body.setBounce(1, 1);
		this.body.setCollideWorldBounds(true);
		this.body.setImmovable(true);

		this.scene.physics.add.collider(this, this.scene.Blocks, this.bulletCollideBlocks, null, this);
	}

	checkUpdate() {
		if (this.y < 102) {
			this.destroy();
		}
	}

	bulletCollideBlocks(bullet, block) {
		if (block.health === 1) {
			this.scene.killBlock(block);
		}
		if (block.health > 1) {
			block.health -= 1;
			block.playAnim(`block${block.maxHealth}_flash_${block.maxHealth - block.health}`);
		}
		bullet.destroy();
	}
}
