import Phaser3, { Scene } from "phaser";
import config from "../config";
import addAnimations from "../helpers/addAnimations";

export default class Game extends Scene {
	constructor() {
		super({ key: "Game" });
	}

	create() {
		this.physics.world.setFPS(120);
		this.diff = this.game.customOptions.level;
		this.currentDiffScore = this.game.rewardsList[this.diff];
		this.finishStatus = null;
		this.coinsToWin = 8 + Math.floor(this.diff / 2);
		this.countDestroyed = 0;
		const { width, height } = this.game.config;
		this.gameBackground = this.add.tileSprite(0, height / 2, width * 2, height, "cityBg");
		this.gameOptions = config.gameConfig[this.diff];
		this.lastAddedPlatform = null;
		this.dove = null;
		// groups
		this.platformGroup = this.add.group();
		this.trafficLightsGroup = this.add.group();

		// group with all active coins.
		this.coinGroup = this.add.group();
		// group with all active hindrances.
		this.hindranceGroup = this.add.group();
		this.addedPlatforms = 0;
		this.playerJumps = 0;
		// adding a platform to the game, the arguments are platform width, x position and y position
		this.addPlatform(width, 0, 750);
		// adding the player;
		this.player = this.physics.add.sprite(this.gameOptions.playerStartPosition, 270, "hamster");
		this.player.setGravityY(this.gameOptions.playerGravity);
		this.player.setDepth(3);
		this.isPlayerImmortal = false;
		// the player is not dying
		this.dying = false;
		this.addCollides();
		this.addOverlaps();
		addAnimations(this);
		// time, score and lives
		this.add.image(0, 0, "header").setOrigin(0, 0);
		this.lives = 3;
		this.livesSprite = this.add.sprite(10, 36, "lives").setOrigin(0, 0.5);
		this.score = 0;
		this.gameTime = 60000;
		const scoreImage = this.add.image(this.livesSprite.displayWidth + 20, 17, "score").setOrigin(0, 0);
		this.scoreText = this.add.text(scoreImage.x + 100, scoreImage.y + scoreImage.height / 2, "0", { font: "24px 'Roboto'", fill: "#a3aeb4", align: "center" }).setOrigin(0.5, 0.5);
		const timeImage = this.add.sprite(scoreImage.x + scoreImage.width + 20, 17, "time").setOrigin(0);
		this.timedEvent = this.time.addEvent({ delay: 1000, callback: this.onTimerEvent, loop: true });
		this.timeText = this.add.text(timeImage.x + 100, scoreImage.y + scoreImage.height / 2, "0", { font: "24px 'Roboto'", fill: "#a3aeb4", align: "center" });
		this.timeText.setOrigin(0.5);
		// checking for input
		this.input.on("pointerdown", this.jump, this);
		const jump = this.input.keyboard.addKey("space");
		jump.on("down", this.jump);
	}

	addOverlaps = () => {
		// setting collisions between the player and the coin group
		this.physics.add.overlap(
			this.player,
			this.coinGroup,
			(player, coin) => {
				this.tweens.add({
					targets: coin,
					y: coin.y - 100,
					alpha: 0,
					duration: 800,
					ease: "Cubic.easeOut",
					callbackScope: this,
					onComplete() {
						this.coinGroup.killAndHide(coin);
					},
				});
				this.coinGroup.remove(coin);
				this.changeScore();
			},
			null,
			this
		);
		this.physics.add.overlap(this.player, this.hindranceGroup, this.playerIsDying, null, this);
	};

	addCollides = () => {
		// setting collisions between the player and the platform group
		this.platformCollider = this.physics.add.collider(
			this.player,
			this.platformGroup,
			() => {
				if (!this.player.anims.isPlaying) {
					this.player.anims.play("run");
				}
				this.player.isPlayerOnGround = true;
				if (this.platformGroup.getChildren().some((platform) => platform.body.touching.left)) {
					this.playerIsDying();
				}
			},
			null,
			this
		);
	};

