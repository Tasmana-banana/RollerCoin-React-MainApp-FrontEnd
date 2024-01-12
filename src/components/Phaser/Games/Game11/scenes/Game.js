import { Scene } from "phaser";
import { MersenneTwister19937, Random } from "random-js";
import Player from "../items/Player";

export default class Game extends Scene {
	constructor() {
		super({ key: "Game" });
	}

	create() {
		this.physics.world.setFPS(60);
		this.diff = this.game.customOptions.level;
		this.currentDiffScore = this.game.rewardsList[this.diff];
		this.ROADS_LIST = ["road1", "road2", "road3", "road4"];
		this.POSITION_ON_ROAD = [473, 570, 667];
		this.TYPE_OF_ROAD_OBJECT = {
			SEWER_HATCH: "SEWER_HATCH",
			ROAD_WORKS: "ROAD_WORKS",
			TRAFFIC: "TRAFFIC",
			COINS: "COINS",
		};
		this.GAME_CONFIG = [
			{
				sewerHatchPercent: 60,
				roadWorksPercent: 60,
				trafficPercent: 60,
				coinPercent: 8,
				coinLimitOnRoad: 15,
				worldSpeed: -775,
			},
			{
				sewerHatchPercent: 55,
				roadWorksPercent: 55,
				trafficPercent: 55,
				coinPercent: 8,
				coinLimitOnRoad: 15,
				worldSpeed: -800,
			},
			{
				sewerHatchPercent: 50,
				roadWorksPercent: 50,
				trafficPercent: 50,
				coinPercent: 10,
				coinLimitOnRoad: 15,
				worldSpeed: -825,
			},
			{
				sewerHatchPercent: 45,
				roadWorksPercent: 45,
				trafficPercent: 45,
				coinPercent: 10,
				coinLimitOnRoad: 15,
				worldSpeed: -850,
			},
			{
				sewerHatchPercent: 42,
				roadWorksPercent: 42,
				trafficPercent: 42,
				coinPercent: 10,
				coinLimitOnRoad: 15,
				worldSpeed: -875,
			},
			{
				sewerHatchPercent: 40,
				roadWorksPercent: 40,
				trafficPercent: 40,
				coinPercent: 20,
				coinLimitOnRoad: 10,
				worldSpeed: -900,
			},
			{
				sewerHatchPercent: 38,
				roadWorksPercent: 38,
				trafficPercent: 38,
				coinPercent: 24,
				coinLimitOnRoad: 10,
				worldSpeed: -925,
			},
			{
				sewerHatchPercent: 34,
				roadWorksPercent: 34,
				trafficPercent: 34,
				coinPercent: 28,
				coinLimitOnRoad: 10,
				worldSpeed: -950,
			},
			{
				sewerHatchPercent: 30,
				roadWorksPercent: 30,
				trafficPercent: 30,
				coinPercent: 28,
				coinLimitOnRoad: 6,
				worldSpeed: -975,
			},
			{
				sewerHatchPercent: 30,
				roadWorksPercent: 20,
				trafficPercent: 30,
				coinPercent: 30,
				coinLimitOnRoad: 10,
				worldSpeed: -1000,
			},
		];
		this.COINS_FOR_WIN = 30;
		this.finishStatus = null;
		this.score = 0;
		this.gameTime = 60;
		this.takedCoins = 0;
		this.isButtonPress = false;
		this.countOfTraffic = 0;
		this.objectOnRoad = 0;
		this.coinsGroupOnRoad = 0;
		this.isRoadWorksOnMap = false;
		this.isPlayerImmortal = false;
		this.backgroundGroup = this.physics.add.group();
		this.topRoadLine = this.add.group();
		this.middleRoadLine = this.add.group();
		this.bottomRoadLine = this.add.group();
		this.gameItems = [this.addSewerHatch, this.addRoadWork, this.addTraffic];
		this.roadLineList = [this.topRoadLine, this.middleRoadLine, this.bottomRoadLine];
		this.player = new Player(this, 180, 590);
		this.createDashboard();
		this.addBackground();
		this.addOverlaps();
	}

