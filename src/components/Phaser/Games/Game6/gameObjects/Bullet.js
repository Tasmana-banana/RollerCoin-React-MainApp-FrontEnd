import Phaser3 from "phaser";

class Bullet extends Phaser3.GameObjects.Sprite {
	constructor(scene, x, y) {
		super(scene, x, y, "bullet");
		this.scene = scene;
		this.start = { x, y };
		this.textureName = "bullet";
		this.scene.add.existing(this);
		this.scene.physics.add.existing(this);
		this.initialization();
	}

	initialization() {
		this.setOrigin(0.5);
		this.checkWorldBounds = true;
		this.outOfBoundsKill = true;
	}
}

export default Bullet;