	playerIsDying = () => {
		if (this.isPlayerImmortal) {
			return null;
		}
		this.physics.world.colliders.destroy();
		this.dying = true;
		this.player.body.setVelocityY(-200);
		this.player.setFrame(12);
		this.togglePauseGame(true);
	};

	reBornPlayer = () => {
		this.lives -= 1;
		this.dying = false;
		this.player.body.setVelocityY(0);
		this.player.setFrame(12);
		this.isPlayerImmortal = true;
		this.player.isPlayerOnGround = false;
		this.playerJumps = 1;
		this.player.setPosition(this.gameOptions.playerStartPosition, 270);
		this.addCollides();
		this.addOverlaps();
		this.togglePauseGame();
		this.add.tween({
			targets: this.player,
			ease: "Sine.easeInOut",
			duration: 400,
			delay: 0,
			repeat: 5,
			alpha: { from: 0.3, to: 1 },
			onComplete: () => {
				this.isPlayerImmortal = false;
				this.player.setAlpha(1);
			},
		});
	};

	onTimerEvent = () => {
		this.gameTime -= 1000;
		const time = this.gameTime / 1000;
		if (time < 10) {
			this.timeText.setText(`00:0${time}`);
		} else {
			this.timeText.setText(`00:${time}`);
		}
		if (this.gameTime <= 0) {
			this.destroyGame(1);
		}
	};

	changeScore = () => {
		this.countDestroyed += 1;
		const coinValue = this.currentDiffScore / this.coinsToWin;
		const resultScore = Math.round(this.countDestroyed * coinValue);
		if (resultScore >= this.currentDiffScore) {
			this.score = this.currentDiffScore;
		}
		this.score = resultScore;
		this.scoreText.setText(this.score);
		if (this.countDestroyed >= this.coinsToWin) {
			this.destroyGame(3);
		}
	};

	addPlatform(platformWidth, posX, posY) {
		this.addedPlatforms += 1;
		const platform = this.add.tileSprite(posX, posY, platformWidth, 72, "block");
		platform.setOrigin(0, 0.5);
		this.physics.add.existing(platform);
		platform.body.setImmovable(true);
		platform.body.setVelocityX(this.gameOptions.platformSpeed);
		platform.setDepth(2);
		this.lastAddedPlatform = platform;
		this.platformGroup.add(platform);

		// if this is not the starting platform...
		if (this.addedPlatforms > 1) {
			// is there a coin over the platform?
			this.addCoins(platformWidth, posX, posY, platform);
			this.addHindrance(platformWidth, posX, posY, platform);
			this.addDove(posY);
			this.addTrafficLights(platformWidth, posX, posY, platform);
		}
	}

	addCoins = (platformWidth, posX, posY, platform) => {
		if (Phaser3.Math.Between(1, 100) > this.gameOptions.coinPercent) {
			return null;
		}
		const minX = platformWidth - platformWidth * 0.2;
		const maxX = platformWidth - platformWidth * 0.8;
		const coinPosX = platform.x + Phaser3.Math.Between(minX, maxX);
		const randomCoin = config.coins[Phaser3.Math.Between(0, config.coins.length - 1)];
		const coinTexture = this.textures.get(randomCoin).getSourceImage();
		const coin = this.physics.add.sprite(coinPosX, posY - 120 - coinTexture.height, randomCoin);
		coin.setImmovable(true);
		coin.setVelocityX(platform.body.velocity.x);
		coin.anims.play(`rotate_${randomCoin}`);
		coin.setDepth(2);
		this.coinGroup.add(coin);
	};

