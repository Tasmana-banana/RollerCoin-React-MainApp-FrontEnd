import { Scene } from "phaser";

import preloadGame from "../../../../../assets/img/game_sprites/321go.png";

export default class Preload extends Scene {
	constructor() {
		super({ key: "Preload" });
	}

	preload() {
		const prefixForLang = this.game.isEnglishLang ? "" : "_cn";
		const version = "2.0.0";
		this.load.image("startBackground", `/static/img/game_sprites/game8/background_b.png?v=${version}`);
		this.load.image("mainScreen", `/static/img/game_sprites/game8/background_a.png?v=${version}`);
		this.load.image("shell_3_4", `/static/img/game_sprites/game8/shell_3_4.png?v=${version}`);
		this.load.image("shell_4_4", `/static/img/game_sprites/game8/shell_4_4.png?v=${version}`);
		this.load.image("shell_5_4", `/static/img/game_sprites/game8/shell_5_4.png?v=${version}`);
		this.load.image("controlsPC", `/static/img/game_sprites/game8/controls.png?v=${version}`);
		this.load.image("controlsMobile", `/static/img/game_sprites/game8/controls_mobile.png?v=${version}`);
		this.COINS = ["bitcoin", "binance", "rollercoin", "ethereum", "litecoin", "monero", "ripple", "eos", "stellar", "tether"];
		this.COINS.forEach((coin) => this.load.spritesheet(coin, `/static/img/game_sprites/game8/${coin}.png?v=${version}`, { frameWidth: 171, frameHeight: 171 }));
		this.load.image("start", `/static/img/game_sprites/start${prefixForLang}.png?v=${version}`);
		this.load.image("score", `/static/img/game_sprites/score_with_icon.png?v=${version}`);
		this.load.image("time", `/static/img/game_sprites/time_with_icon.png?v=${version}`);
		this.load.image("header", `/static/img/game_sprites/header.png?v=${version}`);
		this.load.spritesheet("preloadGame", "/static/img/game_sprites/321go.png?v=1.1", { frameWidth: 373, frameHeight: 141 });
		this.load.image("startFullscreen", `/static/img/game_sprites/fullscreen${prefixForLang}.png?v=${version}`);
		this.load.image("restartSprite", `/static/img/game_sprites/restart${prefixForLang}.png?v=${version}`);
		this.load.image("gainSprite", `/static/img/game_sprites/gain_power${prefixForLang}.png?v=${version}`);
		this.load.image("quitButton", `/static/img/game_sprites/quit.png?v=${version}`);
		this.load.image("gameOver", `/static/img/game_sprites/game_over${prefixForLang}.png?v=${version}`);
		this.load.image("youWin", `/static/img/game_sprites/you_win${prefixForLang}.png?v=${version}`);
		this.cameras.main.setBackgroundColor("#6c6c6c");
	}

	create() {
		this.scene.start("Start");
	}
}
