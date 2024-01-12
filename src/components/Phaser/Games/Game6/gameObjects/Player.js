import Phaser3 from "phaser";

export default class Player extends Phaser3.GameObjects.Sprite {
	constructor(scene, x, y) {
		super(scene, x, y, "player");
		this.start = { x, y };
		this.scene = scene;
		this.textureName = "player";
		this.scene.add.existing(this);
		this.scene.physics.add.existing(this);
		this.scene.events.on("update", this.checkUpdate, this);
		this.initialization();
	}

	initialization() {
		this.setDepth(13);
		this.alive = true;
		this.body.setEnable(true);
		this.body.setAllowGravity(true);
		this.body.setMaxVelocity(this.scene.MAX_ACCELERATION - this.scene.ACCELERATION, 1080);
		this.body.setGravityY(1900);
		this.setOrigin(0.5);
		this.lazergun = this.scene.add
			.sprite(this.x + 23, this.y - 6, "lazergun")
			.setOrigin(0.5)
			.setDepth(14)
			.setVisible(false);
		this.fire = this.scene.add
			.sprite(this.x, this.y + this.body.halfHeight, "fire")
			.setOrigin(0.5)
			.setDepth(12)
			.setVisible(true);
		this.fire.play("burn");
		this.body.checkCollision.up = false;
		this.body.setSize(this.body.width, 102, 0, 0); // body hitbox without flame
		this.body.setVelocityY(-1080);
		this.health = this.scene.DEFAULT_PLAYER_HEALTH;
		this.invulnerability = false;
		this.cursors = this.scene.input.keyboard.createCursorKeys();
		this.createControls();
	}

	checkUpdate() {
		this.move();
	}

	createControls() {
		this.scene.input.on(
			"pointerdown",
			() => {
				const action = this.checkTapPosition(this.scene.input.x);
				switch (action) {
					case "left":
						this.cursors.left.isDown = true;
						break;
					case "right":
						this.cursors.right.isDown = true;
						break;
					case "shoot":
						this.shoot();
						break;
					default:
						break;
				}
			},
			this
		);
		this.scene.input.on(
			"pointerup",
			() => {
				this.cursors.left.isDown = false;
				this.cursors.right.isDown = false;
			},
			this
		);
		this.scene.input.keyboard.on("keydown_UP", this.shoot, this);
		this.scene.input.keyboard.on("keydown_SPACE", this.shoot, this);
	}

	checkTapPosition(x) {
		const widthForTapEvent = Math.round(this.scene.game.config.width / 3);
		const intervalsTap = {
			left: {
				min: 0,
				max: widthForTapEvent,
			},
			shoot: {
				min: widthForTapEvent,
				max: widthForTapEvent * 2,
			},
			right: {
				min: widthForTapEvent * 2,
				max: widthForTapEvent * 3,
			},
		};
		let action = "";
		Object.keys(intervalsTap).forEach((key) => {
			if (x > intervalsTap[key].min && x < intervalsTap[key].max) {
				action = key;
			}
		});
		return action;
	}

	shoot() {
		if (!this.lazergun.visible) {
			this.lazergun.setVisible(true);
			this.scene.spawnBullet(this.x + 24, this.y);
			this.shootTimer = this.scene.time.delayedCall(
				300,
				() => {
					this.lazergun.setVisible(false);
				},
				this
			);
		}
	}

	move() {
		if (!this.body) {
			return;
		}
		this.lazergun.setPosition(this.x + 23, this.y - 6);
		if (!this.cursors.left.isDown && !this.cursors.right.isDown) {
			this.fire.setPosition(this.x, this.y + this.body.halfHeight);
		}
		if (this.cursors.left.isDown) {
			if (this.body.velocity.x > 0) {
				this.body.setVelocityX(0);
			} else {
				this.body.setVelocityX(this.body.velocity.x - this.scene.ACCELERATION);
			}
			this.fire.setPosition(this.x - 5, this.y + this.body.halfHeight);
		} else if (this.cursors.right.isDown) {
			if (this.body.velocity.x < 0) {
				this.body.setVelocityX(0);
			} else {
				this.body.setVelocityX(this.body.velocity.x + this.scene.ACCELERATION);
			}
			this.fire.setPosition(this.x + 5, this.y + this.body.halfHeight);
		} else if (!this.cursors.right.isDown && !this.cursors.left.isDown && this.body?.velocity.x !== 0) {
			if (Math.abs(this.body.velocity.x) >= this.scene.ACCELERATION) {
				this.body.setVelocityX(this.body.velocity.x - Math.sign(this.body.velocity.x) * this.scene.ACCELERATION);
			}
		}

		if (this.body.velocity.y >= 0) {
			this.fire.setVisible(false);
		}
		if (!this.timerHamsterChangeFrame) {
			this.setFrame(2);
		}

		if (this.y < 0.38 * this.scene.game.config.height && this.alive) {
			this.scene.moveScreen(this.y - 0.38 * this.scene.game.config.height);
		}
	}

	collideObstacle(hero, obstacle) {
		if (this.body.touching.down && obstacle.body.touching.up) {
			obstacle.takeDamage(1);

			// because phaser is strange and we need to copy that code (obstacle.body bug)
			if (!this.timerHamsterChangeFrame) {
				this.setFrame(0);
				this.timerHamsterChangeFrame = this.scene.time.delayedCall(
					35,
					() => {
						this.setFrame(1);
						this.fire.setVisible(true);
						this.fire.play("burn");
						this.body.setVelocityY(-1080);
						this.timerHamsterChangeFrame = 0;
					},
					this
				);
				this.timerHamsterChangeFrame.autoDestroy = true;
			}
		} else if (!this.invulnerability) {
			this.takeDamage();
		}
	}

	jump(hero, platform) {
		const fakePlatform = [2];
		if (this.body.touching.down && platform?.body?.touching?.up) {
			if (!fakePlatform.includes(platform.type)) {
				if (!this.timerHamsterChangeFrame) {
					this.setFrame(0);
					this.timerHamsterChangeFrame = this.scene.time.delayedCall(
						35,
						() => {
							this.setFrame(1);
							this.fire.setVisible(true);
							this.fire.play("burn");
							this.body.setVelocityY(-1080);
							this.timerHamsterChangeFrame = 0;
						},
						this
					);
					this.timerHamsterChangeFrame.autoDestroy = true;
				}
				if (platform.type === 1) {
					platform.body.setVelocityX(0);
					platform.body.setVelocityY(440);
					platform.play("destroy1");
					this.scene.time.delayedCall(
						300,
						() => {
							platform.destroy();
						},
						this
					).autoDestroy = true;
				}
			}
			if (platform.type === 2) {
				platform.body.setVelocityY(440);
				platform.play("destroy2");
				this.scene.time.delayedCall(
					300,
					() => {
						platform.destroy();
					},
					this
				).autoDestroy = true;
			}
		}
	}

	takeDamage() {
		if (this.health <= 1) {
			return this.scene.destroyGame(2);
		}
		this.scene.decrementLivesSprite();
		this.invulnerability = true;
		this.setPosition(this.scene.game.config.width / 2, this.scene.game.config.height - this.height - 100);
		this.body.setVelocityY(-1080);
		this.health -= 1;
		this.alpha = 0;
		this.body.allowGravity = true;
		this.scene.add.tween({
			targets: this,
			alpha: 1,
			duration: 120,
			ease: "Linear",
			autoStart: true,
			delay: 0,
			repeat: 3,
			yoyo: true,
			onComplete: () => {
				this.setAlpha(1);
				this.invulnerability = false;
			},
		});
	}
}
