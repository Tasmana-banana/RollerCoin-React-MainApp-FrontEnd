import Phaser3 from "phaser";

export default class RewardsGroup extends Phaser3.Physics.Arcade.Group {
	constructor(scene) {
		super(scene.physics.world, scene);
		this.scene = scene;
	}
}
