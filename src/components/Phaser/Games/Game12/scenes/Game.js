import Phaser3, { Scene } from "phaser";
import { MersenneTwister19937, Random } from "random-js";
import Player from "../items/Player";
import GAME_CONFIG from "../config/index";

export default class Game extends Scene {
	constructor() {
		super({ key: "Game" });
	}

	create() {
		this.device = this.sys.game.device.os.desktop ? "desktop" : "mobile";
		this.diff = this.game.customOptions.level;
		this.currentDiffScore = this.game.rewardsList[this.diff];
		this.maxLives = 3;
		this.lives = this.maxLives;
		this.gameTime = GAME_CONFIG.diff[this.diff].time;
		this.platformsClaimed = 0;
		this.score = 0;
		this.isPlayerDead = false;

		// CONFIGS
		this.centerYOffset = GAME_CONFIG[this.device].centerYOffset;
		this.ropeDistance = 180;
		this.defaultAngle = 180; // standard angle pointing up
		this.successDistance = 40; // successful distance from the player's center to the center of the platform
		this.platformsGenerationAngleRange = 50;
		this.rotationSpeed = GAME_CONFIG.diff[this.diff].speed;
		this.totalPlatforms = GAME_CONFIG.diff[this.diff].platforms;
		this.usedPlatformsCount = 0; // total platforms generated
		this.currentRopeDistance = 0; // rope length depending on the distance to the nearest platform
		this.ropePointsAmount = 0; // the total number of points on the rope to draw (Pixel Art)
		this.ropeShadowStep = 0; // shadow offset for rope points
		this.hidingRange = 0; // how many dots not to draw at the beginning and end of the rope to optimize performance
		this.updateRopeParams(this.ropeDistance);

		// PLAYERS
		this.playerBlue = new Player(this, 0, 0, "blue", true);
		this.playerRed = new Player(this, this.game.config.width / 2, this.game.config.height / 2 + this.centerYOffset, "red", false);
		this.players = [this.playerBlue, this.playerRed];
		this.rotatingPlayer = 0; // 0 or 1 current rotating player index in this.players
		this.rotatingDirection = 1; // -1 or 1
		this.rotationAngle = 0;

		// ROPE
		// use image instead of rope (not pixel art)
		// this.rope = this.add.sprite(this.players[1 - this.rotatingPlayer].x, this.players[1 - this.rotatingPlayer].y, "rope").setOrigin(0, 0.5);

		// use sprites instead of squares
		// const group = this.add.group({ key: "pixel", frameQuantity: 16 });
		// Phaser.Actions.PlaceOnLine(group.getChildren(), this.line);

		this.ropeGraphics = this.add.graphics({ fillStyle: { color: 0xf5ec42 } }).setDepth(3);
		this.ropeShadowGraphics = this.add.graphics({ fillStyle: { color: 0x000000 } }).setDepth(2);
		this.rope = new Phaser3.Geom.Line(this.playerRed.x, this.playerRed.y, this.playerBlue.x, this.playerBlue.y);

		// PLATFORMS
		this.platformsGroup = this.physics.add.group();
		this.addPlatforms();
		this.targetLightOn = false; // platform lighting when the player approaches

		// BACKGROUND
		this.bg = this.add
			.tileSprite(this.game.config.width / 2, this.game.config.height / 2, 0, 0, "background")
			.setOrigin(0.5, 0.5)
			.setScrollFactor(0);

		// CAMERA
		this.camera = this.cameras.main;
		this.isCameraActive = true;

		// TIME
		this.timedEvent = this.time.addEvent({ delay: 1000, callback: this.onTimerEvent, loop: true });

		// DASHBOARD
		this.createDashboard();

		// KEYBOARD INPUT
		this.spaceBar = this.input.keyboard.addKey("space");

		// ACTIVATE ALL INPUTS
		this.activatePlayer();
	}

