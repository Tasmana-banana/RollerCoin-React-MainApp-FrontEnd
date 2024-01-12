import Phaser3 from "phaser";
import BulletsGroup from "./BulletsGroup";
import Explosion from "./Explosion";

export default class Spaceship extends Phaser3.GameObjects.Sprite {
	constructor(scene, data) {
		super(scene, data.x, data.y, data.texture, data.frame);
		this.start = { x: data.x, y: data.y };
		this.scene = scene;
		this.textureName = data.texture;
		this.scene.add.existing(this);
		this.scene.physics.add.existing(this);
		this.initialization();
	}

	initialization() {
		this.setOrigin(0.5, 1);
		this.setDepth(1);
		this.body.enable = true;
		this.body.allowGravity = false;
		this.body.collideWorldBounds = true;
		// default initialization stats
		this.body.setSize(this.body.width, 102, 0, 0); // body hitbox without flame
		this.body.setMaxVelocity(450, 0);
		this.acceleration = 50;
		this.fireRate = 500;
		this.bulletSpeed = -600;
		this.damaged = "";
		this.shotReady = true; // shot cooldown variable
		this.isActiveBonus = false;
		// create bullets groups
		this.singleShot = new BulletsGroup(this.scene, "singleShot");
		this.doubleShot = new BulletsGroup(this.scene, "doubleShot");
		this.tripleShot = new BulletsGroup(this.scene, "tripleShot");
		this.waveShot = new BulletsGroup(this.scene, "waveShot");
		this.weaponType = this.singleShot;
		// keyboard control
		this.cursors = this.scene.input.keyboard.createCursorKeys();
		// create all spaceship animations
		this.scene.anims.create({
			key: "fly",
			frames: this.scene.anims.generateFrameNumbers(this.textureName, { start: 5, end: 9 }),
			frameRate: 10,
			repeat: -1,
		});
		this.scene.anims.create({
			key: "turnLeft",
			frames: this.scene.anims.generateFrameNumbers(this.textureName, { start: 0, end: 4 }),
			frameRate: 10,
			repeat: -1,
		});
		this.scene.anims.create({
			key: "turnRight",
			frames: this.scene.anims.generateFrameNumbers(this.textureName, { start: 10, end: 14 }),
			frameRate: 10,
			repeat: -1,
		});
		this.scene.anims.create({
			key: "flyDamaged",
			frames: this.scene.anims.generateFrameNumbers(this.textureName, { start: 20, end: 24 }),
			frameRate: 10,
			repeat: -1,
		});
		this.scene.anims.create({
			key: "turnLeftDamaged",
			frames: this.scene.anims.generateFrameNumbers(this.textureName, { start: 15, end: 19 }),
			frameRate: 10,
			repeat: -1,
		});
		this.scene.anims.create({
			key: "turnRightDamaged",
			frames: this.scene.anims.generateFrameNumbers(this.textureName, { start: 25, end: 29 }),
			frameRate: 10,
			repeat: -1,
		});
		// start default animation
		this.anims.play("fly");
	}

	setWeaponBonus(weaponType) {
		if (this.isActiveBonus) {
			this.bonusTimer.remove();
		}
		this.isActiveBonus = true;
		switch (weaponType) {
			case "doubleShot":
				this.weaponType = this.doubleShot;
				break;
			case "tripleShot":
				this.weaponType = this.tripleShot;
				break;
			case "waveShot":
				this.weaponType = this.waveShot;
				break;
			default:
				this.weaponType = this.singleShot;
				break;
		}
		this.bonusTimer = this.scene.time.delayedCall(
			3000,
			() => {
				this.weaponType = this.singleShot;
				this.isActiveBonus = false;
			},
			[],
			this
		);
	}

	fire() {
		this.shotReady = false;
		const data = {
			startX: this.body.x + this.body.halfWidth,
			startY: this.body.y,
			speed: this.bulletSpeed,
		};
		this.weaponType.shot(data);
		this.scene.time.delayedCall(
			this.fireRate,
			() => {
				this.shotReady = true;
			},
			[],
			this
		);
	}

	onDamagePlayer() {
		if (!this.scene.playerIsImmortal) {
			this.scene.playerHealth -= 1;
		}
		if (this.scene.playerHealth <= 0) {
			Explosion.generate(this.scene, this.body.x + this.body.halfWidth, this.body.y + this.body.halfHeight);
			this.body.enable = false;
			this.setVisible(false);
			this.scene.destroyGame(2);
		} else {
			this.damaged = "Damaged";
			this.scene.time.addEvent({
				delay: 400,
				callback: () => {
					this.damaged = "";
				},
				loop: false,
			});
		}
	}

	playerControl() {
		// keyboard arrows move control
		if (this.cursors.left.isDown) {
			if (this.body.velocity.x > 0) {
				this.body.setVelocityX(this.body.velocity.x - this.acceleration * 2);
			} else {
				this.body.setVelocityX(this.body.velocity.x - this.acceleration);
			}
			this.anims.play(`turnLeft${this.damaged}`, true);
		} else if (this.cursors.right.isDown) {
			if (this.body.velocity.x < 0) {
				this.body.setVelocityX(this.body.velocity.x + this.acceleration * 2);
			} else {
				this.body.setVelocityX(this.body.velocity.x + this.acceleration);
			}
			this.anims.play(`turnRight${this.damaged}`, true);
		} else if (!this.cursors.right.isDown && !this.cursors.left.isDown && !this.scene.input.activePointer.isDown) {
			if (Math.abs(this.body.velocity.x) >= this.acceleration) {
				this.body.setVelocityX(this.body.velocity.x - Math.sign(this.body.velocity.x) * this.acceleration);
			}
			this.anims.play(`fly${this.damaged}`, true);
		}
		// mouse follow move control
		if (this.scene.input.activePointer.isDown) {
			const mouseAndShipDifference = this.scene.input.activePointer.x - this.body.x - this.body.width / 2;
			if (mouseAndShipDifference >= 25) {
				if (this.body.velocity.x < 0) {
					this.body.setVelocityX(this.body.velocity.x + this.acceleration * 2);
				} else {
					this.body.setVelocityX(this.body.velocity.x + this.acceleration);
				}
				this.anims.play(`turnRight${this.damaged}`, true);
			} else if (mouseAndShipDifference <= -25) {
				if (this.body.velocity.x > 0) {
					this.body.setVelocityX(this.body.velocity.x - this.acceleration * 2);
				} else {
					this.body.setVelocityX(this.body.velocity.x - this.acceleration);
				}
				this.anims.play(`turnLeft${this.damaged}`, true);
			} else if (mouseAndShipDifference < 25 && mouseAndShipDifference > -25) {
				this.body.setVelocityX(this.body.velocity.x - Math.sign(this.body.velocity.x) * this.acceleration);
				this.anims.play(`fly${this.damaged}`, true);
			}
		}
		// fire control
		if ((this.cursors.up.isDown || this.cursors.space.isDown || this.scene.input.activePointer.isDown) && this.shotReady) {
			this.fire();
		}
	}

	stopEvents() {
		this.singleShot.stopEvents();
		this.doubleShot.stopEvents();
		this.tripleShot.stopEvents();
		this.waveShot.stopEvents();
	}
}
