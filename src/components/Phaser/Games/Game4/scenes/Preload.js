import { Scene } from "phaser";

export default class Preload extends Scene {
	constructor() {
		super({ key: "Preload" });
	}

	preload() {
		const prefixForLang = this.game.isEnglishLang ? "" : "_cn";
		const platformWidthByNumber = {
			1: 198,
			2: 183,
			3: 168,
			4: 153,
			5: 138,
		};
		const version = "2.0.0";
		const platformNumber = Math.ceil(this.game.customOptions.level / 2);
		this.load.spritesheet("platform", `/static/img/game_sprites/game4/platform_${platformNumber}.png?v=${version}`, { frameWidth: platformWidthByNumber[platformNumber], frameHeight: 33 });
		this.load.spritesheet("ball", `/static/img/game_sprites/game4/default_ball.png?v=${version}`, { frameWidth: 30, frameHeight: 30 });
		this.load.spritesheet("block2", `/static/img/game_sprites/game4/block_lvl_2.png?v=${version}`, { frameWidth: 63, frameHeight: 69 });
		this.load.spritesheet("block3", `/static/img/game_sprites/game4/block_lvl_3.png?v=${version}`, { frameWidth: 63, frameHeight: 69 });
		this.load.spritesheet("explosion", `/static/img/game_sprites/game4/explosion.png?v=${version}`, { frameWidth: 102, frameHeight: 99 });
		this.load.spritesheet("preloadGame", "/static/img/game_sprites/321go.png?v=1.1", { frameWidth: 373, frameHeight: 141 });
		this.load.image("startBackground", `/static/img/game_sprites/game4/background.png?v=${version}`);
		this.load.image("frame", `/static/img/game_sprites/game4/frame.png?v=${version}`);
		this.load.image("slime_platform", `/static/img/game_sprites/game4/slime_platform_${platformNumber}.png?v=${version}`);
		this.load.image("flame_platform", `/static/img/game_sprites/game4/flame_platform_${platformNumber}.png?v=${version}`);
		this.load.image("block1", `/static/img/game_sprites/game4/block_lvl_1.png?v=${version}`);
		this.load.image("chain_horizontal", `/static/img/game_sprites/game4/chain.png?v=${version}`);
		this.load.image("chain_vertical", `/static/img/game_sprites/game4/chain_vertical.png?v=${version}`);
		this.load.image("controls", `/static/img/game_sprites/game4/controls.png?v=${version}`);
		this.load.image("controls_mobile", `/static/img/game_sprites/game4/controls_mobile.png?v=${version}`);
		this.load.image("live", `/static/img/game_sprites/game4/heart.png?v=${version}`);
		this.load.image("slime", `/static/img/game_sprites/game4/slime.png?v=${version}`);
		this.load.image("fireball", `/static/img/game_sprites/game4/flame.png?v=${version}`);
		this.load.image("weapon", `/static/img/game_sprites/game4/cannons.png?v=${version}`);
		this.load.image("bullet", `/static/img/game_sprites/game4/lazer_shot.png?v=${version}`);
		this.load.image("gun", `/static/img/game_sprites/game4/lazer_cannon.png?v=${version}`);
		this.load.image("trail1", `/static/img/game_sprites/game4/trail_1.png?v=${version}`);
		this.load.image("trail2", `/static/img/game_sprites/game4/trail_2.png?v=${version}`);
		this.load.image("trail3", `/static/img/game_sprites/game4/trail_3.png?v=${version}`);
		this.load.image("trail4", `/static/img/game_sprites/game4/trail_4.png?v=${version}`);
		this.load.image("trail5", `/static/img/game_sprites/game4/trail_5.png?v=${version}`);
		// DEFAULT SPRITES
		this.load.image("start", `/static/img/game_sprites/game6/start${prefixForLang}.png?v=${version}`);
		this.load.image("scoreSprite", `/static/img/game_sprites/game2/score.png?v=${version}`);
		this.load.image("livesSprite", `/static/img/game_sprites/game2/lives.png?v=${version}`);
		this.load.image("timeSprite", `/static/img/game_sprites/game2/time.png?v=${version}`);
		this.load.image("emptySector", `/static/img/game_sprites/empty_sector.png?v=${version}`);

		this.load.image("headerSprite", `/static/img/game_sprites/game2/header.png?v=${version}`);
		this.load.image("start_fullscreen", `/static/img/game_sprites/game6/fullscreen${prefixForLang}.png?v=${version}`);
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
