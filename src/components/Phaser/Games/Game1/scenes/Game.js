import Phaser3, { Scene } from "phaser";

export default class Game extends Scene {
	constructor() {
		super({ key: "Game" });
		this.destroyGame = this.destroyGame.bind(this);
		this.generateElements = this.generateElements.bind(this);
		this.nextDirection = this.nextDirection.bind(this);
		this.createSprite = this.createSprite.bind(this);
		this.addSprite = this.addSprite.bind(this);
		this.listenerClickMouse = this.listenerClickMouse.bind(this);
		this.calculateScore = this.calculateScore.bind(this);
	}

	create() {
		this.diff = this.game.customOptions.level;
		this.currentDiffScore = this.game.rewardsList[this.diff];
		this.coins = ["bitcoin", "dogecoin", "lightcoin", "dashcoin", "dashcoin"];
		this.score = 0;
		this.gameTime = 40000;
		const fenceHeight = this.textures.get("fence").getSourceImage().height;
		const hamsterHeight = this.textures.get("hamster").getSourceImage().height;
		this.defaultHamsterY = this.sys.game.config.height - fenceHeight - hamsterHeight / 6;
		this.countBombs = this.diff * 3;
		this.COUNT_COINS = 40;
		this.hamsterTimeout = 0;
		this.coinsLeft = this.COUNT_COINS;
		this.countItems = 0;
		this.cameras.main.setBackgroundColor("#b9f1f9");
		// add clouds
		this.addClouds();
		// add hamster
		this.hamster = this.physics.add.sprite(this.sys.game.config.width / 2, this.defaultHamsterY, "hamster");
		this.hamster.setOrigin(0.5, 0.5);
		this.hamster.setGravity(0, 0);
		this.hamster.setBounce(1, 0);
		this.hamster.body.collideWorldBounds = true;
		this.hamster.body.velocity.x = this.sys.game.config.width / 2;
		// add fence
		this.add.sprite(0, this.sys.game.config.height - this.textures.get("fence").getSourceImage().height, "fence").setOrigin(0, 0);
		// add scoreBg and score text
		this.add.sprite(0, 0, "scoreSprite").setOrigin(0, 0);
		this.scoreText = this.add.text(85, 62, "0", { font: "24px 'Roboto'", fill: "#a3aeb4", align: "center" }).setOrigin(0.5, 0.5);
		this.add.sprite(this.sys.game.config.width - 165, 0, "timeSprite").setOrigin(0);
		this.timer = this.time.delayedCall(this.gameTime, () => this.destroyGame(1));
		this.timeText = this.add.text(this.sys.game.config.width - 85, 62, "00", { font: "24px 'Roboto'", fill: "#a3aeb4", align: "center" });
		this.timeText.setOrigin(0.5);

		this.generateElements();
		this.addSprite();
		this.physics.world.on("worldbounds", (sprite) => {
			if (this.coins.some((item) => sprite.gameObject.texture.key === item)) {
				this.destroyGame(2);
			}
		});
		// add grass
		const grass = this.add.sprite(0, this.sys.game.config.height - this.textures.get("grass").getSourceImage().height, "grass").setOrigin(0, 0);
		this.anims.create({
			key: "stir",
			frameRate: 10,
			repeat: -1,
			frames: this.anims.generateFrameNames("grass", { start: 1, end: 6 }),
		});
		grass.play("stir");
		this.loop = this.time.addEvent({
			delay: (this.gameTime - 1000) / (this.countBombs + this.COUNT_COINS),
			callback: this.addSprite,
			loop: true,
		});
		this.anims.create({
			key: "explosion",
			frameRate: 10,
			repeat: 1,
			frames: this.anims.generateFrameNames("explosion", { start: 1, end: 12 }),
		});
		this.anims.create({
			key: "bomb_explosion",
			frameRate: 10,
			repeat: 1,
			frames: this.anims.generateFrameNames("bomb_explosion", { start: 1, end: 9 }),
		});
	}

	addClouds = () => {
		const cloudFirst = this.add.sprite(-400, 70, "cloudSecond").setOrigin(0.5);
		const cloudSecond = this.add.sprite(450, 70, "cloudSecond").setOrigin(0.5);
		const cloudThird = this.add.sprite(0, 30, "cloudFirst").setOrigin(0.5);
		const cloudGroup = this.physics.add.group();
		cloudGroup.addMultiple([cloudFirst, cloudSecond, cloudThird]);
		cloudGroup.setVelocityX(20);
	};