	update() {
		if (!this.platformsGroup.getLength()) {
			return false;
		}
		if (this.isPlayerDead) {
			this.platformsGroup.getChildren()[0].setFrame(0);
			return false;
		}

		let distanceFromTarget = this.players[this.rotatingPlayer].getCenter().distance(this.platformsGroup.getChildren()[0].getCenter());
		if (!this.targetLightOn && distanceFromTarget <= this.successDistance) {
			this.targetLightOn = true;
			this.platformsGroup.getChildren()[0].setFrame(1);
		} else if (this.targetLightOn && distanceFromTarget > this.successDistance) {
			this.targetLightOn = false;
			this.platformsGroup.getChildren()[0].setFrame(0);
		}

		// if you use image
		// this.rope.angle = this.rotationAngle + 90;
		this.rotationAngle = (this.rotationAngle + this.rotationSpeed * this.rotatingDirection) % 360;
		this.ropeRedrawing();

		this.players[this.rotatingPlayer].x = this.players[1 - this.rotatingPlayer].x - this.currentRopeDistance * Math.sin(Phaser.Math.DegToRad(this.rotationAngle));
		this.players[this.rotatingPlayer].y = this.players[1 - this.rotatingPlayer].y + this.currentRopeDistance * Math.cos(Phaser.Math.DegToRad(this.rotationAngle));

		this.bg.tilePositionX = this.camera.scrollX;
		this.bg.tilePositionY = this.camera.scrollY;
	}

	// eslint-disable-next-line class-methods-use-this
	getRandom = (min, max) => {
		const randomNum = new Random(MersenneTwister19937.autoSeed());
		return randomNum.integer(min, max);
	};

	activatePlayer = () => {
		if (this.lives < 1) {
			return false;
		}
		this.isPlayerDead = false;
		this.input.on("pointerdown", this.changePlayer, this);
		this.spaceBar.on("down", this.changePlayer);
	};

	updateRopeParams = (distance) => {
		this.currentRopeDistance = distance;
		this.ropePointsAmount = Math.floor(distance / 4);
		this.ropeShadowStep = Math.round((15 / this.ropePointsAmount) * 100) / 100;
		this.hidingRange = Math.floor(this.ropePointsAmount * 0.2);
	};

	ropeRedrawing = () => {
		this.rope.setTo(this.players[1 - this.rotatingPlayer].x, this.players[1 - this.rotatingPlayer].y, this.players[this.rotatingPlayer].x, this.players[this.rotatingPlayer].y);
		this.ropeGraphics.clear();
		this.ropeShadowGraphics.clear();
		let points = this.rope.getPoints(this.ropePointsAmount);
		for (let i = 0; i < points.length - this.hidingRange; i += 1) {
			if (i > this.hidingRange) {
				this.ropeGraphics.fillPoint(points[i].x, points[i].y, 4);
				this.ropeShadowGraphics.fillPoint(points[i].x, points[i].y + i * this.ropeShadowStep, 4).setAlpha(0.5);
			}
		}
	};

	changePlayer = () => {
		let distanceFromTarget = this.players[this.rotatingPlayer].getCenter().distance(this.platformsGroup.getChildren()[0].getCenter());
		if (distanceFromTarget <= this.successDistance) {
			this.tweens.add({
				targets: this.platformsGroup.getChildren()[0],
				alpha: 0,
				scale: 6,
				duration: 150,
				ease: "Ease.In",
				onComplete(tween, platforms) {
					platforms[0].destroy();
				},
			});

			if (this.platformsGroup.getChildren()[1]) {
				let adjustedDistance = this.players[this.rotatingPlayer].getCenter().distance(this.platformsGroup.getChildren()[1].getCenter());
				this.updateRopeParams(adjustedDistance);
				this.tweens.add({
					targets: this.platformsGroup.getChildren()[1],
					alpha: 0.8,
					duration: 150,
					ease: "Ease.In",
				});
			}

			this.platformsClaimed++;
			this.changeScore();

			// if you use image
			// this.rope.setPosition(this.players[this.rotatingPlayer].x, this.players[this.rotatingPlayer].y);
			this.rotatingDirection *= -1;
			this.rotationAngle += 180;
			this.rotatingPlayer = 1 - this.rotatingPlayer;
			this.players[this.rotatingPlayer].setRotating(true);
			this.players[1 - this.rotatingPlayer].setRotating(false);

			if (this.isCameraActive) {
				this.camera.pan(this.players[1 - this.rotatingPlayer].x, this.players[1 - this.rotatingPlayer].y - this.centerYOffset, 500, "Cubic.easeOut", true);
			}

			this.addPlatforms();
		} else {
			this.reBornPlayer();
		}
	};

	reBornPlayer = () => {
		this.input.off("pointerdown");
		this.spaceBar.off("down");
		this.ropeGraphics.clear();
		this.ropeShadowGraphics.clear();
		this.lives -= 1;
		this.livesSprite.setFrame(this.maxLives - this.lives);
		this.players[this.rotatingPlayer].failure();
		this.rotationAngle = 0;
		if (this.lives < 1) {
			this.destroyGame(2);
		}
	};

