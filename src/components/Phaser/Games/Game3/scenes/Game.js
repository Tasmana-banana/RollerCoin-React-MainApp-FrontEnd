import { Scene } from "phaser";
import Player from "../gameObjects/Player";
import PipesGroup from "../gameObjects/PipesGroup";

export default class Game extends Scene {
	constructor() {
		super({ key: "Game" });
	}

	create() {
		this.diff = this.game.customOptions.level;
		this.currentDiffScore = this.game.rewardsList[this.diff];
		this.gameTime = 40;
		this.score = 0;
		this.GAME_SPEED = 250;
		this.GRAVITY = 1800;
		this.BIRD_FLAP = 550;
		this.MAX_LEVEL = 10;
		this.PIPE_SPAWN_MIN_INTERVAL = 1200;
		this.PIPE_SPAWN_MAX_INTERVAL = 3000;
		this.AVAILABLE_SPACE_BETWEEN_PIPES = 250 - this.diff * 5;
		this.DEFAULT_PLAYER_HEALTH = 3;
		this.playerHealth = this.DEFAULT_PLAYER_HEALTH;
		this.FREE_SPACES = 10 + this.diff;
		this.countFloughtFreeSpaces = (this.diff + 10) * this.diff;
		this.countFloughtFreeSpacesOnDiff = 0;
		this.maxCountFreeSpaces = (this.MAX_LEVEL + 10) * (this.MAX_LEVEL + 1);
		this.bg = this.add.tileSprite(this.game.config.width / 2, this.game.config.height / 2, this.game.config.width, this.game.config.height, "startBackground");
		this.physics.world.setBounds(
			0,
			this.textures.get("header").getSourceImage().height - 5,
			this.game.config.width,
			this.game.config.height - this.textures.get("header").getSourceImage().height + 10
		);
		this.createHeader();
		this.createPlayer();
		this.createPipes();
		this.addOverlap();
		this.playerInvulnerability = false;
		this.timerEvent = this.time.addEvent({ delay: 1000, callback: this.onTimerEvent, callbackScope: this, loop: true });
	}

	update(time, delta) {
		this.bg.tilePositionX += (this.calculateWorldSpeed() * (delta / 1000)) / 5;
		if (this.countFloughtFreeSpacesOnDiff >= this.FREE_SPACES) {
			this.destroyGame(3);
		}
		if (this.player.y - this.player.body.halfHeight - 5 <= this.physics.world.bounds.y || this.player.y + this.player.body.halfHeight >= this.game.config.height) {
			this.playerTouchBarrier();
		}
	}

	calculateWorldSpeed() {
		return this.GAME_SPEED + this.countFloughtFreeSpaces * 5;
	}

	addOverlap() {
		this.physics.add.overlap(this.player, this.pipesGroup, this.playerTouchBarrier, undefined, this);
	}

	createPipes() {
		this.pipesGroup = new PipesGroup(this);
	}

	createPlayer() {
		const initData = {
			x: 200,
			y: this.physics.world.bounds.centerY,
			texture: "player",
			frame: 0,
		};
		this.player = new Player(this, initData);
	}

	playerTouchBarrier() {
		if (!this.playerInvulnerability) {
			this.player.onDamagePlayer();
			this.decrementLivesSprite();
		}
	}

	decrementLivesSprite() {
		const emptySectorWidth = this.textures.getFrame("emptySector", 0).width;
		this.add
			.image(this.healthSprite.x + 122 - (this.DEFAULT_PLAYER_HEALTH - this.playerHealth) * emptySectorWidth, this.healthSprite.y + 9, "emptySector")
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

	createHeader() {
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

	calculateScore() {
		const step = this.currentDiffScore / this.FREE_SPACES;
		const resultScore = Math.round(this.score + step);
		if (resultScore > this.currentDiffScore) {
			return this.currentDiffScore;
		}
		return resultScore;
	}

	addScore() {
		this.countFloughtFreeSpaces += 1;
		this.countFloughtFreeSpacesOnDiff += 1;
		this.score = this.calculateScore();
		this.scoreText.setText(this.score);
	}

	destroyGame(status) {
		this.timerEvent.remove();
		this.events.off("update", this.player.checkUpdate, this.player);
		this.pipesGroup.stopEvents();
		this.scene.start("GameEnd", { finishStatus: status, score: this.score });
	}
}
