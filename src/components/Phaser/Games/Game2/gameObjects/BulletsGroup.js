import Phaser3 from "phaser";
import Bullet from "./Bullet";

export default class BulletsGroup extends Phaser3.Physics.Arcade.Group {
	constructor(scene, type) {
		super(scene.physics.world, scene);
		this.scene = scene;
		this.bulletType = type;
		this.bulletsClip = 10;
		this.createBulletsGroup();
	}

	createBulletsGroup() {
		switch (this.bulletType) {
			case "singleShot":
				this.createBulletsPool("bullet", 1, 1, 0);
				break;
			case "doubleShot":
				this.createBulletsPool("bullet", 1, 2, 0);
				break;
			case "tripleShot":
				this.createBulletsPool("greenBullet", 1, 3, 0);
				break;
			case "waveShot":
				this.createBulletsPool("blueBullet", 2, 1, 0);
				break;
			case "enemyShot":
				this.createBulletsPool("alienBullet", 1, 1, 1);
				break;
			case "bossShot":
				this.createBulletsPool("bossFire", 1, 1, 1);
				break;
			default:
				break;
		}
	}

	createBulletsPool(texture, damage, volleyShots = 1, originY = 0) {
		for (let i = 0; i < this.bulletsClip * volleyShots; i += 1) {
			this.add(new Bullet(this.scene, 0, 0, texture, damage, originY));
		}
	}

	shot(data) {
		const initData = {
			startX: data.startX,
			startY: data.startY,
			sideSpeed: 0,
			speed: data.speed,
		};
		switch (this.bulletType) {
			case "singleShot":
				this.getFirstDead().resurrection(initData);
				break;
			case "doubleShot":
				initData.startX -= 40;
				this.getFirstDead().resurrection(initData);
				initData.startX += 80;
				this.getFirstDead().resurrection(initData);
				break;
			case "tripleShot":
				this.getFirstDead().resurrection(initData);
				initData.speed += 100;
				initData.sideSpeed = -300;
				this.getFirstDead().resurrection(initData);
				initData.sideSpeed = 300;
				this.getFirstDead().resurrection(initData);
				break;
			case "waveShot":
				this.getFirstDead().resurrection(initData);
				break;
			case "enemyShot":
				initData.speed = this.scene.ENEMY_BONUS_VELOCITY();
				this.getFirstDead().resurrection(initData);
				break;
			case "bossShot":
				initData.speed = this.scene.ENEMY_BONUS_VELOCITY();
				this.getFirstDead().resurrection(initData);
				break;
			default:
				break;
		}
	}

	stopEvents() {
		this.getChildren().forEach((bullet) => {
			bullet.updateOff();
		});
	}
}
