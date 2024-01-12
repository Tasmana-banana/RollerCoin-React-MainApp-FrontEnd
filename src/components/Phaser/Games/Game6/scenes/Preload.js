import { Scene } from "phaser";

export default class Preload extends Scene {
	constructor() {
		super({ key: "Preload" });
	}

	preload() {
		const version = "2.0.0";
		const prefixForLang = this.game.isEnglishLang ? "" : "_cn";
		this.load.image("startBackground", `/static/img/game_sprites/game6/title-screen.png?v=${version}`);
		this.load.image("platform0", `/static/img/game_sprites/game6/platform_0.png?v=${version}`);
		this.load.spritesheet("platform1", `/static/img/game_sprites/game6/platform_1.png?v=${version}`, { frameWidth: 138, frameHeight: 60 });
		this.load.spritesheet("platform2", `/static/img/game_sprites/game6/platform_2.png?v=${version}`, { frameWidth: 126, frameHeight: 48 });
		this.load.image("bullet", `/static/img/game_sprites/game6/bullet.png?v=${version}`);
		this.load.image("alien0", `/static/img/game_sprites/game6/alien_0.png?v=${version}`);
		this.load.spritesheet("alien1", `/static/img/game_sprites/game6/alien_1.png?v=${version}`, { frameWidth: 72, frameHeight: 153 });
		this.load.image("alien2", `/static/img/game_sprites/game6/alien_2.png?v=${version}`);
		this.load.spritesheet("player", `/static/img/game_sprites/game6/hamster.png?v=${version}`, { frameWidth: 63, frameHeight: 96 });
		this.load.spritesheet("fire", `/static/img/game_sprites/game6/fire_from_ass.png?v=${version}`, { frameWidth: 63, frameHeight: 42 });
		this.load.image("lazergun", `/static/img/game_sprites/game6/lazergun.png?v=${version}`);
		this.load.image("space", `/static/img/game_sprites/game6/space-backgroung.png?v=${version}`);
		this.load.image("asteroids", `/static/img/game_sprites/game6/asteroids.png?v=${version}`);
		this.load.image("start", `/static/img/game_sprites/game6/start${prefixForLang}.png?v=${version}`);
		this.load.image("flag", `/static/img/game_sprites/game6/flag.png?v=${version}`);
		this.load.image("head", `/static/img/game_sprites/game6/hamster_head.png?v=${version}`);
		this.load.spritesheet("preloadGame", "/static/img/game_sprites/321go.png?v=1.1", { frameWidth: 373, frameHeight: 141 });
		this.load.image("startFullscreen", `/static/img/game_sprites/game6/fullscreen${prefixForLang}.png?v=${version}`);
		this.load.image("restartSprite", `/static/img/game_sprites/restart${prefixForLang}.png?v=${version}`);
		this.load.image("gainSprite", `/static/img/game_sprites/gain_power${prefixForLang}.png?v=${version}`);
		this.load.image("quitButton", `/static/img/game_sprites/quit.png?v=${version}`);
		this.load.image("gameOver", `/static/img/game_sprites/game_over${prefixForLang}.png?v=${version}`);
		this.load.image("youWin", `/static/img/game_sprites/you_win${prefixForLang}.png?v=${version}`);
		// default sprites
		this.load.image("score", `/static/img/game_sprites/score_with_icon.png?v=${version}`);
		this.load.image("lives", `/static/img/game_sprites/lives_single.png?v=${version}`);
		this.load.image("time", `/static/img/game_sprites/time_with_icon.png?v=${version}`);
		this.load.image("emptySector", `/static/img/game_sprites/empty_sector.png?v=${version}`);
		this.load.image("header", `/static/img/game_sprites/header.png?v=${version}`);
	}

	create() {
		this.scene.start("Start");
	}
}
