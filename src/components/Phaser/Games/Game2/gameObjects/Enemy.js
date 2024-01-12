import Phaser3 from "phaser";
import Explosion from "./Explosion";

export default class Enemy extends Phaser3.GameObjects.Sprite {
	constructor(scene, x, y, texture, health, enemyBullets) {
		super(scene, x, y, texture);
		this.scene = scene;
		this.defaultX = x;
		this.defaultY = y;
		this.textureName = texture;
		this.defaultHealth = health;
		this.health = health;
		this.enemyBullets = enemyBullets;
		this.isMove = false;
		this.scene.add.existing(this);
		this.scene.physics.add.existing(this);
		this.scene.events.on("update", this.checkUpdate, this);
		this.initialization();
	}

	initialization() {
		this.setOrigin(0, 0);
		this.body.enable = true;
		this.body.allowGravity = false;
		this.body.setCollideWorldBounds();
		this.triggered = false;
		this.resurrection = this.resurrection.bind(this);

		this.scene.anims.create({
			key: `fly${this.textureName}`,
			frames: this.scene.anims.generateFrameNumbers(this.textureName, { start: 0, end: 1 }),
			frameRate: 6,
			repeat: -1,
		});
		this.scene.anims.create({
			key: `fly${this.textureName}Damaged`,
			frames: this.scene.anims.generateFrameNumbers(this.textureName, { start: 1, end: 2 }),
			frameRate: 8,
			repeat: -1,
		});
		this.anims.play(`fly${this.textureName}`);
	}

	createTween(range) {
		this.scene.tweens.add({
			targets: this,
			x: this.body.x + range,
			ease: "Linear",
			duration: 14 * range,
			repeat: -1,
			yoyo: true,
		});
	}

	checkUpdate() {
		if (this.isMove) {
			if (this.height + this.body.y >= this.scene.game.config.height && this.body.velocity.y > 0) {
				this.body.velocity.y *= -1;
				this.setFlipY(false);
			}
			if (this.body.y <= this.defaultY) {
				this.isMove = false;
				this.body.velocity.y = 0;
				this.body.y = this.defaultY;
			}
		}
	}

	updateOff() {
		this.scene.events.off("update", this.checkUpdate, this);
		if (this.damageTimer) {
			this.damageTimer.remove();
		}
	}

	setAlive(status) {
		this.body.enable = status;
		this.setVisible(status);
		this.setActive(status);
	}

	fire() {
		const initData = {
			startX: this.body.x + this.body.halfWidth,
			startY: this.body.y + this.body.height,
			speed: this.scene.ENEMY_BONUS_VELOCITY(),
		};
		this.enemyBullets.shot(initData);
	}

	attackMove() {
		this.isMove = true;
		this.setFlipY(true);
		this.body.setVelocityY(this.scene.ENEMY_BONUS_VELOCITY());
	}

	resurrection() {
		this.body.reset(this.body.x, this.defaultY);
		this.setAlive(true);
		this.health = this.defaultHealth;
		this.triggered = false;
		this.setFlipY(false);
		this.isMove = true;
		this.scene.time.delayedCall(
			500,
			() => {
				this.isMove = false;
			},
			[],
			this
		);
	}

	takeDamage(damage) {
		this.health -= damage;
		if (this.health <= 0) {
			this.death();
		} else {
			this.anims.play(`fly${this.textureName}Damaged`, true);
			this.damageTimer = this.scene.time.addEvent({
				delay: 300,
				callback: () => {
					this.anims.play(`fly${this.textureName}`, true);
				},
				loop: false,
			});
		}
	}

	death() {
		if (!this.triggered) {
			Explosion.generate(this.scene, this.body.x + this.body.halfWidth, this.body.y + this.body.halfHeight);
			if (!this.scene.isBossLevel) {
				this.scene.rewards.createReward(this.x + this.body.halfWidth, this.body.y + this.body.halfHeight);
			}
			this.scene.getBonus(this.x + this.body.halfWidth, this.body.y + this.body.halfHeight);
			this.setAlive(false);
			this.scene.enemies.calculateEnemies();
			this.triggered = true;
		}
	}
}