	addPlatforms = () => {
		if (this.totalPlatforms <= this.usedPlatformsCount) {
			return false;
		}
		let isFirst = false;
		let placeX = 0;
		let placeY = 0;
		if (this.platformsGroup.getLength()) {
			placeX = this.platformsGroup.getChildren()[this.platformsGroup.getLength() - 1].x;
			placeY = this.platformsGroup.getChildren()[this.platformsGroup.getLength() - 1].y;
		} else {
			placeX = this.players[1 - this.rotatingPlayer].x;
			placeY = this.players[1 - this.rotatingPlayer].y;
			isFirst = true;
		}

		let angleDifference = this.getRandom(this.platformsGenerationAngleRange * -1, this.platformsGenerationAngleRange);
		const randomAngle = this.defaultAngle + angleDifference;

		let platform = this.add
			.sprite(placeX + this.ropeDistance * Math.sin(Phaser.Math.DegToRad(randomAngle)), placeY + this.ropeDistance * Math.cos(Phaser.Math.DegToRad(randomAngle)), "target", 0)
			.setOrigin(0.5)
			.setDepth(1)
			.setScale(4)
			.setAlpha(isFirst ? 0.8 : 0.5);
		this.platformsGroup.add(platform);
		this.usedPlatformsCount++;
		// additional creation of a platform to completely fill the screen
		if (
			this.totalPlatforms > this.usedPlatformsCount &&
			this.players[1 - this.rotatingPlayer].y - this.platformsGroup.getChildren()[this.platformsGroup.getLength() - 1].y < this.game.config.height / 2 + this.centerYOffset
		) {
			this.addPlatforms();
		}
	};

	createDashboard = () => {
		// const textStyle = { font: "24px 'Roboto'", fill: "#b4abaa", align: "center" };
		const textStyle = { font: "20px 'Arcana'", fill: "#b4abaa", align: "center" };
		this.livesSprite = this.add.sprite(20, 10, "lives").setScale(4).setOrigin(0, 0);
		const scoreImage = this.add
			.image(this.livesSprite.x + this.livesSprite.displayWidth + 10, 10, "score")
			.setScale(4)
			.setOrigin(0, 0);
		this.scoreText = this.add.text(scoreImage.x + 78, scoreImage.y + 19, "0", textStyle).setOrigin(0.5, 0.5);
		const timeImage = this.add
			.sprite(scoreImage.x + scoreImage.displayWidth + 10, 10, "time")
			.setScale(4)
			.setOrigin(0, 0);
		this.timeText = this.add.text(timeImage.x + 78, timeImage.y + 19, `00:${this.gameTime}`, textStyle).setOrigin(0.5, 0.5);

		this.container = this.add.container(0, 0);
		this.container.add([this.livesSprite, scoreImage, this.scoreText, timeImage, this.timeText]).setDepth(10).setScrollFactor(0);
	};

	onTimerEvent = () => {
		this.gameTime -= 1;
		if (this.gameTime < 0) {
			this.destroyGame(1);
		} else if (this.gameTime < 10) {
			this.timeText.setText(`00:0${this.gameTime}`);
		} else {
			this.timeText.setText(`00:${this.gameTime}`);
		}
	};

	changeScore = () => {
		if (this.platformsClaimed >= this.totalPlatforms) {
			this.score = this.currentDiffScore;
			this.scoreText.setText(this.score);
			this.isCameraActive = false;
			this.destroyGame(3);
		}

		const scorePerPlatform = this.currentDiffScore / this.totalPlatforms;
		this.score = Math.round(this.platformsClaimed * scorePerPlatform);
		if (this.score > this.currentDiffScore) {
			this.score = this.currentDiffScore;
		}
		this.scoreText.setText(this.score);
	};

	stopAll = () => {
		this.input.off("pointerdown");
		this.spaceBar.off("down");
		this.ropeGraphics.clear();
		this.ropeShadowGraphics.clear();
		this.timedEvent.remove();
		this.rotationSpeed = 0;
	};

	destroyGame = (status) => {
		this.isPlayerDead = true;
		this.stopAll();
		this.time.addEvent({
			delay: 1000,
			callback: () => {
				this.scene.start("ThisGameEnd", { finishStatus: status, score: this.score });
			},
			callbackScope: this,
			loop: false,
		});
	};
}