	addHindrance = (platformWidth, posX, posY, platform) => {
		// is there a hindrance over the platform?
		if (Phaser3.Math.Between(1, 100) > this.gameOptions.hindrancePercent) {
			return null;
		}
		const minX = platformWidth - platformWidth * 0.2;
		const maxX = platformWidth - platformWidth * 0.8;
		const hindrancePosX = platform.x + Phaser3.Math.Between(minX, maxX);
		const hindranceImgs = ["garbageCan", "garbageCartA", "garbageCartB", "coneA", "coneB"];
		const randomImg = hindranceImgs[Phaser3.Math.Between(0, hindranceImgs.length - 1)];
		const hindrance = this.physics.add.sprite(hindrancePosX, posY - 36, randomImg);
		hindrance.setOrigin(0.5, 1);
		hindrance.setImmovable(true);
		hindrance.setVelocityX(platform.body.velocity.x);
		hindrance.setDepth(2);
		this.hindranceGroup.add(hindrance);
	};

	addDove = (posY) => {
		if (Phaser3.Math.Between(1, 100) > this.gameOptions.dovePercent || this.dove || this.addedPlatforms < 2) {
			return null;
		}
		const { width } = this.game.config;
		this.dove = this.physics.add.sprite(width + 129, posY - 200, "dove");
		this.dove.body.setSize(100, 50, false);
		this.dove.body.setOffset(5, 30);
		this.dove.refreshBody();
		this.dove.anims.play("dove");
		this.dove.setVelocityX(this.gameOptions.platformSpeed - 100);
		this.dove.setImmovable(true);
		this.playerTouchesDove = false;
		this.doveCollider = this.physics.add.overlap(this.dove, this.player, () => {
			if (this.dove && this.dove.body.touching.up && this.dove.body.overlapY > this.dove.body.overlapX && !this.isPlayerImmortal && !this.playerTouchesDove) {
				this.doveCollider.active = false;
				this.playerTouchesDove = true;
				this.physics.world.removeCollider(this.dove);
				this.player.body.setVelocityY(-150);
				this.dove.setGravityY(1300);
				this.dove.anims.pause();
				this.dove.setFrame(4);
				this.playerJumps = 1;
			} else if (this.dove && !this.dove.body.touching.none && !this.isPlayerImmortal && !this.playerTouchesDove) {
				this.doveCollider.active = false;
				this.playerTouchesDove = true;
				this.playerIsDying();
			}
		});
	};

	addTrafficLights = (platformWidth, posX, posY, platform) => {
		if (Phaser3.Math.Between(1, 100) > config.trafficLightPrecent) {
			return null;
		}
		const minX = platformWidth - platformWidth * 0.1;
		const maxX = platformWidth - platformWidth * 0.9;
		const lightsPosX = platform.x + Phaser3.Math.Between(minX, maxX);
		const lights = this.physics.add.sprite(lightsPosX, posY - 36, "trafficLights");
		lights.setOrigin(0.5, 1);
		lights.setFrame(Phaser3.Math.Between(0, 3));
		lights.setImmovable(true);
		lights.setVelocityX(platform.body.velocity.x);
		lights.setDepth(1);
		this.trafficLightsGroup.add(lights);
	};

	togglePauseGame = (isPaused) => {
		const { platformSpeed } = this.gameOptions;
		const fullLiveSpriteCount = 3;
		this.platformGroup.getChildren().forEach((platform) => {
			platform.body.setVelocityX(isPaused ? 0 : platformSpeed);
		});
		this.hindranceGroup.getChildren().forEach((hindrance) => {
			hindrance.body.setVelocityX(isPaused ? 0 : platformSpeed);
		});
		this.coinGroup.getChildren().forEach((coin) => {
			coin.body.setVelocityX(isPaused ? 0 : platformSpeed);
		});
		this.trafficLightsGroup.getChildren().forEach((trafficLights) => {
			trafficLights.body.setVelocityX(isPaused ? 0 : platformSpeed);
		});
		if (!isPaused) {
			this.livesSprite.setFrame(fullLiveSpriteCount - this.lives);
		}
	};

