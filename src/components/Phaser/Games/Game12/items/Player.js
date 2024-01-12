import Phaser3 from "phaser";

export default class Player extends Phaser3.GameObjects.Sprite {
	constructor(scene, x, y, color, isRotating) {
		super(scene, x, y, isRotating);
		this.scene = scene;
		this.start = { x, y };
		this.color = color;
		this.isRotating = isRotating;
		this.scene.add.existing(this);
		this.scene.physics.add.existing(this);
		this.createPlayer();
	}

	createPlayer = () => {
		this.setTexture("hamsters", `${this.color}${this.isRotating ? "-shadow" : ""}`);
		this.setOrigin(0.5, 0.5).setScale(4).setDepth(4);
		this.body.enable = true;
		this.body.allowGravity = false;
		this.body.setSize(22, 22); // for a square form and ignore the shadow
	};

	setRotating = (boolean) => {
		this.isRotating = boolean;
		this.setTexture("hamsters", `${this.color}${this.isRotating ? "-shadow" : ""}`);
	};

	failure = () => {
		this.scene.isPlayerDead = true;
		const secondPlayer = this.scene.players[1 - this.scene.rotatingPlayer];
		const playerSide = this.x > secondPlayer.x ? 1 : -1;
		this.setTexture("hamsters", this.color);

		this.scene.tweens.add({
			targets: this,
			props: {
				angle: {
					value: 15 * playerSide,
					duration: 500,
					ease: "Sine.out",
				},
				y: {
					value: this.y + 600,
					duration: 1000,
					ease: "Sine.in",
				},
				x: {
					value: this.x + 40 * playerSide,
					duration: 600,
					ease: "Sine.out",
				},
			},
			repeat: 0,
			onComplete: () => {
				this.setTexture("hamsters", `${this.color}${this.isRotating ? "-shadow" : ""}`);
				this.setAngle(0);
				this.scene.activatePlayer();
			},
		});

		const anger = this.scene.add
			.image(this.x + 30 * playerSide, this.y - 40, "anger")
			.setOrigin(0.5, 0.5)
			.setDepth(6);

		this.scene.tweens.add({
			targets: anger,
			props: {
				y: {
					value: this.y + 560 + 10 * playerSide,
					duration: 1000,
					ease: "Sine.in",
				},
				x: {
					value: this.x + 75 * playerSide,
					duration: 600,
					ease: "Sine.out",
				},
				scale: {
					value: { from: 0, to: 6 },
					duration: 300,
					ease: "Sine.easeOut",
					yoyo: true,
				},
			},
			repeat: 0,
			onComplete: () => {
				anger.destroy();
			},
		});

		const drop = this.scene.add
			.image(secondPlayer.x + 25, secondPlayer.y - 55, "drop")
			.setOrigin(0.5, 0.5)
			.setScale(4)
			.setDepth(6);

		this.scene.tweens.add({
			targets: drop,
			y: drop.y + 30,
			duration: 1000,
			ease: "Sine.out",
			repeat: 0,
			onComplete: () => {
				drop.destroy();
			},
		});
	};
}
