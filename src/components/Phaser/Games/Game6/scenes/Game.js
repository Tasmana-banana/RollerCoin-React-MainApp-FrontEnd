import { Scene } from "phaser";
import Player from "../gameObjects/Player";
import Platform from "../gameObjects/Platform";
import Bullet from "../gameObjects/Bullet";
import Obstacle from "../gameObjects/Obstacle";
import Randomize from "../../helpers/randomize";
import formatTime from "../../helpers/formatTime";

export default class Game extends Scene {
	constructor() {
		super({ key: "Game" });
	}

	create() {
		this.gameTime = 40000;
		this.score = 0;
		this.diff = this.game.customOptions.level;
		this.currentDiffScore = this.game.rewardsList[this.diff];
		this.timerHamsterChangeFrame = 0;
		this.MAX_ACCELERATION = 450;
		this.ACCELERATION = 50;
		this.DEFAULT_PLAYER_HEALTH = 3;
		this.widthPlat = 138;
		this.COUNT_OBSTACLE = this.diff * 2;
		this.maxLevels = 10;
		this.maxPositionWindow = this.calcWinDistance(this.diff);
		this.lastCreatedEnemyTime = this.gameTime;
		this.diffScore = this.maxPositionWindow * (this.diff - 1);
		this.physics.world.setBounds(0, 0, this.game.config.width, this.game.config.height);
		this.physics.world.defaults.debugShowBody = true;
		this.physics.world.defaults.bodyDebugColor = 0xff00ff;

		// camera and platform tracking vars
		this.bg = this.add.tileSprite(0, 0, this.game.config.width, this.textures.get("space").getSourceImage().height, "space").setOrigin(0, 0);
		this.bg.fixedToCamera = true;
		this.asteroids = this.add.tileSprite(0, 0, this.game.config.width, this.textures.get("asteroids").getSourceImage().height, "asteroids").setOrigin(0, 0);

		// Groups
		this.platformPool = this.physics.add.group({ immovable: true });
		this.obstaclePool = this.physics.add.group({ immovable: true });
		this.bulletPool = this.physics.add.group();
		this.bulletPool.enableBody = true;
		this.obstaclePool.enableBody = true;
		this.precedingPlatform = {
			x: this.game.config.width / 2,
			y: this.game.config.height - 30,
			hasObstacle: false,
		};

		// Game time
		this.timer = this.time.delayedCall(this.gameTime, () => this.destroyGame(1), this);

		// Init game
		this.createAnimations();
		this.createPlayer();
		this.createHeader();
		this.createLevel();

		// Collides
		this.physics.add.collider(this.player, this.platformPool, this.player.jump, null, this.player);
		this.physics.add.overlap(this.player, this.obstaclePool, this.player.collideObstacle, null, this.player);
		this.physics.add.collider(
			this.bulletPool,
			this.obstaclePool,
			(bullet, obstacle) => {
				obstacle.takeDamage();
				bullet.destroy();
			},
			null,
			this
		);
	}

	update() {
		const currentTime = formatTime(((this.gameTime - this.timer.elapsed) / 1000).toFixed(0));
		this.timerText.setText(currentTime);
		if (this.player.y > this.game.config.height + 50) {
			this.player.takeDamage();
		}
		if (+this.score >= +this.maxPositionWindow) {
			this.score = this.calculateScore(this.maxPositionWindow);
			this.destroyGame(3);
		}
		this.bg.tilePositionY -= 0.3;
		this.asteroids.tilePositionY -= 0.5;

		if (this.player.x < 0) {
			this.player.x += this.game.config.width;
		}

		if (this.player.x > this.game.config.width) {
			this.player.x -= this.game.config.width;
		}

		if (this.precedingPlatform.y + 2 * this.score > 0) {
			this.createLevel();
		}
		if (this.player.active) {
			this.platformPool.getChildren().forEach((platform) => {
				if (platform.y > this.game.config.height) {
					platform.destroy();
				}
			}, this);
			if (this.COUNT_OBSTACLE > 0 && this.lastCreatedEnemyTime - +(this.gameTime - this.timer.elapsed) > 1000 && +this.gameTime - this.timer.elapsed < 35000) {
				this.lastCreatedEnemyTime = +(this.gameTime - this.timer.elapsed);
				if (Randomize.roll(10 * this.diff)) {
					this.spawnObstacle(this, this.precedingPlatform.x, this.precedingPlatform.y - 60, Randomize.num(0, 2), this.diffScore);
					this.COUNT_OBSTACLE -= 1;
				}
			}
		}
	}

	/* Init methods */
	createAnimations() {
		this.anims.create({
			key: "destroy2",
			frames: this.anims.generateFrameNames("platform2", { start: 1, end: 3 }),
			frameRate: 10,
		});
		this.anims.create({
			key: "destroy1",
			frames: this.anims.generateFrameNames("platform1", { start: 0, end: 2 }),
			frameRate: 20,
		});
		this.anims.create({
			key: "burn",
			defaultTextureKey: "fire",
			frames: this.anims.generateFrameNames("fire", { start: 0, end: 2 }),
			frameRate: 12,
			repeat: -1,
		});
		this.anims.create({
			key: "stay",
			defaultTextureKey: "alien1",
			frames: this.anims.generateFrameNames("alien1"),
			frameRate: 16,
			repeat: -1,
		});
	}

