import Phaser3 from "phaser";
import Pipe from "./Pipe";

export default class PipesGroup extends Phaser3.Physics.Arcade.Group {
	constructor(scene) {
		super(scene.physics.world, scene);
		this.scene = scene;
		this.initialization();
	}

	initialization() {
		this.pipesTimer = 0;
		this.MIN_PIPE_Y = this.scene.AVAILABLE_SPACE_BETWEEN_PIPES + 43 + this.scene.textures.get("header").getSourceImage().height; // 360 / 315
		this.MAX_PIPE_Y = this.scene.game.config.height - this.MIN_PIPE_Y; // 468
		this.delta = this.MAX_PIPE_Y - this.MIN_PIPE_Y; // 108
		this.spawnPipes();
	}

	spawnPipes() {
		this.pipeY = this.MIN_PIPE_Y + Math.round(Phaser3.Math.RND.frac() * this.delta);
		this.freeSoaceHeight = this.calcDifficult();
		const deathPipes = this.getChildren().filter((enemy) => !enemy.active);
		if (deathPipes.length >= 2) {
			deathPipes[0].spawn(this.scene.game.config.width, this.pipeY + this.freeSoaceHeight / 2, Phaser3.Math.RND.pick(["candlestickChartGreen", "candlestickChartRed"]), false);
			deathPipes[1].spawn(this.scene.game.config.width, this.pipeY - this.freeSoaceHeight / 2, Phaser3.Math.RND.pick(["candlestickChartGreen", "candlestickChartRed"]), true);
		} else {
			this.add(new Pipe(this.scene, this.scene.game.config.width, this.pipeY + this.freeSoaceHeight / 2, Phaser3.Math.RND.pick(["candlestickChartGreen", "candlestickChartRed"]), false));
			this.add(new Pipe(this.scene, this.scene.game.config.width, this.pipeY - this.freeSoaceHeight / 2, Phaser3.Math.RND.pick(["candlestickChartGreen", "candlestickChartRed"]), true));
		}
		this.setVelocityX(-this.scene.calculateWorldSpeed());
		const newTime = Phaser3.Math.Between(this.scene.PIPE_SPAWN_MIN_INTERVAL, this.scene.PIPE_SPAWN_MAX_INTERVAL) - this.scene.calculateWorldSpeed();
		this.scene.time.delayedCall(
			newTime < this.scene.PIPE_SPAWN_MIN_INTERVAL ? this.scene.PIPE_SPAWN_MIN_INTERVAL : newTime,
			() => {
				this.spawnPipes();
			},
			this
		);
	}

	calcDifficult() {
		return (
			this.scene.AVAILABLE_SPACE_BETWEEN_PIPES +
			(Math.floor(Phaser3.Math.RND.frac() * this.scene.AVAILABLE_SPACE_BETWEEN_PIPES) *
				(this.scene.countFloughtFreeSpaces > this.scene.maxCountFreeSpaces ? this.scene.maxCountFreeSpaces : this.scene.maxCountFreeSpaces - this.scene.countFloughtFreeSpaces)) /
				(this.scene.maxCountFreeSpaces + 1)
		);
	}

	stopEvents() {
		this.getChildren().forEach((pipe) => {
			pipe.updateOff();
		});
	}
}
