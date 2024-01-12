import { Scene } from "phaser";
import player from "../../../../../assets/img/game_sprites/game3/player_sprite.png";
import explosion from "../../../../../assets/img/game_sprites/game3/explosion.png";
import smoke from "../../../../../assets/img/game_sprites/game3/smoke.png";
import preloadGame from "../../../../../assets/img/game_sprites/321go.png";

export default class Preload extends Scene {
	constructor() {
		super({ key: "Preload" });
	}

	preload() {
		const prefixForLang = this.game.isEnglishLang ? "" : "_cn";
		this.load.image("startBackground", "/static/img/game_sprites/game3/bg.png");
		this.load.spritesheet("player", player, { frameWidth: 222, frameHeight: 105 });
		this.load.spritesheet("smoke", smoke, { frameWidth: 54, frameHeight: 54 });
		this.load.image("candlestickChartGreen", "/static/img/game_sprites/game3/candlestick_chart_green.png?v=1.0.0");
		this.load.image("candlestickChartRed", "/static/img/game_sprites/game3/candlestick_chart_red.png?v=1.0.0");
		this.load.spritesheet("explosion", explosion, { frameWidth: 204, frameHeight: 135 });
		this.load.image("score", "/static/img/game_sprites/score_with_icon.png");
		this.load.image("lives", "/static/img/game_sprites/lives_single.png");
		this.load.image("time", "/static/img/game_sprites/time_with_icon.png");
		this.load.image("emptySector", "/static/img/game_sprites/empty_sector.png");
		this.load.image("header", "/static/img/game_sprites/header.png");
		this.load.spritesheet("preloadGame", "/static/img/game_sprites/321go.png?v=1.1", { frameWidth: 373, frameHeight: 141 });
		this.load.image("controlsPC", "/static/img/game_sprites/game3/controls.png");
		this.load.image("controlsMobile", "/static/img/game_sprites/game3/controls_mobile.png");
		this.load.image("start", `/static/img/game_sprites/start${prefixForLang}.png`);
		this.load.image("startFullscreen", `/static/img/game_sprites/fullscreen${prefixForLang}.png`);
		this.load.image("restartSprite", `/static/img/game_sprites/restart${prefixForLang}.png`);
		this.load.image("gainSprite", `/static/img/game_sprites/gain_power${prefixForLang}.png`);
		this.load.image("quitButton", `/static/img/game_sprites/quit.png`);
		this.load.image("gameOver", `/static/img/game_sprites/game_over${prefixForLang}.png`);
		this.load.image("youWin", `/static/img/game_sprites/you_win${prefixForLang}.png`);
		this.cameras.main.setBackgroundColor("#505050");
	}

	create() {
		this.scene.start("Start");
	}
}
