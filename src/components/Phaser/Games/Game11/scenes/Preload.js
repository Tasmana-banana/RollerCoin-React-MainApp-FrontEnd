import { Scene } from "phaser";
import btc from "../../../../../assets/img/game_sprites/game10/btc.png";
import doge from "../../../../../assets/img/game_sprites/game10/doge.png";
import eth from "../../../../../assets/img/game_sprites/game10/eth.png";
import rlt from "../../../../../assets/img/game_sprites/game10/rlt.png";
import preloadGame from "../../../../../assets/img/game_sprites/321go.png";
import hamster from "../../../../../assets/img/game_sprites/game10/hamster_sprite.png";
import score from "../../../../../assets/img/game_sprites/game2/score.png";
import time from "../../../../../assets/img/game_sprites/game2/time.png";
import dove from "../../../../../assets/img/game_sprites/game10/dove.png";
import trafficLights from "../../../../../assets/img/game_sprites/game10/sign_traffic_lights.png";
import lives from "../../../../../assets/img/game_sprites/lives.png";
import startBackground from "../../../../../assets/img/game_sprites/game11/new_startBackground.png";
import road1 from "../../../../../assets/img/game_sprites/game11/roads/new_road1.png";
import road2 from "../../../../../assets/img/game_sprites/game11/roads/new_road2.png";
import road3 from "../../../../../assets/img/game_sprites/game11/roads/new_road3.png";
import road4 from "../../../../../assets/img/game_sprites/game11/roads/new_road4.png";
import playerMove1 from "../../../../../assets/img/game_sprites/game11/player/move1.png";
import playerMove2 from "../../../../../assets/img/game_sprites/game11/player/move2.png";
import playerMove3 from "../../../../../assets/img/game_sprites/game11/player/move3.png";
import playerMoveUp1 from "../../../../../assets/img/game_sprites/game11/player/moveUp1.png";
import playerMoveUp2 from "../../../../../assets/img/game_sprites/game11/player/moveUp2.png";
import playerMoveUp3 from "../../../../../assets/img/game_sprites/game11/player/moveUp3.png";
import playerMoveDown1 from "../../../../../assets/img/game_sprites/game11/player/moveDown1.png";
import playerMoveDown2 from "../../../../../assets/img/game_sprites/game11/player/moveDown2.png";
import playerMoveDown3 from "../../../../../assets/img/game_sprites/game11/player/moveDown3.png";
import vehicles1 from "../../../../../assets/img/game_sprites/game11/vehicles/vehicles1.png";
import vehicles6 from "../../../../../assets/img/game_sprites/game11/vehicles/vehicles6.png";
import vehicles10 from "../../../../../assets/img/game_sprites/game11/vehicles/vehicles10.png";
import vehicles15 from "../../../../../assets/img/game_sprites/game11/vehicles/vehicles15.png";
import sewerHatch1 from "../../../../../assets/img/game_sprites/game11/obstacle/obstacle_1.png";
import sewerHatch2 from "../../../../../assets/img/game_sprites/game11/obstacle/obstacle_2.png";
import roadWorks from "../../../../../assets/img/game_sprites/game11/obstacle/obstacle_3.png";
import header from "../../../../../assets/img/game_sprites/game2/header.png";
import coinBTC from "../../../../../assets/img/game_sprites/game11/coins/btc/coins.png";
import coinDestroyBTC from "../../../../../assets/img/game_sprites/game11/coins/btc/coin_destroy.png";
import coinETH from "../../../../../assets/img/game_sprites/game11/coins/eth/coins.png";
import coinDestroyETH from "../../../../../assets/img/game_sprites/game11/coins/eth/coin_destroy.png";
import coinDOGE from "../../../../../assets/img/game_sprites/game11/coins/doge/coins.png";
import coinDestroyDOGE from "../../../../../assets/img/game_sprites/game11/coins/doge/coin_destroy.png";
import coinRLT from "../../../../../assets/img/game_sprites/game11/coins/rlt/coins.png";
import coinDestroyRLT from "../../../../../assets/img/game_sprites/game11/coins/rlt/coin_destroy.png";
import controls from "../../../../../assets/img/game_sprites/game11/controls.png";
import controlsMobile from "../../../../../assets/img/game_sprites/game11/controls_mobile.png";

export default class Preload extends Scene {
	constructor() {
		super({ key: "Preload" });
	}

