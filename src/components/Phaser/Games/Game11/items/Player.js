import Phaser3 from "phaser";

export default class Player extends Phaser3.GameObjects.Sprite {
	constructor(scene, x, y) {
		super(scene, x, y, "playerMove1");
		this._scene = scene;
		this._scene.add.existing(this);
		this._scene.physics.add.existing(this);
		this.CAR_POSITION = {
			TOP: 500,
			MIDDLE: 590,
			BOTTOM: 680,
		};
		this.TURN_SPEED = 400;
		this.createPlayer();
		this.target = new Phaser3.Math.Vector2();
		this.target.x = x;
		this._scene.events.on("update", this.checkUpdate, this);
		this.isMoving = false;
		this.currentLayer = 2;
		this.lives = 3;
	}

	createPlayer = () => {
		this.setDepth(2);
		this.setOrigin(0.5, 0.5);
		this.body.enable = true;
		this.body.setSize(280, 60);
		this.body.setOffset(30, 50);
		this.createControl();
		this.createAnimation();
	};

	checkUpdate = () => {
		if (this.y < this.CAR_POSITION.TOP) {
			this.defaultMove();
			this.y = this.CAR_POSITION.TOP;
		}
		if (this.y > this.CAR_POSITION.BOTTOM) {
			this.defaultMove();
			this.y = this.CAR_POSITION.BOTTOM;
		}

		const distance = Phaser3.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
		if (this.body.speed > 0 && distance < 10) {
			this.body.reset(this.target.x, this.target.y);
			this.defaultMove();
		}
	};

	moveUp = () => {
		if (this.y - 90 < this.CAR_POSITION.TOP || this.isMoving) {
			return false;
		}
		this.isMoving = true;
		this.target.y = this.y - 90;
		this.setDepth(this.currentLayer - 1);
		this.currentLayer -= 1;
		this.play(`moveUp${this.lives}`, true);
		this._scene.physics.moveToObject(this, this.target, this.TURN_SPEED);
	};

	moveDown = () => {
		if (this.y + 90 > this.CAR_POSITION.BOTTOM || this.isMoving) {
			return false;
		}
		this.isMoving = true;
		this.target.y = this.y + 90;
		this.setDepth(this.currentLayer + 1);
		this.currentLayer += 1;
		this.play(`moveDown${this.lives}`, true);
		this._scene.physics.moveToObject(this, this.target, this.TURN_SPEED);
	};

	defaultMove = () => {
		this.play(`move${this.lives}`, true);
		this.body.setVelocityY(0);
		this.isMoving = false;
	};

	createControl = () => {
		const moveDown = this._scene.input.keyboard.addKey("down");
		const moveUp = this._scene.input.keyboard.addKey("up");
		moveDown.on("down", this.moveDown);
		moveUp.on("down", this.moveUp);

		this._scene.game.canvas.addEventListener("touchstart", this.onTouchStart);
		this._scene.game.canvas.addEventListener("touchend", this.onTouchEnd);
	};

	getTouch = (event) => event.changedTouches[0];

	onTouchStart = (event) => {
		const firstTouch = this.getTouch(event);
		this.yDown = firstTouch.clientY;
	};

	onTouchEnd = (event) => {
		if (!this.yDown) {
			return false;
		}
		const { clientY: yUp } = this.getTouch(event);
		const yDiff = this.yDown - yUp;
		if (yDiff > 0) {
			return this.moveUp();
		}
		return this.moveDown();
	};

	createAnimation = () => {
		for (let i = 1; i <= 3; i += 1) {
			this._scene.anims.create({
				key: `move${i}`,
				frames: this._scene.anims.generateFrameNumbers(`playerMove${i}`, { start: 0, end: 3 }),
				frameRate: 8,
				repeat: -1,
			});
			this._scene.anims.create({
				key: `moveUp${i}`,
				frames: this._scene.anims.generateFrameNumbers(`playerMoveUp${i}`, { start: 0, end: 4 }),
				frameRate: 10,
				repeat: 0,
			});
			this._scene.anims.create({
				key: `moveDown${i}`,
				frames: this._scene.anims.generateFrameNumbers(`playerMoveDown${i}`, { start: 0, end: 4 }),
				frameRate: 10,
				repeat: 0,
			});
		}
		this.play("move3");
	};

	unsubscribeUpdateEvents = () => {
		this._scene.events.off("update", this.checkUpdate);
		this._scene.game.canvas.removeEventListener("touchstart", this.onTouchStart);
		this._scene.game.canvas.removeEventListener("touchend", this.onTouchEnd);
	};
}
