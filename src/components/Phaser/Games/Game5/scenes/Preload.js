import { Scene } from "phaser";

export default class Preload extends Scene {
	constructor() {
		super({ key: "Preload" });
	}

	preload() {
		const version = "2.0.0";
		const prefixForLang = this.game.isEnglishLang ? "" : "_cn";
		this.load.image("startBackground", `/static/img/game_sprites/game5/bg.png?v=${version}`);
		this.load.spritesheet("orbs", `/static/img/game_sprites/game5/coins.png?v=${version}`, { frameWidth: 66, frameHeight: 66 });
		this.load.image("start", `/static/img/game_sprites/game6/start${prefixForLang}.png?v=${version}`);
		this.load.image("scoreSprite", `/static/img/game_sprites/score.png?v=${version}`);
		this.load.image("countSprite", `/static/img/game_sprites/game5/count.png?v=${version}`);
		this.load.image("timeSprite", `/static/img/game_sprites/time.png?v=${version}`);
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
