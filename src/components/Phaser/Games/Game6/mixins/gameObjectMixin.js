import Randomize from "../../helpers/randomize";

const gameObjectMixin = {
	changeDirection() {
		if (this.active) {
			if (this.x + this.width / 2 >= this.scene.game.config.width) {
				if (this.body.velocity.x > 0) {
					this.body.setVelocityX(this.body.velocity.x * -1);
				}
				if (this.child) {
					this.child.body.setVelocityX(this.child.body.velocity.x * -1);
				}
			}
			if (this.x - this.width / 2 <= 0) {
				if (this.body.velocity.x < 0) {
					this.body.setVelocityX(this.body.velocity.x * -1);
				}
				if (this.child) {
					this.child.body.setVelocityX(this.child.body.velocity.x * -1);
				}
			}
		}
	},

	movingItems(scoreNow) {
		this.moving = true;
		const velocityToSet = 60 * (0.5 + 0.5 * Randomize.frac() + scoreNow / 30000) * 2;
		this.body.setVelocityX(velocityToSet > 300 ? 300 : velocityToSet);
	},
};

export default gameObjectMixin;