	createHeader() {
		this.flag = this.add
			.sprite(this.game.config.width - this.textures.get("flag").getSourceImage().width / 2 - 15, this.game.config.height - 15, "flag")
			.setOrigin(0.5, 1)
			.setScrollFactor(0, 0);
		this.headHumster = this.add.sprite(this.game.config.width - this.textures.get("head").getSourceImage().width / 2, this.game.config.height - 15, "head").setOrigin(0.5, 1);
		this.gameHeader = this.add.image(0, 0, "header").setDepth(10).setOrigin(0, 0);
		this.healthSprite = this.add.image(5, 15, "lives").setDepth(11).setOrigin(0, 0);
		this.scoreSprite = this.add
			.image(this.healthSprite.x + this.healthSprite.width + 10, 15, "score")
			.setDepth(11)
			.setOrigin(0, 0);
		this.scoreText = this.add
			.text(this.scoreSprite.x + 101, this.scoreSprite.height / 2, "0", { font: "24px 'Roboto'", fill: "#a3aeb4", align: "center" })
			.setDepth(12)
			.setOrigin(0.5, 0);
		this.timerSprite = this.add
			.image(this.scoreSprite.x + this.scoreSprite.width + 10, 15, "time")
			.setDepth(11)
			.setOrigin(0, 0);
		this.timerText = this.add.text(this.timerSprite.x + 62, this.timerSprite.height / 2, "00:40", { font: "24px 'Roboto'", fill: "#a3aeb4", align: "center" }).setDepth(12);
	}

	createLevel() {
		while (this.precedingPlatform.y + 2 * this.score > -100) {
			const foundY = this.precedingPlatform.y - 2 * this.distanceBtwPlatforms();
			this.precedingPlatform = new Platform(this, Randomize.frac() * (this.game.config.width - this.widthPlat) + this.widthPlat / 2, foundY, { ...this.precedingPlatform }, this.diffScore);
		}
	}

	createPlayer() {
		this.player = new Player(this, this.game.config.width / 2, this.game.config.height - 120);
	}

	/* Spawn game objects */
	spawnBullet(x, y) {
		const bullet = new Bullet(this, x, y);
		this.bulletPool.add(bullet);
		bullet.body.setVelocityY(-1920);
		bullet.body.setAllowGravity(false);
	}

	spawnObstacle(gameObject, coordinateX, foundY, type, scoreNow) {
		this.precedingPlatform.hasObstacle = true;
		const enemy = new Obstacle(gameObject, coordinateX, foundY, type, scoreNow, this.precedingPlatform);
		return enemy;
	}

	/* Other */
	decrementLivesSprite() {
		const emptySectorWidth = this.textures.getFrame("emptySector", 0).width;
		this.add
			.image(this.healthSprite.x + 113 - (this.DEFAULT_PLAYER_HEALTH - this.player.health) * emptySectorWidth, this.healthSprite.y + 9, "emptySector")
			.setDepth(12)
			.setOrigin(0.5, 0);
	}

	moveScreen(vertSpeed) {
		this.player.setPosition(this.player.x, this.player.y - vertSpeed);
		this.platformPool.incY(-vertSpeed);
		this.obstaclePool.incY(-vertSpeed);
		this.asteroids.setTilePosition(this.asteroids.tilePositionX, this.asteroids.tilePositionY + vertSpeed);
		this.diffScore -= vertSpeed / 2;
		this.score -= vertSpeed / 2;
		this.headHumster.setPosition(this.headHumster.x, this.game.config.height - (this.score / this.maxPositionWindow) * (this.flag.height - this.headHumster.height));
		this.scoreText.setText(`${(+this.calculateScore(this.score)).toFixed(0)}`);
	}

	distanceBtwPlatforms() {
		const numberForDistance = this.precedingPlatform.hasObstacle ? 40 : 30;
		const maxNumberForDistance = this.precedingPlatform.hasObstacle ? 80 : 45;
		const maxNumberForDistanceType2 = this.precedingPlatform.hasObstacle ? 100 : 50;
		let distance = numberForDistance + Randomize.frac() * ((75 + this.score) / 75);
		if (distance > maxNumberForDistance) {
			distance = maxNumberForDistance;
		}
		if (this.precedingPlatform.type === 2 && distance > maxNumberForDistanceType2) {
			distance = maxNumberForDistanceType2;
		}
		return distance;
	}

	/* Score */
	calculateScore(scoreVal) {
		const step = this.currentDiffScore / this.maxPositionWindow;
		const resultScore = Math.round(scoreVal * step);
		if (resultScore > this.currentDiffScore) {
			return this.currentDiffScore;
		}
		return resultScore;
	}

	calcWinDistance(diffForUse) {
		const minDistance = 2250;
		const maxDistance = 2775;
		const step = (maxDistance - minDistance) / (this.maxLevels - 1);
		return minDistance + (diffForUse - 1) * step;
	}

	destroyGame(status) {
		if (this.timer) {
			this.timer.remove();
		}
		this.scene.start("GameEnd", { finishStatus: status, score: this.score });
	}
}