	jump = () => {
		if (!this.dying && (this.player.body.touching.down || (this.playerJumps > 0 && this.playerJumps < this.gameOptions.jumps))) {
			if (this.player.body.touching.down) {
				this.playerJumps = 0;
			}
			this.player.isPlayerOnGround = false;
			this.player.setVelocityY(this.gameOptions.jumpForce * -1);
			this.playerJumps += 1;
			if (this.playerJumps === 1) {
				this.player.anims.play("jump");
			}
			if (this.playerJumps === 2) {
				if (this.player.anims.isPlaying) {
					this.player.anims.pause();
				}
				this.player.anims.play("hamsterFlip");
				this.player.on("animationcomplete", () => {
					this.player.setFrame(3);
				});
			}
		}
	};

	getPlatformY = (min, max) => {
		const maxHeight = 600;
		const minHeight = 780;
		const value = this.getRandomInt(min, max);
		if (value >= maxHeight && value <= minHeight) {
			return value;
		}
		return this.getPlatformY(min, max);
	};

	getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

	destroyGame = (status) => {
		this.timedEvent.remove();
		this.scene.start("GameEnd", { finishStatus: status, score: this.score });
	};

	update() {
		const { width } = this.game.config;
		// decrement lives
		if (this.player.y > this.game.config.height) {
			if (this.lives > 1) {
				this.reBornPlayer();
			} else {
				this.destroyGame(2);
			}
		}
		if (this.player.body.touching.down && this.player.isPlayerOnGround) {
			this.player.body.velocity.x = -this.gameOptions.platformSpeed;
		} else {
			this.player.body.velocity.x = 0;
		}

		// recycling platforms
		this.platformGroup.getChildren().forEach((platform) => {
			if (platform.x + platform.width <= 0) {
				this.platformGroup.killAndHide(platform);
				this.platformGroup.remove(platform);
			}
		}, this);

		// recycling coins
		this.coinGroup.getChildren().forEach((coin) => {
			if (coin.x < -coin.displayWidth / 2) {
				this.coinGroup.killAndHide(coin);
				this.coinGroup.remove(coin);
			}
		}, this);

		// recycling trafficLights
		this.trafficLightsGroup.getChildren().forEach((light) => {
			if (light.x < -light.displayWidth / 2) {
				this.trafficLightsGroup.killAndHide(light);
				this.trafficLightsGroup.remove(light);
			}
		}, this);

		// recycling hindrance
		this.hindranceGroup.getChildren().forEach((hindrance) => {
			if (hindrance.x < -hindrance.displayWidth / 2) {
				this.hindranceGroup.killAndHide(hindrance);
				this.hindranceGroup.remove(hindrance);
			}
		}, this);
		if (this.dove && this.dove.x <= -this.dove.width) {
			this.dove.destroy();
			this.dove = null;
		}
		// adding new platforms
		if (this.lastAddedPlatform && this.lastAddedPlatform.x + this.lastAddedPlatform.width <= width + 100) {
			const nextPlatformWidth = Phaser3.Math.Between(this.gameOptions.platformSizeRange[0], this.gameOptions.platformSizeRange[1]) * this.gameOptions.platformSizeStep;
			const nextPlatformGap = Phaser3.Math.Between(this.gameOptions.spawnRange[0], this.gameOptions.spawnRange[1]);
			const minPlatformHeight = this.lastAddedPlatform.y - this.gameOptions.platformVerticalLimit;
			const maxPlatformHeight = this.lastAddedPlatform.y + this.gameOptions.platformVerticalLimit;
			const nextPlatformHeight = this.getPlatformY(minPlatformHeight, maxPlatformHeight);
			this.addPlatform(nextPlatformWidth, this.lastAddedPlatform.x + this.lastAddedPlatform.width + nextPlatformGap, nextPlatformHeight);
		}
		// scroll background
		if (!this.dying) {
			this.gameBackground.tilePositionX += 2;
		}
	}
}