	createDashboard = () => {
		const textStyle = { font: "24px 'Roboto'", fill: "#a3aeb4", align: "center" };
		this.livesSprite = this.add.sprite(0, 25, "lives");
		this.livesSprite.setOrigin(0, 0.5);
		this.livesSprite.setDepth(1);
		const scoreImage = this.add.image(this.livesSprite.displayWidth + 5, 25, "score");
		scoreImage.setOrigin(0, 0.5);
		scoreImage.setDepth(1);
		this.scoreText = this.add.text(scoreImage.x + 100, 4 + scoreImage.height / 2, "0", textStyle);
		this.scoreText.setOrigin(0.5);
		this.scoreText.setDepth(1);
		const timeImage = this.add.sprite(scoreImage.x + scoreImage.width + 5, 25, "time");
		timeImage.setOrigin(0, 0.5);
		timeImage.setDepth(1);
		this.timeText = this.add.text(timeImage.x + 100, 4 + scoreImage.height / 2, "01:00", textStyle);
		this.timeText.setOrigin(0.5);
		this.timeText.setDepth(1);
		this.timedEvent = this.time.addEvent({ delay: 1000, callback: this.onTimerEvent, loop: true });
	};

	onTimerEvent = () => {
		this.gameTime -= 1;
		if (this.gameTime < 0) {
			this.destroyGame(1);
		} else if (this.gameTime < 10) {
			this.timeText.setText(`00:0${this.gameTime}`);
		} else {
			this.timeText.setText(`00:${this.gameTime}`);
		}
	};

	getRandomNumber = (min, max) => {
		const random = new Random(MersenneTwister19937.autoSeed());
		return random.integer(min, max);
	};

	reBornPlayer = () => {
		const fullLiveSpriteCount = 3;
		this.isPlayerImmortal = true;
		this.player.lives -= 1;
		if (this.player.lives < 1) {
			this.destroyGame(2);
		}
		this.livesSprite.setFrame(fullLiveSpriteCount - this.player.lives);
		this.add.tween({
			targets: this.player,
			ease: "Sine.easeInOut",
			duration: 200,
			delay: 0,
			repeat: 10,
			alpha: { from: 0.3, to: 1 },
			onComplete: () => {
				this.isPlayerImmortal = false;
				this.player.setAlpha(1);
			},
		});
	};

	changeScore = () => {
		const coinValue = this.currentDiffScore / this.COINS_FOR_WIN;
		this.score = Math.round(this.takedCoins * coinValue);
		if (this.score > this.currentDiffScore) {
			this.score = this.currentDiffScore;
		}
		this.scoreText.setText(this.score);
		if (this.takedCoins >= this.COINS_FOR_WIN) {
			this.destroyGame(3);
		}
	};

	addOverlaps = () => {
		this.physics.add.overlap(this.player, this.topRoadLine, (player, object) => this.overlapsHandler(player, object, 0), null, this);
		this.physics.add.overlap(this.player, this.middleRoadLine, (player, object) => this.overlapsHandler(player, object, 1), null, this);
		this.physics.add.overlap(this.player, this.bottomRoadLine, (player, object) => this.overlapsHandler(player, object, 2), null, this);
	};

	overlapsHandler = (player, object, line) => {
		if (object.type === this.TYPE_OF_ROAD_OBJECT.COINS && !object.taked) {
			object.taked = true;
			this.takedCoins += 1;
			this.changeScore();
			if (this.takedCoins >= this.COINS_FOR_WIN) {
				this.destroyGame(3);
			}
			return this.tweens.add({
				targets: object,
				y: object.y - 80,
				duration: 500,
				ease: "Cubic.easeOut",
				callbackScope: this,
				onStart() {
					object.playDestroyAnim();
				},
				onComplete() {
					this.roadLineList[line].killAndHide(object);
				},
			});
		}
		if (!object.taked && !this.isPlayerImmortal) {
			object.taked = true;
			return this.reBornPlayer();
		}
	};

	addBackground = () => {
		const { height, width } = this.game.config;
		for (let i = 0; i < 5; i += 1) {
			const randomRoad = this.getRandomNumber(0, this.ROADS_LIST.length - 1);
			const nextRoad = this.ROADS_LIST[randomRoad];
			const background = this.add.tileSprite(width * i, height / 2, width, height, nextRoad);
			background.setOrigin(0, 0.5);
			background.setDepth(0);
			this.physics.add.existing(background);
			background.body.setImmovable(true);
			this.backgroundGroup.add(background);
		}
		this.backgroundGroup.setVelocityX(this.GAME_CONFIG[this.diff - 1].worldSpeed);
	};

