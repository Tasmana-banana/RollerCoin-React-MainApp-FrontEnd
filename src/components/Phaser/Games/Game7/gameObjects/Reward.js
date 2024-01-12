import Phaser3 from "phaser";

export default class Reward extends Phaser3.GameObjects.Sprite {
	constructor(scene, config) {
		const { x, y, frame, damageValue } = config;
		super(scene, x, y, "coins", frame);
		this.scene = scene;

		this.alive = true;
		this.damageValue = damageValue;
		this.setOrigin(0.5);
		this.setVisible(true);
		this.setDepth(1000);
		this.scene.add.existing(this);
		this.scene.physics.add.existing(this);
	}
}
