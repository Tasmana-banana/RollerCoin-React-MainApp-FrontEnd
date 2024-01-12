import Phaser3 from "phaser";

export default class Card extends Phaser3.GameObjects.Sprite {
	constructor(scene, value) {
		super(scene, 0, 0, value);
		this.scene = scene;
		this.value = value;
		this.scene.add.existing(this);
		this.isOpened = false;
		this.setInteractive({ useHandCursor: true });
	}

	init(position) {
		this.position = position;
		this.setPosition(this.position.x, this.position.y).setOrigin(0, 0);

		this.scene.anims.create({
			key: `${this.value}spin`,
			frames: this.scene.anims.generateFrameNumbers(this.value, { start: 0, end: 1 }),
			frameRate: 8,
			repeat: -1,
		});
		this.scene.anims.create({
			key: `${this.value}hover`,
			frames: this.scene.anims.generateFrameNumbers(this.value, { start: 2, end: 3 }),
			frameRate: 8,
			repeat: -1,
		});
		this.scene.anims.create({
			key: `${this.value}flipToFront`,
			frames: this.scene.anims.generateFrameNumbers(this.value, { frames: [0, 1, 4, 5, 6, 7] }),
			frameRate: 14,
			repeat: 0,
		});
		this.scene.anims.create({
			key: `${this.value}flipToBack`,
			frames: this.scene.anims.generateFrameNumbers(this.value, { frames: [7, 6, 5, 4, 1, 0] }),
			frameRate: 14,
			repeat: 0,
		});
		this.scene.anims.create({
			key: `${this.value}shine`,
			frames: this.scene.anims.generateFrameNumbers(this.value, { frames: [7, 8, 9, 10, 11] }),
			frameRate: 8,
			repeat: 0,
		});
		this.startIdle();
	}

	startIdle() {
		this.pointover = this.on("pointerover", () => this.anims.play(`${this.value}hover`), this);
		this.pointerout = this.on("pointerout", () => this.anims.play(`${this.value}spin`), this);
		this.anims.play(`${this.value}spin`);
	}

	open() {
		this.isOpened = true;
		this.pointover.off("pointerover");
		this.pointerout.off("pointerout");
		this.anims.play(`${this.value}flipToFront`);
	}

	close() {
		this.anims.play(`${this.value}flipToBack`);
		this.on(`animationcomplete-${this.value}flipToBack`, () => {
			this.isOpened = false;
			this.startIdle();
		});
	}

	collapse() {
		this.anims.play(`${this.value}shine`);
		this.on(`animationcomplete-${this.value}shine`, () => {
			this.destroy(true);
		});
	}
}
