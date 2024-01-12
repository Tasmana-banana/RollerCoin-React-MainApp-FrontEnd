import Phaser3 from "phaser";
import gameObjectMixin from "../mixins/gameObjectMixin";

// alien0 = Ufo on platform
// alien1 = Alien on playform
// alien2 = Ufo without platform

class Obstacle extends Phaser3.GameObjects.Sprite {
	constructor(scene, x, y, type, scoreNow, prevPlatform) {
		super(scene, x, y, "alien0");
		this.scene = scene;
		this.type = type;
		this.scene.add.existing(this);
		this.scene.physics.add.existing(this);
		this.scene.events.on("update", this.checkUpdate, this);
		this.scene.obstaclePool.add(this);
		this.initialization(x, y, scoreNow, prevPlatform);
	}

	initialization(x, y, scoreNow, prevPlatform) {
		this.setOrigin(0.5, 0.5);
		this.setScale(0.9, 0.9);
		this.alive = true;
		this.setDepth(10);
		this.body.setEnable(true);
		this.body.setVelocityX(0);
		this.setTexture(`alien${this.type}`);
		this.body.setSize(this.width, this.height, 0, 0);
		this.body.allowGravity = false;
		this.body.immovable = true;
		this.health = 1;
		if (this.type === 2) {
			this.health = 2;
		}
		if (this.type === 1) {
			if (prevPlatform && prevPlatform.moving) {
				this.type = 0;
				this.setTexture(`alien0`);
			} else {
				this.play("stay");
			}
		}

		if (this.type === 0 || this.type === 2) {
			this.movingItems(scoreNow);
		}
	}

	takeDamage() {
		this.health -= 1;
		if (this.health <= 0) {
			this.destroy();
		}
	}

	checkUpdate() {
		this.changeDirection();
	}
}

Object.assign(Obstacle.prototype, gameObjectMixin);

export default Obstacle;
