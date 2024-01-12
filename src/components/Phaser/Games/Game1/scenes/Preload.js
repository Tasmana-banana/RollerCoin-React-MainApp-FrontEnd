import { Scene } from "phaser";

export default class Preload extends Scene {
	constructor() {
		super({ key: "Preload" });
	}

	preload() {
		const prefixForLang = this.game.isEnglishLang ? "" : "_cn";
		this.load.spritesheet("bitcoin", "/static/img/game_sprites/game1/bitcoin_sprite.png", { frameWidth: 65, frameHeight: 70 });
		this.load.spritesheet("dogecoin", "/static/img/game_sprites/game1/dogecoin_sprite.png", { frameWidth: 65, frameHeight: 70 });
		this.load.spritesheet("lightcoin", "/static/img/game_sprites/game1/lightcoin_sprite.png", { frameWidth: 65, frameHeight: 70 });
		this.load.spritesheet("dashcoin", "/static/img/game_sprites/game1/dashcoin_sprite.png", { frameWidth: 65, frameHeight: 70 });
		this.load.spritesheet("explosion", "/static/img/game_sprites/game1/coin_explosion_sprite.png", { frameWidth: 105, frameHeight: 140 });
		this.load.spritesheet("bomb", "/static/img/game_sprites/game1/bomb_sprite.png", { frameWidth: 75, frameHeight: 185 });
		this.load.spritesheet("bomb_explosion", "/static/img/game_sprites/game1/bomb_explosion_sprite.png", { frameWidth: 240, frameHeight: 240 });
		this.load.spritesheet("grass", "/static/img/game_sprites/game1/grass_sprite.png?v=1", { frameWidth: 960, frameHeight: 126 });
		this.load.image("fence", "/static/img/game_sprites/game1/fence_sprite.png?v=2");
		this.load.image("cloudFirst", "/static/img/game_sprites/game1/cloud1.png");
		this.load.image("cloudSecond", "/static/img/game_sprites/game1/cloud2.png");
		this.load.image("startBackground", "/static/img/game_sprites/game1/background_screen.png");
		this.load.image("hamster", "/static/img/game_sprites/game1/hamster.png");
		this.load.image("start", `/static/img/game_sprites/game6/start${prefixForLang}.png`);
		this.load.image("scoreSprite", "/static/img/game_sprites/score.png");
		this.load.image("timeSprite", "/static/img/game_sprites/time.png");
		this.load.spritesheet("preloadGame", "/static/img/game_sprites/321go.png?v=1.1", { frameWidth: 373, frameHeight: 141 });
		this.load.image("start_fullscreen", `/static/img/game_sprites/game6/fullscreen${prefixForLang}.png`);
		this.load.image("restartSprite", `/static/img/game_sprites/restart${prefixForLang}.png`);
		this.load.image("gainSprite", `/static/img/game_sprites/gain_power${prefixForLang}.png`);
		this.load.image("gameOver", `/static/img/game_sprites/game_over${prefixForLang}.png`);
		this.load.image("quitButton", `/static/img/game_sprites/quit.png`);
		this.load.image("youWin", `/static/img/game_sprites/you_win${prefixForLang}.png`);
		this.cameras.main.setBackgroundColor("#b9f1f9");
	}

	create() {
		this.scene.start("Start");
	}
}
