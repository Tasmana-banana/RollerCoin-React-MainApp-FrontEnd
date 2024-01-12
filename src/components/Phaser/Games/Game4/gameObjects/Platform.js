import Phaser from "phaser";
import Weapon from "./Weapon";

export default class Platform extends Phaser.GameObjects.Sprite {
	constructor(scene, data) {
		super(scene, data.x, data.y, data.texture);
		this.scene = scene;
		this.start = { x: data.x, y: data.y };
		this.textureName = data.texture;
		this.scene.add.existing(this);
		this.scene.physics.add.existing(this);
		this.initialization();
	}

	initialization() {
		this.body
			.setCollideWorldBounds(true)
			.setImmovable(true)
			.setSize(this.body.width - 4, this.body.height - 12, true);
		this.body.checkCollision.down = false;
		this.scene.anims.create({
			key: "flash_platform",
			frames: this.scene.anims.generateFrameNumbers(this.textureName, { start: 1, end: 0 }),
			frameRate: 12,
			repeat: 0,
		});

		this.createSlimeSkin();
		this.createFireballSkin();
		this.createWeapon();
	}

	createSlimeSkin() {
		this.skinsWidth = this.scene.textures.get("slime_platform").getSourceImage().width;
		this.skinsHeight = this.scene.textures.get("slime_platform").getSourceImage().height;
		this.slimeSkin = this.scene.add.image(this.body.x + this.skinsWidth / 2 + 27, this.body.y + this.skinsHeight / 2 + 6, "slime_platform");
		this.slimeSkin.setVisible(false);
	}

	createFireballSkin() {
		this.fireballSkin = this.scene.add.image(this.body.x + this.skinsWidth / 2 + 27, this.body.y + this.skinsHeight / 2 + 6, "flame_platform");
		this.fireballSkin.setVisible(false);
	}

	createWeapon() {
		this.weapon = new Weapon(this.scene, {
			x: this.body.x,
			y: this.body.y,
			width: this.width,
			height: this.height,
		});
	}

	updateSkinsPosition(x) {
		this.slimeSkin.setX(x + this.skinsWidth / 2 + 27);
		this.fireballSkin.setX(x + this.skinsWidth / 2 + 27);
		this.weapon.setX(x);
	}

	toggleSlimeVisible(bool) {
		this.slimeSkin.setVisible(bool);
	}

	toggleFireballVisible(bool) {
		this.fireballSkin.setVisible(bool);
	}
}
