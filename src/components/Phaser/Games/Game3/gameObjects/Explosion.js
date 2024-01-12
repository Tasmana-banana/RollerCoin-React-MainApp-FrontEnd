import Phaser3 from "phaser";

export default class Explosion extends Phaser3.GameObjects.Sprite {
	static generate(scene, x, y) {
		return new Explosion({ scene, x, y });
	}

	constructor(data) {
		super(data.scene, data.x, data.y, "explosion", 0);
		this.scene.add.existing(this);
		this.scene.anims.create({
			key: "explosion",
			frames: this.scene.anims.generateFrameNumbers("explosion", { start: 0, end: 11 }),
			frameRate: 30,
			repeat: 0,
		});
		this.anims.play("explosion");
		this.once(Phaser3.Animations.Events.SPRITE_ANIMATION_COMPLETE, () => {
			this.destroy();
		});
	}
}
