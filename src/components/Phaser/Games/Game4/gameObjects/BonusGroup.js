import Phaser from "phaser";

export default class BonusGroup extends Phaser.Physics.Arcade.Group {
	constructor(scene) {
		super(scene.physics.world, scene);
		this.scene = scene;
		this.countBonus = 5;
	}

	createBonus(bonusData) {
		const { x, y, ballSpeed, ballLife, defaultLives } = bonusData;
		const randomBonus = this.getRandomBonus(ballLife, defaultLives);
		const bonus = this.create(x, y, randomBonus);
		bonus.setVelocityY(ballSpeed);
		bonus.setDepth(101);
	}

	bonusIsActive() {
		return !!this.getFirstAlive();
	}

	killBonus(bonus) {
		bonus.setVelocityY(0);
		bonus.setX(0);
		bonus.setY(0);
		this.killAndHide(bonus);
	}

	// eslint-disable-next-line class-methods-use-this
	getRandomBonus(ballLife, defaultLives) {
		const bonuses = ["weapon", "slime", "fireball"];
		if (ballLife < defaultLives) {
			bonuses.push("live");
		}
		return bonuses[this.scene.random.integerInRange(0, bonuses.length - 1)];
	}
}
