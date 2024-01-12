import Phaser from "phaser";

export default class Ball extends Phaser.GameObjects.Sprite {
	constructor(scene, data) {
		super(scene, data.x, data.y, data.texture);
		this.scene = scene;
		this.start = { x: data.x, y: data.y };
		this.textureName = data.texture;
		this.scene.add.existing(this);
		this.scene.physics.add.existing(this);
		this.lives = data.lives;
		this.initialization();
	}

	initialization() {
		this.setDepth(102);
		this.body.setBounce(1, 1);
		this.body.setCollideWorldBounds(true);
		this.body.onWorldBounds = true;
	}

	createDefault() {
		if (this.ballParticles) {
			this.destroyEmitter();
		}
		this.ballParticles = this.scene.add.particles("trail4");
		this.emitter = this.ballParticles.createEmitter({
			lifespan: 180,
			alpha: { start: 1, end: 0 },
			scale: { start: 0.8, end: 0 },
		});
		this.emitter.startFollow(this);
	}

	createSlime() {
		if (this.ballParticles) {
			this.destroyEmitter();
		}
		this.ballParticles = this.scene.add.particles("trail5");
		this.emitter = this.ballParticles.createEmitter({
			lifespan: 140,
			alpha: { start: 1, end: 0 },
			scale: { start: 0.8, end: 0 },
		});
		this.emitter.startFollow(this);
	}

	createFireball() {
		if (this.ballParticles) {
			this.destroyEmitter();
		}
		this.ballParticles = this.scene.add.particles("trail1");
		this.emitter = this.ballParticles.createEmitter({
			speed: 100,
			lifespan: 120,
			scale: { start: 0.8, end: 0.2 },
		});
		this.emitter.startFollow(this);
	}

	destroyEmitter() {
		this.emitter.stopFollow();
		this.ballParticles.destroy();
	}

	reduceLife() {
		this.lives -= 1;
	}

	addLife() {
		this.lives += 1;
	}
}
