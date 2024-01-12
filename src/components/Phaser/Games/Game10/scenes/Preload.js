import { Scene } from "phaser";
import block from "../../../../../assets/img/game_sprites/game10/block.png";
import blockLong from "../../../../../assets/img/game_sprites/game10/block-long.png";
import btc from "../../../../../assets/img/game_sprites/game10/btc.png";
import cityBg from "../../../../../assets/img/game_sprites/game10/city_bg.png";
import coneA from "../../../../../assets/img/game_sprites/game10/cone_a.png";
import coneB from "../../../../../assets/img/game_sprites/game10/cone_b.png";
import doge from "../../../../../assets/img/game_sprites/game10/doge.png";
import eth from "../../../../../assets/img/game_sprites/game10/eth.png";
import garbageCan from "../../../../../assets/img/game_sprites/game10/garbage_can.png";
import garbageCartA from "../../../../../assets/img/game_sprites/game10/garbage_cart_a.png";
import garbageCartB from "../../../../../assets/img/game_sprites/game10/garbage_cart_b.png";
import rlt from "../../../../../assets/img/game_sprites/game10/rlt.png";
import hamster from "../../../../../assets/img/game_sprites/game10/hamster_sprite.png";
import controls from "../../../../../assets/img/game_sprites/game10/controls.png";
import controlsMobile from "../../../../../assets/img/game_sprites/game10/controls_mobile.png";
import startBackground from "../../../../../assets/img/game_sprites/game10/preview.png";
import dove from "../../../../../assets/img/game_sprites/game10/dove.png";
import trafficLights from "../../../../../assets/img/game_sprites/game10/sign_traffic_lights.png";
import preloadGame from "../../../../../assets/img/game_sprites/321go.png";
import lives from "../../../../../assets/img/game_sprites/lives.png";
import header from "../../../../../assets/img/game_sprites/header.png";
import score from "../../../../../assets/img/game_sprites/score_with_icon.png";
import time from "../../../../../assets/img/game_sprites/time_with_icon.png";

export default class Preload extends Scene {
	constructor() {
		super({ key: "Preload" });
	}

	preload() {
		const prefixForLang = this.game.isEnglishLang ? "" : "_cn";
		this.load.image("start", `/static/img/game_sprites/start${prefixForLang}.png`);
		this.load.image("startFullscreen", `/static/img/game_sprites/fullscreen${prefixForLang}.png`);
		this.load.image("restartSprite", `/static/img/game_sprites/restart${prefixForLang}.png`);
		this.load.image("gainSprite", `/static/img/game_sprites/gain_power${prefixForLang}.png`);
		this.load.image("gameOver", `/static/img/game_sprites/game_over${prefixForLang}.png`);
		this.load.image("quitButton", `/static/img/game_sprites/quit.png`);
		this.load.image("youWin", `/static/img/game_sprites/you_win${prefixForLang}.png`);
		this.load.spritesheet("preloadGame", "/static/img/game_sprites/321go.png?v=1.1", { frameWidth: 373, frameHeight: 141 });
		this.load.spritesheet("lives", lives, { frameWidth: 138, frameHeight: 42 });
		// game images
		this.load.image("startBackground", startBackground);
		this.load.image("controlsPC", controls);
		this.load.image("controlsMobile", controlsMobile);
		this.load.image("score", score);
		this.load.image("time", time);
		this.load.image("header", header);
		this.load.image("block", block);
		this.load.image("blockLong", blockLong);
		this.load.image("cityBg", cityBg);
		this.load.image("coneA", coneA);
		this.load.image("coneB", coneB);
		this.load.image("garbageCan", garbageCan);
		this.load.image("garbageCartA", garbageCartA);
		this.load.image("garbageCartB", garbageCartB);
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
