import Phaser3 from "phaser";
import Reward from "./Reward";

export default class RewardsGroup extends Phaser3.Physics.Arcade.Group {
	constructor(scene) {
		super(scene.physics.world, scene);
		this.scene = scene;
		this.coins = ["bitcoin", "doge", "litecoin", "monero", "ethereum"];
		this.initialization();
	}

	initialization() {
		this.coins.forEach((coin) => {
			this.add(new Reward(this.scene, 0, 0, coin));
		});
	}

	createReward(x, y) {
		const allDeathRewards = this.getChildren().filter((item) => !item.active);
		let reward;
		if (allDeathRewards.length > 0) {
			reward = allDeathRewards[Phaser3.Math.Between(0, allDeathRewards.length - 1)];
			reward.respawn(x, y);
		} else {
			reward = new Reward(this.scene, x, y, this.coins[Phaser3.Math.Between(0, this.coins.length - 1)]);
			reward.setAlive(true);
			this.add(reward);
		}
		this.scene.isRewardActive = true;
		reward.move();
	}

	isAllDead() {
		if (!this.getFirstAlive()) {
			this.scene.isRewardActive = false;
		}
	}
}