	calculateRoadObjects = () => {
		const bonusLine = this.getRandomNumber(0, this.POSITION_ON_ROAD.length - 1);
		this.POSITION_ON_ROAD.forEach((_, roadLine) => {
			if (this.roadLineList[roadLine].getLength() >= 1) {
				return false;
			}
			if (roadLine === bonusLine) {
				const bonuses = this.addCoins(roadLine);
				return bonuses ? bonuses.forEach((bonus) => this.roadLineList[roadLine].add(bonus)) : false;
			}
			const randomOfItem = this.getRandomNumber(0, this.gameItems.length - 1);
			const createFunc = this.gameItems[randomOfItem];
			const roadItem = createFunc(roadLine);
			if (!roadItem) {
				return false;
			}
			this.roadLineList[roadLine].add(roadItem);
		});
	};

	addCoins = (line) => {
		if (this.getRandomNumber(1, 100) < this.GAME_CONFIG[this.diff - 1].coinPercent || this.coinsGroupOnRoad >= this.GAME_CONFIG[this.diff - 1].coinLimitOnRoad) {
			return null;
		}
		const coinID = this.getRandomNumber(1, 4);
		const { width } = this.game.config;
		const roadLine = this.POSITION_ON_ROAD[line];
		this.prevCoinRoadLine = roadLine;
		const countOfCoins = this.getRandomNumber(2, 4);
		const randomOffset = this.getRandomNumber(-40, 40);
		const coinsArray = [];
		for (let i = 0; i < countOfCoins; i += 1) {
			const coin = this.physics.add.sprite(width * 2 + i * 60 + randomOffset, roadLine + 20, `coin${coinID}`);
			this.anims.create({
				key: `coinFlip${coinID}`,
				frames: this.anims.generateFrameNumbers(`coin${coinID}`, { start: 0, end: 4 }),
				frameRate: 5,
				repeat: -1,
			});
			this.anims.create({
				key: `coinFlipDestroy${coinID}`,
				frames: this.anims.generateFrameNumbers(`coinDestroy${coinID}`, { start: 0, end: 7 }),
				duration: 500,
				frameRate: 16,
				repeat: 0,
			});
			coin.anims.play(`coinFlip${coinID}`);
			coin.setOrigin(0.5);
			coin.setImmovable(true);
			coin.setVelocityX(this.GAME_CONFIG[this.diff - 1].worldSpeed);
			coin.setDepth(line + 1);
			coin.type = this.TYPE_OF_ROAD_OBJECT.COINS;
			coin.playDestroyAnim = () => coin.anims.play(`coinFlipDestroy${coinID}`, true);
			coinsArray.push(coin);
			this.coinsGroupOnRoad += 1;
		}
		return coinsArray;
	};

	addSewerHatch = (line) => {
		if (this.getRandomNumber(1, 100) < this.GAME_CONFIG[this.diff - 1].sewerHatchPercent || this.objectOnRoad >= 2) {
			return null;
		}
		const sewerHatchID = this.getRandomNumber(1, 2);
		const { width } = this.game.config;
		const roadLine = this.POSITION_ON_ROAD[line];
		const addedWidth = this.getRandomNumber(10, 80);
		const sewerHatch = this.physics.add.sprite(width * 2 + addedWidth, roadLine + 50, `sewerHatch${sewerHatchID}`);
		sewerHatch.setOrigin(0.5);
		sewerHatch.setImmovable(true);
		sewerHatch.setVelocityX(this.GAME_CONFIG[this.diff - 1].worldSpeed);
		sewerHatch.body.setSize(60, 50);
		sewerHatch.body.setOffset(15, 5);
		sewerHatch.setDepth(1);
		sewerHatch.type = this.TYPE_OF_ROAD_OBJECT.SEWER_HATCH;
		this.objectOnRoad += 1;
		return sewerHatch;
	};