	generateElements() {
		const getRandCoin = () => {
			return this.coins[Phaser3.Math.Between(0, this.coins.length - 1)];
		};
		this.itemsGroup = this.physics.add.group();
		this.itemsGroup.enableBody = true;

		for (let i = 0; i < this.COUNT_COINS; i += 1) {
			this.createSprite(getRandCoin());
		}
		for (let i = 0; i < this.countBombs; i += 1) {
			this.createSprite("bomb");
		}
	}

	createSprite(typeCoin) {
		const sprite = this.itemsGroup.create(0, 0, typeCoin, null, false);
		sprite.setInteractive({ cursor: "pointer" });
		sprite.setOrigin(0.5);
		sprite.setBounce(1);
		sprite.active = false;
		sprite.body.enable = false;
		if (typeCoin !== "bomb") {
			sprite.setCollideWorldBounds(true);
			sprite.body.onWorldBounds = true;
		}
		sprite.once("pointerdown", () => this.listenerClickMouse(sprite, typeCoin));
	}

	addSprite() {
		if (this.countItems + 1 > this.COUNT_COINS + this.countBombs) {
			return null;
		}
		this.hamster.y = this.defaultHamsterY - this.hamster.height / 4;
		const getAll = Phaser3.Utils.Array.GetAll;
		const getRandom = Phaser3.Utils.Array.GetRandom;
		const sprite = getRandom(getAll(this.itemsGroup.getChildren(), "active", false));

		if (!sprite) {
			return null;
		}
		this.countItems += 1;
		sprite.body.enable = true;
		sprite.body.reset(this.hamster.x, this.hamster.y);
		sprite.active = true;
		sprite.visible = true;

		if (sprite.texture.key === "bomb") {
			sprite.setScale(0.7);
		}
		sprite.body.gravity.y = 0;
		sprite.body.velocity.y = 100 + 16 * this.diff;
		sprite.body.velocity.x = 0;
		const seed = Date.now();
		this.anims.create({
			key: `fall_${sprite.texture.key}_${seed}`,
			frameRate: 10,
			repeat: -1,
			frames: this.anims.generateFrameNames(sprite.texture.key, { start: 1, end: 8 }),
		});
		sprite.anims.play(`fall_${sprite.texture.key}_${seed}`);

		sprite.checkWorldBounds = true;
		this.hamsterTimeout = this.time.delayedCall(300, () => {
			this.hamster.y = this.defaultHamsterY;
			this.hamster.body.velocity.x *= this.nextDirection();
		});
		this.hamsterTimeout.autoDestroy = true;
	}

	listenerClickMouse(sprite, typeCoin) {
		if (typeCoin !== "bomb") {
			this.score = this.calculateScore(this.score);
			const explosion = this.add.sprite(sprite.x - 52.5, sprite.y - 70, "explosion");
			explosion.setOrigin(0);
			this.anims.play("explosion", explosion);
			sprite.destroy();
			this.coinsLeft -= 1;
			if (!this.coinsLeft) {
				return this.destroyGame(3);
			}

			const timer = this.time.delayedCall(500, () => {
				explosion.destroy();
			});
			timer.autoDestroy = true;
		} else {
			const explosion = this.add.sprite(sprite.x - 120, sprite.y - 120, "bomb_explosion");
			explosion.setOrigin(0);
			this.anims.play("bomb_explosion", explosion);
			sprite.destroy();
			const timer = this.time.delayedCall(500, () => {
				explosion.destroy();
				this.destroyGame(2);
			});
			timer.autoDestroy = true;
		}
	}

	calculateScore(scoreVal) {
		const step = this.currentDiffScore / this.COUNT_COINS;
		const resultScore = Math.round(scoreVal + step);
		if (resultScore > this.currentDiffScore) {
			return this.currentDiffScore;
		}
		return resultScore;
	}

	// eslint-disable-next-line class-methods-use-this
	nextDirection() {
		return Phaser3.Math.Between(0, 1) ? -1 : 1;
	}

	destroyGame(status) {
		this.scene.start("GameEnd", { finishStatus: status, score: this.score });
	}

	update() {
		const time = Math.ceil((this.timer.delay - this.timer.elapsed) / 1000);
		if (time < 10) {
			this.timeText.setText(`00:0${time}`);
		} else {
			this.timeText.setText(`00:${time}`);
		}
		this.scoreText.setText(`${(+this.score).toFixed(0)}`);
	}
}
