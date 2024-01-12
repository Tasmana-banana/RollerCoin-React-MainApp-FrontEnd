import Phaser3 from "phaser";
import Explosion from "../../Game2/gameObjects/Explosion";

export default class Player extends Phaser3.GameObjects.Sprite {
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
		this.setOrigin(0.5, 0.5)
			.setScale(0.7, 0.7)
			.setDepth(1);
		this.body.enable = true;
		this.body.allowGravity = false;
		this.body.gravity.y = this.scene.GRAVITY;
		this.body.collideWorldBounds = true;
		this.createEmitter();
		// Player control
		this.disableControl = false;
		this.keySpace = this.scene.input.keyboard.addKey("SPACE");
		this.keySpace.on("down", this.jump, this);
		this.scene.input.on("pointerdown", this.jump, this);
		// create animations
		this.scene.anims.create({
			key: "fly",
			frames: this.scene.anims.generateFrameNumbers(this.textureName, { start: 0, end: 3 }),
			frameRate: 8,
			repeat: -1,
		});
		this.anims.play("fly");
		this.scene.time.delayedCall(
			300,
			() => {
				this.body.allowGravity = true;
			},
			this
		);
		this.scene.events.on("update", this.checkUpdate, this);
	}

	checkUpdate() {
		if (this.angle < 20 && this.body.allowGravity) {
			this.angle += 1;
		}
		if (!this.disableControl) {
			this.emitter.setAngle(this.angle - 180);
			this.emitter.setPosition(15, 40 - this.angle * 1.1);
		} else {
			this.angle = 0;
			this.emitter.setAngle(-180);
			this.emitter.setPosition(15, 40);
		}
	}

	createEmitter() {
		const particles = this.scene.add.particles("smoke");
		this.emitter = particles.createEmitter({
			follow: this.body,
			frame: [0, 1, 2],
			x: 15,
			y: 40,
			lifespan: 300,
			speed: 500,
			angle: 180,
			gravityY: 100,
			scale: { start: 0.8, end: 0 },
			alpha: { start: 0.8, end: 0 },
			frequency: 3,
			blendMode: "NORMAL",
		});
	}

	onDamagePlayer() {
		this.scene.playerHealth -= 1;
		this.disableControl = true;
		this.body.allowGravity = false;
		this.scene.playerInvulnerability = true;
		this.emitter.stop();
		this.setAlpha(0);
		Explosion.generate(this.scene, this.body.x + this.body.halfWidth, this.body.y + this.body.halfHeight);
		if (this.scene.playerHealth <= 0) {
			this.scene.time.delayedCall(
				250,
				() => {
					this.scene.destroyGame(2);
				},
				this
			);
			return false;
		}
		this.scene.time.delayedCall(
			500,
			() => {
				this.resurrection();
			},
			this
		);
	}

	resurrection() {
		this.body.reset(0, this.scene.physics.world.bounds.centerY);
		this.emitter.start();
		const tweenMove = this.scene.tweens.add({
			targets: this,
			x: 200,
			ease: "Linear",
			duration: 300,
		});
		const tweenFlashing = this.scene.tweens.add({
			targets: this,
			alpha: { from: 0, to: 1 },
			ease: "Linear",
			duration: 100,
			repeat: -1,
			yoyo: true,
		});
		tweenMove.once("complete", () => {
			this.disableControl = false;
			this.scene.time.delayedCall(
				200,
				() => {
					this.body.allowGravity = true;
				},
				this
			);
			this.scene.time.delayedCall(
				800,
				() => {
					this.setAlpha(1);
					tweenFlashing.stop();
					this.scene.playerInvulnerability = false;
				},
				this
			);
		});
	}

	jump() {
		if (!this.disableControl) {
			if (!this.body.allowGravity) {
				this.body.allowGravity = true;
			}
			this.body.setVelocityY(-this.scene.BIRD_FLAP);
			this.playerAngleTween = this.scene.tweens.add({
				targets: this,
				props: { angle: -20 },
				ease: "Linear",
				duration: 100,
			});
		}
	}
}
