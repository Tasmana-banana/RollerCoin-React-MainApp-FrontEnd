import Phaser from "phaser";

export default class BlockContainer extends Phaser.GameObjects.Container {
	constructor(scene, data) {
		super(scene, data.x, data.y);
		this.scene = scene;
		this.start = { x: data.x, y: data.y };
		this.maxHealth = data.health;
		this.health = data.health;
		this.scene.add.existing(this);
		this.scene.physics.add.existing(this);
		this.initialization();
	}

	initialization() {
		const { width, height } = this.scene.textures.get("block1").getSourceImage();
		this.setSize(width, height);
	}

	playAnim(animFrame) {
		this.getFirst().anims.play(animFrame);
	}
}
