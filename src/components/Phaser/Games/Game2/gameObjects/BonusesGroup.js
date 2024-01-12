import Phaser3 from "phaser";
import Bonus from "./Bonus";

export default class BonusesGroup extends Phaser3.Physics.Arcade.Group {
	constructor(scene) {
		super(scene.physics.world, scene);
		this.scene = scene;
		this.bonusWeapons = ["doubleShot", "tripleShot", "waveShot"];
	}

	createBonus() {
		const randomWeapon = this.bonusWeapons[Phaser3.Math.Between(0, this.bonusWeapons.length - 1)];
		const bonus = new Bonus(this.scene, 0, 0, randomWeapon);
		this.add(bonus);
	}
}
