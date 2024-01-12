import Phaser3 from "phaser";
import Explosion from "./Explosion";
import BulletsGroup from "./BulletsGroup";

export default class Boss extends Phaser3.GameObjects.Sprite {
	constructor(scene, x, y, texture) {
		super(scene, x, y, texture);
		this.scene = scene;
		this.defaultX = x;
		this.defaultY = y;
		this.texture = texture;
		this.bossBullets = new BulletsGroup(this.scene, "bossShot");
		this.scene.add.existing(this);
		this.scene.physics.add.existing(this);
		this.initialization();
	}

	initialization() {
		this.setOrigin(0.5, 1);
		this.body.enable = true;
		this.body.allowGravity = false;
		this.triggered = false;
		this.body.setVelocityX(this.scene.ENEMY_BONUS_VELOCITY());
		this.body.setBounce(1, 1);
		this.body.setCollideWorldBounds(true);
		this.bossShootLoop();

		this.scene.anims.create({
			key: "bossFly",
			frames: this.scene.anims.generateFrameNumbers(this.texture, { start: 0, end: 1 }),
			frameRate: 6,
			repeat: -1,
		});
		this.scene.anims.create({
			key: "bossFlyDamaged",
			frames: this.scene.anims.generateFrameNumbers(this.texture, { start: 1, end: 2 }),
			frameRate: 6,
			repeat: -1,
		});
		this.anims.play("bossFly");
	}

	bossShootLoop() {
		const bossShoot = () => {
			const tempSpeed = this.body.velocity.x;
			this.body.setVelocityX(0);
			this.fire();
			this.scene.time.delayedCall(
				200,
				() => {
					this.body.setVelocityX(tempSpeed);
					this.scene.time.delayedCall(Phaser3.Math.Between((1 + 1 / this.scene.diff) * 1000, 2000), bossShoot, [], this);
				},
				[],
				this
			);
		};
		this.scene.time.delayedCall(Phaser3.Math.Between((1 + 1 / this.scene.diff) * 1000, 2000), bossShoot, [], this);
	}

	fire() {
		const initData = {
			startX: this.body.x + this.body.halfWidth,
			startY: this.body.y + this.body.height,
			speed: this.scene.ENEMY_BONUS_VELOCITY(),
		};
		this.bossBullets.shot(initData);
	}

	takeDamage(damage) {
		const limitedDamage = this.scene.bossHealth <= 1 ? 1 : damage;
		this.scene.bossHealth -= limitedDamage;
		this.scene.decrementBossLives(limitedDamage);
		if (this.scene.bossHealth <= 0 && !this.triggered) {
			this.triggered = true;
			this.death();
		} else {
			this.anims.play("bossFlyDamaged", true);
			this.damageTimer = this.scene.time.addEvent({
				delay: 300,
				callback: () => {
					this.anims.play("bossFly", true);
				},
				loop: false,
			});
		}
	}

	death() {
		Explosion.generate(this.scene, this.x + this.body.halfWidth, this.body.y + this.body.halfHeight);
		this.scene.rewards.createReward(this.x + this.body.halfWidth, this.body.y + this.body.halfHeight);
		this.body.enable = false;
		this.setActive(false);
		this.setVisible(false);
		this.scene.destroyGame(3);
	}
}
