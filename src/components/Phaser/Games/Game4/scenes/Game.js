import Phaser3, { Scene } from "phaser";
import Ball from "../gameObjects/Ball";
import Platform from "../gameObjects/Platform";
import BonusGroup from "../gameObjects/BonusGroup";
import BlocksGroup from "../gameObjects/BlocksGroup";

export default class Game extends Scene {
	constructor() {
		super({ key: "Game" });
	}

	create() {
		this.seed = Number(Date.now());
		this.random = new Phaser3.Math.RandomDataGenerator([this.seed]);
		this.diff = this.game.customOptions.level;
		this.currentDiffScore = this.game.rewardsList[this.diff];
		this.ballSpeed = 500 + 15 * this.diff;
		this.score = 0;
		this.gameTime = 60;
		this.defaultLives = 3;

		this.ballOnPlatform = true;

		this.slimeBonus = false;
		this.fireballBonus = false;
		this.weaponBonus = false;
		this.lastCreatedBonusTime = this.gameTime;

		this.add.tileSprite(0, 0, this.game.config.width, this.game.config.height, "startBackground").setOrigin(0, 0);
		this.add.sprite(0, 0, "frame").setOrigin(0, 0);

		this.physics.world.setBounds(8, this.textures.get("headerSprite").getSourceImage().height + 5, this.game.config.width - 16, this.game.config.height);
		this.BonusGroup = new BonusGroup(this);
		this.lifeGroup = this.add.group();

		this.mouseCursor = this.input;
		this.input.on("pointerdown", this.launchBall, this);
		this.killBlock = this.onBlockKill.bind(this);
		this.timerEvent = this.time.addEvent({ delay: 1000, callback: this.onTimerEvent, callbackScope: this, loop: true });
		this.createHeader();
		this.createBlocks();
		this.createPlatform();
		this.createBall();
		this.blocksAmount = this.Blocks.blocksCols * this.Blocks.blocksRows;
	}

	update() {
		if (this.ball.body.onFloor()) {
			this.decrementLives();
		}
		if (this.Blocks.getLength() === 0) {
			this.destroyGame(3);
		}
		if (this.ballOnPlatform) {
			this.ball.setPosition(this.platform.body.x + this.platform.body.halfWidth, this.platform.y - 25);
		}
		this.platformControl();
		this.bonusControl();
		if (this.ballOnPlatform && this.ball.ballParticles) {
			this.ball.destroyEmitter();
		}
		this.scoreText.setText(Math.round(this.score));
	}

	onTimerEvent() {
		this.gameTime -= 1;
		if (this.gameTime < 0) {
			this.destroyGame(1);
		} else if (this.gameTime < 10) {
			this.timerText.setText(`00:0${this.gameTime}`);
		} else {
			this.timerText.setText(`00:${this.gameTime}`);
		}
	}

	ballCollidePlatform(ball, platform) {
		if (this.ballOnPlatform) {
			return;
		}
		if (this.slimeBonus) {
			this.ball.body.setVelocity(0, 0);
			this.ballOnPlatform = true;
			return;
		}
		platform.anims.play("flash_platform", false);
		let rate = 1 - (ball.body.x + ball.width / 2 - platform.body.x) / platform.width;
		if (rate < 0.1) {
			rate = 0.1;
		}
		if (rate > 0.9) {
			rate = 0.9;
		}
		const angle = -Math.PI * rate;
		ball.body.setVelocity(Math.cos(angle) * this.ballSpeed, -this.ballSpeed);
	}

	ballCollideBlocks(ball, block) {
		if (this.fireballBonus) {
			return this.onBlockKill(block);
		}
		if (block.health === 1) {
			this.onBlockKill(block);
		}
		if (block.health > 1) {
			block.health -= 1;
			block.playAnim(`block${block.maxHealth}_flash_${block.maxHealth - block.health}`);
		}
	}

	platformCollideBonus(platform, bonus) {
		const bonusIsActive = this.slimeBonus || this.weaponBonus || this.fireballBonus;
		if (bonusIsActive) {
			return false;
		}
		if (bonus.texture.key === "weapon") {
			this.useWeaponBonus(platform);
		}
		if (bonus.texture.key === "slime") {
			this.useSlimeBonus(platform);
		}
		if (bonus.texture.key === "fireball") {
			this.useFireballBonus(platform);
		}
		if (bonus.texture.key === "live") {
			this.useHealthBonus();
		}
		this.BonusGroup.killBonus(bonus);
	}

	useWeaponBonus(platform) {
		this.weaponBonus = true;
		platform.weapon.activate();
		this.intervalBullet = this.time.addEvent({
			delay: 500,
			callback: () => this.platform.weapon.createBullets(this.platform.body.x),
			callbackScope: this,
			loop: true,
			startAt: 400,
		});
		this.time.delayedCall(
			3000,
			() => {
				this.weaponBonus = false;
				platform.weapon.deactivate();
				this.intervalBullet.remove();
			},
			[],
			this
		);
	}

	useSlimeBonus(platform) {
		this.slimeBonus = true;
		platform.toggleSlimeVisible(true);
		this.ball.createSlime();
		this.time.delayedCall(
			3000,
			() => {
				this.slimeBonus = false;
				platform.toggleSlimeVisible(false);
				this.ball.createDefault();
			},
			[],
			this
		);
	}

	useFireballBonus(platform) {
		this.fireballBonus = true;
		platform.toggleFireballVisible(true);
		this.ball.createFireball();
		this.ball.body.setImmovable(true);
		this.time.delayedCall(
			3000,
			() => {
				this.fireballBonus = false;
				platform.toggleFireballVisible(false);
				this.ball.createDefault();
				this.ball.body.setImmovable(false);
			},
			[],
			this
		);
	}