	addTraffic = (line) => {
		if (this.getRandomNumber(1, 100) < this.GAME_CONFIG[this.diff - 1].trafficPercent || this.objectOnRoad >= 2) {
			return null;
		}
		const carID = this.getRandomNumber(1, 4);
		const { width } = this.game.config;
		const roadLine = this.POSITION_ON_ROAD[line];
		const traffic = this.physics.add.sprite(width * 2, roadLine + 10, `vehicles${carID}`);
		this.anims.create({
			key: `moveTraffic${carID}`,
			frames: this.anims.generateFrameNumbers(`vehicles${carID}`, { start: 0, end: 3 }),
			frameRate: 4,
			repeat: -1,
		});
		traffic.anims.play(`moveTraffic${carID}`);
		traffic.setOrigin(0.5);
		traffic.setImmovable(true);
		const velocityFactor = this.getRandomNumber(-20, 20);
		traffic.setVelocityX(this.GAME_CONFIG[this.diff - 1].worldSpeed / 2 + velocityFactor);
		traffic.body.setSize(this.textures.get(`vehicles${carID}`).getSourceImage().width / 4 - 70, 60);
		traffic.body.setOffset(50, 65);
		traffic.setDepth(line + 1);
		traffic.type = this.TYPE_OF_ROAD_OBJECT.TRAFFIC;
		this.countOfTraffic += 1;
		this.objectOnRoad += 1;
		return traffic;
	};

	addRoadWork = (line) => {
		if (this.getRandomNumber(1, 100) < this.GAME_CONFIG[this.diff - 1].roadWorksPercent || this.isRoadWorksOnMap || this.objectOnRoad >= 2) {
			return null;
		}
		const checkedLine = line;
		const { width } = this.textures.get("roadWorks").getSourceImage();
		const roadLine = this.POSITION_ON_ROAD[checkedLine];
		const roadWork = this.physics.add.sprite(width * 2, roadLine, "roadWorks");
		this.isRoadWorksOnMap = true;
		roadWork.setOrigin(0.5);
		roadWork.setImmovable(true);
		roadWork.setVelocityX(this.GAME_CONFIG[this.diff - 1].worldSpeed);
		roadWork.body.setSize(1130, 60);
		roadWork.body.setOffset(45, 100);
		roadWork.setDepth(checkedLine + 1);
		roadWork.type = this.TYPE_OF_ROAD_OBJECT.ROAD_WORKS;
		this.objectOnRoad += 1;
		return roadWork;
	};

	destroyGame = (status) => {
		this.timedEvent.remove();
		this.player.unsubscribeUpdateEvents();
		this.scene.start("GameEnd", { finishStatus: status, score: this.score });
	};

	checkObjectsOnRoad = (item, roadLine) => {
		const { width } = this.game.config;
		if (item.x + item.width > width / 2 && item.x + item.width <= width / 2 + 10) {
			if (item.type === this.TYPE_OF_ROAD_OBJECT.TRAFFIC) {
				this.countOfTraffic -= 1;
				this.objectOnRoad -= 1;
			}
			if (item.type === this.TYPE_OF_ROAD_OBJECT.SEWER_HATCH) {
				this.objectOnRoad -= 1;
			}
			if (item.type === this.TYPE_OF_ROAD_OBJECT.COINS) {
				this.coinsGroupOnRoad -= 1;
			}
		}
		if (item.x + item.width <= 2) {
			this.roadLineList[roadLine].killAndHide(item);
			this.roadLineList[roadLine].remove(item);
			if (item.type === this.TYPE_OF_ROAD_OBJECT.ROAD_WORKS) {
				this.isRoadWorksOnMap = false;
				this.objectOnRoad -= 1;
			}
			if (item.type === this.TYPE_OF_ROAD_OBJECT.TRAFFIC) {
				this.countOfTraffic -= 1;
				this.objectOnRoad -= 1;
			}
			if (item.type === this.TYPE_OF_ROAD_OBJECT.SEWER_HATCH) {
				this.objectOnRoad -= 1;
			}
			if (item.type === this.TYPE_OF_ROAD_OBJECT.COINS) {
				this.coinsGroupOnRoad -= 1;
			}
		}
	};

	update() {
		const { width } = this.game.config;
		this.backgroundGroup.getChildren().forEach((bg) => {
			if (bg.x + bg.width <= 0) {
				bg.x += bg.width * 3;
				this.calculateRoadObjects();
			}
			if (bg.x + bg.width > width / 2 && bg.x + bg.width <= width / 2 + 10) {
				this.calculateRoadObjects();
			}
		}, this);
		this.topRoadLine.getChildren().forEach((item) => this.checkObjectsOnRoad(item, 0), this);
		this.middleRoadLine.getChildren().forEach((item) => this.checkObjectsOnRoad(item, 1), this);
		this.bottomRoadLine.getChildren().forEach((item) => this.checkObjectsOnRoad(item, 2), this);
	}
}
