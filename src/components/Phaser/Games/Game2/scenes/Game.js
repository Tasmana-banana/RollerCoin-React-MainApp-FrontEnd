import Phaser3, { Scene } from "phaser";
import Spaceship from "../gameObjects/Spaceship";
import EnemiesGroup from "../gameObjects/EnemiesGroup";
import Boss from "../gameObjects/Boss";
import BonusesGroup from "../gameObjects/BonusesGroup";
import RewardsGroup from "../gameObjects/RewardsGroup";

export default class Game extends Scene {
	constructor() {
		super({ key: "Game" });
	}

	create() {
		this.diff = this.game.customOptions.level;
		this.currentDiffScore = this.game.rewardsList[this.diff];
		this.gameTime = 40;
		this.score = 0;
		this.maxHealth = 3;
		this.playerHealth = this.maxHealth;
		this.COUNT_BONUS = 3;
		this.lastCreatedBonusTime = this.gameTime;
		this.ENEMY_BONUS_VELOCITY = () => 300 + 15 * this.diff + Phaser3.Math.Between(0, 100);
		this.ROWS = 4;
		this.COLS = [7, 7, 8, 6, 1];
		this.DEFAULT_PLAYER_HEALTH = 3;
		this.DEFAULT_BOSS_HEALTH = 40;
		this.levelsMapsCols = {
			1: [1, 0, 0, 0],
			2: [1, 1, 0, 0],
			3: [1, 1, 1, 0],
			4: [1, 1, 1, 1],
			5: [2, 1, 1, 1],
			6: [2, 2, 1, 1],
			7: [4],
			8: [4],
			9: [4],
			10: [4],
		};
		this.COUNT_ENEMIES = this.levelsMapsCols[this.diff].reduce((acc, cur) => acc + this.COLS[cur], 0);
		this.isBossLevel = this.COLS[this.levelsMapsCols[this.diff]] === 1;
		this.gameBackground = this.add.tileSprite(this.game.config.width / 2, this.game.config.height / 2, this.game.config.width, this.game.config.height, "startBackground");
		this.physics.world.setBounds(0, 0, this.game.config.width, this.game.config.height);
		this.createHeader();
		this.createSpaceship();
		if (this.isBossLevel) {
			this.bossHealth = this.DEFAULT_BOSS_HEALTH;
			this.createBoss();
		}
		this.createEnemies();
		this.addBonuses();
		this.addRewards();
		this.addOverlap();
		this.timerEvent = this.time.addEvent({ delay: 1000, callback: this.onTimerEvent, callbackScope: this, loop: true });
		this.isRewardActive = false;
		this.playerIsImmortal = false; // true after death of all enemies
	}

	update() {
		this.gameBackground.tilePositionY -= 4;
		this.spaceship.playerControl();
	}

	addRewards() {
		this.rewards = new RewardsGroup(this);
	}

	addBonuses() {
		this.bonuses = new BonusesGroup(this);
		for (let i = 0; i < this.COUNT_BONUS; i += 1) {
			this.bonuses.createBonus();
		}
	}

	getBonus(x, y) {
		const available = this.bonuses.getFirstDead();
		if (available && Phaser3.Math.Between(0, 100) < 50 - 5 * this.diff && this.lastCreatedBonusTime - this.gameTime > 3 + Phaser3.Math.Between(0, 3)) {
			this.lastCreatedBonusTime = this.gameTime;
			const bonus = this.bonuses.getFirstDead();
			bonus.spawn(x, y);
		}
	}

	addOverlap() {
		const playerBulletsArray = [this.spaceship.singleShot, this.spaceship.doubleShot, this.spaceship.tripleShot, this.spaceship.waveShot];
		this.physics.add.overlap(this.spaceship, this.enemies, this.collideSpaceshipAndEnemy, undefined, this);
		this.physics.add.overlap(this.spaceship, this.enemies.enemiesBullets, this.collideSpaceshipAndEnemyBullets, undefined, this);
		this.physics.add.overlap(this.enemies, playerBulletsArray, this.collideSpaceshipBulletsAndEnemy, undefined, this);
		if (this.isBossLevel) {
			this.physics.add.overlap(this.spaceship, this.boss.bossBullets, this.collideSpaceshipAndEnemyBullets, undefined, this);
			this.physics.add.overlap(this.boss, playerBulletsArray, this.collideSpaceshipBulletsAndEnemy, undefined, this);
		}
		this.physics.add.overlap(this.spaceship, this.bonuses, this.collideSpaceshipAndBonus, undefined, this);
		this.physics.add.overlap(this.scoreSprite, this.rewards, this.collideRewardToScore, undefined, this);
	}