	preload() {
		const prefixForLang = this.game.isEnglishLang ? "" : "_cn";
		this.load.image("start", `/static/img/game_sprites/game6/start${prefixForLang}.png`);
		this.load.image("startFullscreen", `/static/img/game_sprites/game6/fullscreen${prefixForLang}.png`);
		this.load.image("restartSprite", `/static/img/game_sprites/restart${prefixForLang}.png`);
		this.load.image("gainSprite", `/static/img/game_sprites/gain_power${prefixForLang}.png`);
		this.load.image("gameOver", `/static/img/game_sprites/game_over${prefixForLang}.png`);
		this.load.image("quitButton", `/static/img/game_sprites/quit.png`);
		this.load.image("youWin", `/static/img/game_sprites/you_win${prefixForLang}.png`);
		this.load.spritesheet("preloadGame", "/static/img/game_sprites/321go.png?v=1.1", { frameWidth: 373, frameHeight: 141 });
		// game images
		this.load.image("controlsPC", controls);
		this.load.image("controlsMobile", controlsMobile);
		this.load.spritesheet("lives", lives, { frameWidth: 138, frameHeight: 42 });
		this.load.image("score", score);
		this.load.image("time", time);
		this.load.image("header", header);
		this.load.image("startBackground", startBackground);
		this.load.image("road1", road1);
		this.load.image("road2", road2);
		this.load.image("road3", road3);
		this.load.image("road4", road4);
		this.load.spritesheet("playerMove3", playerMove1, { frameWidth: 336, frameHeight: 123 });
		this.load.spritesheet("playerMove2", playerMove2, { frameWidth: 338.25, frameHeight: 123 });
		this.load.spritesheet("playerMove1", playerMove3, { frameWidth: 338.25, frameHeight: 123 });
		this.load.spritesheet("playerMoveUp3", playerMoveUp1, { frameWidth: 339, frameHeight: 141 });
		this.load.spritesheet("playerMoveUp2", playerMoveUp2, { frameWidth: 339, frameHeight: 141 });
		this.load.spritesheet("playerMoveUp1", playerMoveUp3, { frameWidth: 339, frameHeight: 141 });
		this.load.spritesheet("playerMoveDown3", playerMoveDown1, { frameWidth: 339, frameHeight: 138 });
		this.load.spritesheet("playerMoveDown2", playerMoveDown2, { frameWidth: 339, frameHeight: 138 });
		this.load.spritesheet("playerMoveDown1", playerMoveDown3, { frameWidth: 339, frameHeight: 138 });
		this.load.spritesheet("vehicles1", vehicles1, { frameWidth: 389.25, frameHeight: 144 });
		this.load.spritesheet("vehicles2", vehicles6, { frameWidth: 431.25, frameHeight: 144 });
		this.load.spritesheet("vehicles3", vehicles10, { frameWidth: 389.25, frameHeight: 144 });
		this.load.spritesheet("vehicles4", vehicles15, { frameWidth: 389.25, frameHeight: 144 });
		this.load.spritesheet("coin1", coinBTC, { frameWidth: 57, frameHeight: 81 });
		this.load.spritesheet("coin2", coinETH, { frameWidth: 57, frameHeight: 81 });
		this.load.spritesheet("coin3", coinDOGE, { frameWidth: 57, frameHeight: 81 });
		this.load.spritesheet("coin4", coinRLT, { frameWidth: 57, frameHeight: 81 });
		this.load.spritesheet("coinDestroy1", coinDestroyBTC, { frameWidth: 78, frameHeight: 78 });
		this.load.spritesheet("coinDestroy2", coinDestroyETH, { frameWidth: 78, frameHeight: 78 });
		this.load.spritesheet("coinDestroy3", coinDestroyDOGE, { frameWidth: 75, frameHeight: 75 });
		this.load.spritesheet("coinDestroy4", coinDestroyRLT, { frameWidth: 75, frameHeight: 75 });
		this.load.image("sewerHatch1", sewerHatch1);
		this.load.image("sewerHatch2", sewerHatch2);
		this.load.image("roadWorks", roadWorks);

		// game sprites
		this.load.spritesheet("btc", btc, { frameWidth: 102, frameHeight: 108 });
		this.load.spritesheet("doge", doge, { frameWidth: 102, frameHeight: 108 });
		this.load.spritesheet("eth", eth, { frameWidth: 102, frameHeight: 108 });
		this.load.spritesheet("rlt", rlt, { frameWidth: 102, frameHeight: 108 });
		this.load.spritesheet("hamster", hamster, { frameWidth: 105, frameHeight: 93 });
		this.load.spritesheet("dove", dove, { frameWidth: 105, frameHeight: 81 });
		this.load.spritesheet("trafficLights", trafficLights, { frameWidth: 105, frameHeight: 291 });
	}

	create() {
		this.scene.start("Start");
	}
}