	useHealthBonus() {
		this.ball.addLife();
		this.lifeGroup.getChildren()[this.lifeGroup.getLength() - 1].destroy();
	}

	createHeader() {
		this.gameHeader = this.add.sprite(0, 0, "headerSprite").setOrigin(0, 0);
		this.healthSprite = this.add.sprite(10, 15, "livesSprite").setOrigin(0, 0);
		this.scoreSprite = this.add.sprite(this.healthSprite.x + this.healthSprite.width + 10, 15, "scoreSprite").setOrigin(0, 0);
		this.scoreText = this.add.text(this.scoreSprite.x + 100, this.scoreSprite.height / 2, "0", { font: "24px 'Roboto'", fill: "#a3aeb4", align: "center" }).setOrigin(0.5, 0);
		this.timeSprite = this.add.sprite(this.scoreSprite.x + this.scoreSprite.width + 10, 15, "timeSprite").setOrigin(0, 0);
		this.timerText = this.add.text(this.timeSprite.x + 64, this.timeSprite.height / 2, "01:00", { font: "24px 'Roboto'", fill: "#a3aeb4", align: "center" });
	}

	createBlocks() {
		this.Blocks = new BlocksGroup(this, { diff: this.diff });
	}

	createPlatform() {
		const platformData = {
			x: this.game.config.width / 2,
			y: this.game.config.height - 25 - this.textures.get("platform").getSourceImage().height / 2,
			texture: "platform",
		};
		this.platform = new Platform(this, platformData);
		this.physics.add.collider(this.platform, this.BonusGroup, this.platformCollideBonus, null, this);
	}

	createBall() {
		const ballData = {
			x: this.platform.body.x,
			y: this.platform.y - 25,
			texture: "ball",
			lives: this.defaultLives,
		};
		this.ball = new Ball(this, ballData);
		this.physics.add.collider(this.ball, this.platform, this.ballCollidePlatform, null, this); // overlap
		this.physics.add.collider(this.ball, this.Blocks, this.ballCollideBlocks, null, this);
	}

	createBonus(x, y) {
		const bonusData = {
			x,
			y,
			ballSpeed: this.ballSpeed,
			ballLife: this.ball.lives,
			defaultLives: this.defaultLives,
		};
		this.BonusGroup.createBonus(bonusData);
	}

	platformControl() {
		if (this.mouseCursor.x - this.platform.width / 2 > 0 && this.mouseCursor.x + this.platform.width / 2 < this.game.config.width) {
			this.platform.body.x = this.mouseCursor.x - this.platform.width / 2;
			this.platform.updateSkinsPosition(this.platform.body.x);
		}
	}

	launchBall() {
		if (this.ballOnPlatform) {
			if (this.time.paused) {
				this.time.paused = false;
			}
			this.ballOnPlatform = false;
			const angle = -this.random.realInRange(0.3, 0.5) * Math.PI;
			this.ball.body.setVelocity(Math.cos(angle) * this.ballSpeed, -this.ballSpeed);
			if (this.fireballBonus) {
				return this.ball.createFireball();
			}
			if (this.slimeBonus) {
				return this.ball.createSlime();
			}
			this.ball.createDefault();
		}
	}

	bonusControl() {
		const currentBonus = this.BonusGroup.getFirstAlive();
		if (!currentBonus) {
			return;
		}
		if (currentBonus.body.position.y > this.game.config.height) {
			this.BonusGroup.killBonus(currentBonus);
		}
	}

	calculateScore(scoreVal) {
		const step = this.currentDiffScore / this.blocksAmount;
		const resultScore = Math.round(scoreVal + step);
		if (resultScore > this.currentDiffScore) {
			return this.currentDiffScore;
		}
		return resultScore;
	}

	decrementLives() {
		if (this.ball.lives === 1) {
			this.destroyGame(1);
		}
		this.lifeGroup.create(123 - this.textures.get("emptySector").getSourceImage().width * (this.defaultLives - this.ball.lives), 36, "emptySector");
		this.ball.reduceLife();
		this.ball.body.setVelocity(0, 0);
		this.ballOnPlatform = true;
	}

	onBlockKill(block) {
		this.anims.create({
			key: "explosion",
			frames: this.anims.generateFrameNames("explosion"),
			frameRate: 30,
			repeat: 0,
		});
		const explosion = this.physics.add.sprite(block.x, block.y, "explosion").play("explosion");
		explosion.on(Phaser3.Animations.Events.SPRITE_ANIMATION_COMPLETE, () => {
			explosion.destroy();
			const randomBoolean = Math.random() < (50 - this.diff) / 100;
			const timeToBonusCreated = this.lastCreatedBonusTime - this.gameTime > 3 + Phaser3.Math.Between(0, 3);
			const bonusIsActive = this.slimeBonus || this.weaponBonus || this.fireballBonus;
			if (this.BonusGroup.getLength() < this.BonusGroup.countBonus && randomBoolean && timeToBonusCreated && !bonusIsActive) {
				this.lastCreatedBonusTime = this.gameTime;
				if (!this.BonusGroup.bonusIsActive()) {
					this.createBonus(block.x, block.y);
				}
			}
		});
		this.score = this.calculateScore(this.score);
		block.destroy();
	}

	destroyGame(status) {
		this.slimeBonus = false;
		this.platform.toggleSlimeVisible(false);
		this.fireballBonus = false;
		this.platform.toggleFireballVisible(false);
		this.ball.body.setImmovable(false);
		this.weaponBonus = false;
		this.platform.weapon.deactivate();
		this.time.removeAllEvents();
		this.ball.createDefault();
		this.scene.start("GameEnd", { finishStatus: status, score: Math.round(this.score) });
	}
}