	collideSpaceshipAndEnemy(player, enemy) {
		enemy.death();
		this.spaceship.onDamagePlayer();
		this.decrementLivesSprite();
	}

	collideSpaceshipAndEnemyBullets(player, bullet) {
		bullet.death();
		this.spaceship.onDamagePlayer();
		this.decrementLivesSprite();
	}

	// eslint-disable-next-line class-methods-use-this
	collideSpaceshipBulletsAndEnemy(enemy, bullet) {
		enemy.takeDamage(bullet.damage);
		bullet.death();
	}

	collideSpaceshipAndBonus(player, bonus) {
		this.spaceship.setWeaponBonus(bonus.type);
		bonus.death();
	}

	collideRewardToScore(source, reward) {
		reward.death();
		this.score = this.calculateScore();
		this.scoreText.setText(this.score);
	}

	decrementLivesSprite() {
		const emptySectorWidth = this.textures.getFrame("emptySector", 0).width;
		this.add
			.image(this.healthSprite.x + 122 - (this.maxHealth - this.playerHealth) * emptySectorWidth, this.healthSprite.y + 9, "emptySector")
			.setDepth(12)
			.setOrigin(0, 0);
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

	destroyGame(status) {
		this.timerEvent.remove();
		this.rewardEvent = this.time.addEvent({
			delay: 500,
			callback: () => {
				if (!this.isRewardActive) {
					this.rewardEvent.remove();
					this.enemies.stopEvents();
					this.spaceship.stopEvents();
					this.scene.start("GameEnd", { finishStatus: status, score: this.score });
				}
			},
			callbackScope: this,
			loop: true,
		});
	}

	createSpaceship() {
		const initData = {
			x: this.cameras.main.centerX,
			y: this.game.config.height,
			texture: "spaceship",
			frame: 5,
		};
		this.spaceship = new Spaceship(this, initData);
	}

	createEnemies() {
		const initData = {
			x: 30,
			y: this.gameHeader.displayHeight + 20,
			rows: this.ROWS,
			numberEnemiesInRow: this.COLS,
			enemiesTypes: this.levelsMapsCols[this.diff],
		};
		this.enemies = new EnemiesGroup(this, initData, this.isBossLevel); // (scene, data, isBoss)
	}

	createBoss() {
		this.boss = new Boss(this, this.cameras.main.centerX, this.cameras.main.centerY, "boss");
	}

	decrementBossLives(damage) {
		const bossEmptySectorWidth = this.textures.getFrame("bossEmptySector", 0).width;
		const emptySectorCoordinateX = this.bossHealthSprite.x + 456 - (this.DEFAULT_BOSS_HEALTH - this.bossHealth - damage) * bossEmptySectorWidth;
		const coordinateXLimiter = emptySectorCoordinateX >= 578 ? emptySectorCoordinateX : 578;
		for (let i = 0; i < damage; i += 1) {
			this.add
				.image(coordinateXLimiter - (i + 1) * bossEmptySectorWidth, this.bossHealthSprite.y + 9, "bossEmptySector")
				.setDepth(12)
				.setOrigin(0, 0);
		}
	}

	createHeader() {
		this.gameHeader = this.add.image(0, 0, "header").setDepth(10).setOrigin(0, 0);
		this.healthSprite = this.add.image(5, 15, "lives").setDepth(11).setOrigin(0, 0);
		this.scoreSprite = this.add
			.image(this.healthSprite.x + this.healthSprite.width + 10, 15, "score")
			.setDepth(11)
			.setOrigin(0, 0);
		this.physics.add.existing(this.scoreSprite); // for use overlap with reward
		this.scoreText = this.add
			.text(this.scoreSprite.x + 101, this.scoreSprite.height / 2, "0", { font: "24px 'Roboto'", fill: "#a3aeb4", align: "center" })
			.setDepth(12)
			.setOrigin(0.5, 0);
		this.timerSprite = this.add
			.image(this.scoreSprite.x + this.scoreSprite.width + 10, 15, "time")
			.setDepth(11)
			.setOrigin(0, 0);
		this.timerText = this.add.text(this.timerSprite.x + 62, this.timerSprite.height / 2, "00:40", { font: "24px 'Roboto'", fill: "#a3aeb4", align: "center" }).setDepth(12);
		this.bossHealthSprite = this.add
			.image(this.timerSprite.x + this.timerSprite.width + 10, 15, "bossLivesSprite")
			.setDepth(11)
			.setOrigin(0, 0);
		this.bossHealthSprite.setVisible(this.isBossLevel);
	}

	calculateScore() {
		const step = this.currentDiffScore / this.COUNT_ENEMIES;
		const resultScore = Math.round(this.score + step);
		if (resultScore > this.currentDiffScore) {
			return this.currentDiffScore;
		}
		return resultScore;
	}
}
