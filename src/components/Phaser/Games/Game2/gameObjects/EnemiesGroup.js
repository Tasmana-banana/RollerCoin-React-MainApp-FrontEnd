import Phaser3 from "phaser";
import Enemy from "./Enemy";
import BulletsGroup from "./BulletsGroup";

export default class EnemiesGroup extends Phaser3.Physics.Arcade.Group {
	constructor(scene, data, isBoss) {
		super(scene.physics.world, scene);
		this.scene = scene;
		this.defaultX = data.x;
		this.defaultY = data.y;
		this.rows = data.rows;
		this.numberEnemiesInRow = data.numberEnemiesInRow;
		this.enemiesTypes = data.enemiesTypes;
		this.rowWidth = this.scene.game.config.width - 180;
		this.currentEnemiesNumber = this.scene.COUNT_ENEMIES;
		this.isBoss = isBoss;
		this.enemiesBullets = new BulletsGroup(this.scene, "enemyShot");
		this.initialization();
	}

	initialization() {
		if (this.isBoss) {
			this.createBossMinionsGrid();
		} else {
			this.createEnemiesGrid();
		}
		this.createEnemiesMovement();
		this.enemiesFlyLoop();
		this.enemyShootLoop();
	}

	stopEvents() {
		if (this.isBoss) {
			this.restoreTimer.remove();
		}
		this.enemiesBullets.stopEvents();
		this.getChildren().forEach((enemy) => {
			enemy.updateOff();
		});
	}

	createBossMinionsGrid() {
		const maxNumberType = 3;
		const MAX_LEVEL = 10;
		const enemyType = this.scene.diff - MAX_LEVEL + maxNumberType;
		const enemyTexture = `bug${enemyType}`;
		const paddingY = 5;
		const paddingX = 60;
		const groupPaddingX = 550;
		const enemyWidth = this.scene.textures.getFrame(enemyTexture, 0).width;
		const enemyHeight = this.scene.textures.getFrame(enemyTexture, 0).height;
		let rowMinX = this.scene.game.config.width;
		let rowMaxX = 0;
		for (let i = 0; i < 8; i += 1) {
			const dopPadding = i % 2 ? enemyWidth + paddingX : 0;
			let enemy = null;
			switch (true) {
				case i < 2:
					enemy = new Enemy(this.scene, this.defaultX + dopPadding, this.scene.boss.y - this.scene.boss.height - paddingY - enemyHeight, enemyTexture, enemyType + 1, this.enemiesBullets);
					break;
				case i >= 2 && i < 4:
					enemy = new Enemy(
						this.scene,
						this.defaultX + dopPadding + groupPaddingX,
						this.scene.boss.y - this.scene.boss.height - paddingY - enemyHeight,
						enemyTexture,
						enemyType + 1,
						this.enemiesBullets
					);
					break;
				case i >= 4 && i < 6:
					enemy = new Enemy(this.scene, this.defaultX + dopPadding, this.scene.boss.y + paddingY, enemyTexture, enemyType + 1, this.enemiesBullets);
					break;
				case i >= 6:
					enemy = new Enemy(this.scene, this.defaultX + dopPadding + groupPaddingX, this.scene.boss.y + paddingY, enemyTexture, enemyType + 1, this.enemiesBullets);
					break;
				default:
					break;
			}
			this.add(enemy);
			if (enemy && enemy.x < rowMinX) {
				rowMinX = enemy.x;
			}
			if (enemy && enemy.x + enemyHeight > rowMaxX) {
				rowMaxX = enemy.x + enemyHeight;
			}
		}
		this.rowWidth = rowMaxX - rowMinX;
		this.createRestoreMinions();
	}

	createRestoreMinions() {
		this.restoreTimer = this.scene.time.addEvent({
			delay: Math.round(6 + 1 / this.scene.diff) * 1000,
			callback: () => {
				this.getChildren().forEach((enemy) => {
					if (!enemy.active) {
						enemy.resurrection();
					}
				});
			},
			callbackScope: this,
			loop: true,
		});
	}

	createEnemiesGrid() {
		const verticalPaddings = [this.defaultY];
		for (let i = 0; i < this.rows; i += 1) {
			const rowEnemyType = this.enemiesTypes[i];
			verticalPaddings.push(this.scene.textures.getFrame(`bug${rowEnemyType}`, 0).height + 6 + verticalPaddings[i]);
			const enemyWidth = this.scene.textures.getFrame(`bug${rowEnemyType}`, 0).width;
			const horizontalCoordinates = this.getPaddingsBetweenEnemies(enemyWidth, this.numberEnemiesInRow[rowEnemyType]);

			for (let j = 0; j < this.numberEnemiesInRow[rowEnemyType]; j += 1) {
				this.add(new Enemy(this.scene, horizontalCoordinates[j], verticalPaddings[i], `bug${rowEnemyType}`, rowEnemyType + 1, this.enemiesBullets));
			}
		}
	}

	getPaddingsBetweenEnemies(enemyWidth, enemiesNumber) {
		const remainderOfWidth = this.rowWidth - enemyWidth * enemiesNumber;
		const randomNumbers = [];
		const min = 20; // relative value
		const max = 100; // relative value
		for (let i = 0; i < enemiesNumber + 1; i += 1) {
			randomNumbers.push(min + Math.random() * (max - min));
		}
		const sum = randomNumbers.reduce((acc, curr) => acc + curr, 0);
		const coefficient = remainderOfWidth / sum;

		const integerResult = [Math.round(randomNumbers[0] * coefficient) + this.defaultX];
		for (let i = 1; i < randomNumbers.length - 1; i += 1) {
			integerResult.push(Math.round(randomNumbers[i] * coefficient) + enemyWidth + integerResult[i - 1]);
		}
		return integerResult;
	}

	createEnemiesMovement() {
		const moveRange = this.scene.game.config.width - (this.defaultX + this.rowWidth);
		this.getChildren().forEach((enemy) => {
			enemy.createTween(moveRange);
		});
	}

	enemiesFlyLoop() {
		this.scene.time.addEvent({
			delay: Math.round(3 + 1 / this.scene.diff) * 1000,
			callback: () => {
				const aliveInGroup = this.getChildren().filter((enemy) => {
					return enemy.active && enemy.visible && !enemy.isMove;
				});
				if (!aliveInGroup) {
					return null;
				}
				const enemy = aliveInGroup[Math.floor(Math.random() * aliveInGroup.length)];
				if (enemy) {
					enemy.attackMove();
				}
			},
			loop: true,
		});
	}

	enemyShootLoop() {
		this.scene.time.addEvent({
			delay: Math.round(1 + 1 / this.scene.diff) * 1000,
			callback: () => {
				const aliveInGroup = this.getChildren().filter((enemy) => {
					return enemy.active && enemy.visible && enemy.y + enemy.height < this.scene.spaceship.y - this.scene.spaceship.height;
				});
				if (!aliveInGroup) {
					return null;
				}
				const enemy = aliveInGroup[Math.floor(Math.random() * aliveInGroup.length)];
				if (enemy) {
					enemy.fire();
				}
			},
			callbackScope: this,
			loop: true,
		});
	}

	calculateEnemies() {
		if (!this.isBoss) {
			const allAlive = this.getChildren().filter((item) => item.active);
			this.currentEnemiesNumber = allAlive.length;
			if (this.currentEnemiesNumber <= 0) {
				this.scene.time.delayedCall(
					100,
					() => {
						this.scene.playerIsImmortal = true;
						if (this.scene.playerHealth > 0) {
							this.scene.destroyGame(3);
						}
					},
					[],
					this
				);
			}
		}
	}
}
