import Bullet from "./Bullet";

export default class Weapon {
	constructor(scene, data) {
		this.scene = scene;
		this.platformPositionX = data.x;
		this.platformPositionY = data.y;
		this.platformWidth = data.width;
		this.platformHeight = data.height;
		this.initialization();
	}

	initialization() {
		this.gunTexture = this.scene.textures.get("gun").getSourceImage();
		this.leftGun = this.scene.add.image(this.platformPositionX + this.gunTexture.width / 2, this.platformPositionY - 3, "gun");
		this.rightGun = this.scene.add.image(this.platformPositionX + this.platformWidth - this.gunTexture.width / 2, this.platformPositionY - 3, "gun");
		this.leftGun.setVisible(false);
		this.rightGun.setVisible(false);
	}

	activate() {
		this.leftGun.setVisible(true);
		this.rightGun.setVisible(true);
	}

	deactivate() {
		this.leftGun.setVisible(false);
		this.rightGun.setVisible(false);
	}

	setX(x) {
		this.leftGun.setX(x + this.gunTexture.width / 2);
		this.rightGun.setX(x + this.platformWidth - this.gunTexture.width / 2);
	}

	createBullets(x) {
		this.leftBullet = new Bullet(this.scene, { x: x + this.gunTexture.width / 2, y: this.platformPositionY - 3, texture: "bullet" });
		this.rightBullet = new Bullet(this.scene, { x: x + this.platformWidth - this.gunTexture.width / 2, y: this.platformPositionY - 3, texture: "bullet" });
	}
}
