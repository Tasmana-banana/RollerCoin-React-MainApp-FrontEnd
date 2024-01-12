import { Scene } from "phaser";

export default class Preload extends Scene {
	constructor() {
		super({ key: "Preload" });
	}

	preload() {
		const prefixForLang = this.game.isEnglishLang ? "" : "_cn";
		const version = "2.0.0";
		this.load.image("startBackground", `/static/img/game_sprites/game7/bg.png?v=${version}`);
		this.load.image("main_screen", `/static/img/game_sprites/game7/main_screen.png?v=${version}`);
		this.load.image("controls", `/static/img/game_sprites/game7/controls.png?v=${version}`);
		this.load.image("controls_mobile", `/static/img/game_sprites/game7/controls_mobile.png?v=${version}`);
		this.load.image("progressContainer", `/static/img/game_sprites/game7/progress.png?v=${version}`);
		this.load.image("progressBar", `/static/img/game_sprites/game7/progress_bar.png?v=${version}`);
		this.load.spritesheet("coins", `/static/img/game_sprites/game7/coins.png?v=${version}`, { frameWidth: 123, frameHeight: 129 });
		this.load.image("tile", `/static/img/game_sprites/game7/tile.png?v=${version}`);
		this.load.spritesheet("tiles", `/static/img/game_sprites/game7/tiles.png?v=${version}`, { frameWidth: 171, frameHeight: 171 });

		// DEFAULT SPRITES
		this.load.image("start", `/static/img/game_sprites/game6/start${prefixForLang}.png?v=${version}`);
		this.load.image("scoreSprite", `/static/img/game_sprites/game2/score.png?v=${version}`);
		this.load.image("timeSprite", `/static/img/game_sprites/game2/time.png?v=${version}`);
		this.load.image("headerSprite", `/static/img/game_sprites/game2/header.png?v=${version}`);

		this.load.spritesheet("preloadGame", "/static/img/game_sprites/321go.png?v=1.1", { frameWidth: 373, frameHeight: 141 });
		this.load.image("startFullscreen", `/static/img/game_sprites/game6/fullscreen${prefixForLang}.png?v=${version}`);
		this.load.image("restartSprite", `/static/img/game_sprites/restart${prefixForLang}.png?v=${version}`);
		this.load.image("gainSprite", `/static/img/game_sprites/gain_power${prefixForLang}.png?v=${version}`);
		this.load.image("quitButton", `/static/img/game_sprites/quit.png?v=${version}`);
		this.load.image("gameOver", `/static/img/game_sprites/game_over${prefixForLang}.png?v=${version}`);
		this.load.image("youWin", `/static/img/game_sprites/you_win${prefixForLang}.png?v=${version}`);
	}

	create() {
		this.scene.start("Start");
	}
}
