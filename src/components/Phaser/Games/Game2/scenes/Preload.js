import { Scene } from "phaser";
import bullet from "../../../../../assets/img/game_sprites/game2/bullet.png";
import alienBullet from "../../../../../assets/img/game_sprites/game2/alien_bullet.png";
import greenBullet from "../../../../../assets/img/game_sprites/game2/green_bullet.png";
import blueBullet from "../../../../../assets/img/game_sprites/game2/blue_bullet.png";
import bossFire from "../../../../../assets/img/game_sprites/game2/boss_fire.png";
import bug0 from "../../../../../assets/img/game_sprites/game2/small_bug.png";
import bug1 from "../../../../../assets/img/game_sprites/game2/big_bug.png";
import bug2 from "../../../../../assets/img/game_sprites/game2/middle_bug.png";
import bug3 from "../../../../../assets/img/game_sprites/game2/boss_bug.png";
import boss from "../../../../../assets/img/game_sprites/game2/alien_boss.png";
import explosion from "../../../../../assets/img/game_sprites/game2/explosion_sprite.png";
import spaceship from "../../../../../assets/img/game_sprites/game2/spaceship.png";
import startBackground from "../../../../../assets/img/game_sprites/game2/background.png";
import preloadGame from "../../../../../assets/img/game_sprites/321go.png";

export default class Preload extends Scene {
	constructor() {
		super({ key: "Preload" });
	}

	preload() {
		const version = "2.0.0";
		const prefixForLang = this.game.isEnglishLang ? "" : "_cn";
		this.load.spritesheet("bullet", bullet, { frameWidth: 9, frameHeight: 60 });
		this.load.spritesheet("alienBullet", alienBullet, { frameWidth: 18, frameHeight: 18 });
		this.load.spritesheet("greenBullet", greenBullet, { frameWidth: 24, frameHeight: 24 });
		this.load.spritesheet("blueBullet", blueBullet, { frameWidth: 69, frameHeight: 51 });
		this.load.spritesheet("bossFire", bossFire, { frameWidth: 57, frameHeight: 126 });
		this.load.spritesheet("bug0", bug0, { frameWidth: 75, frameHeight: 60 });
		this.load.spritesheet("bug1", bug1, { frameWidth: 63, frameHeight: 63 });
		this.load.spritesheet("bug2", bug2, { frameWidth: 63, frameHeight: 51 });
		this.load.spritesheet("bug3", bug3, { frameWidth: 84, frameHeight: 69 });
		this.load.spritesheet("boss", boss, { frameWidth: 297, frameHeight: 231 });
		this.load.spritesheet("explosion", explosion, { frameWidth: 96, frameHeight: 93 });
		this.load.spritesheet("spaceship", spaceship, { frameWidth: 84, frameHeight: 171 });
		this.load.image("doge", `/static/img/game_sprites/game2/doge.png?v=${version}`);
		this.load.image("bitcoin", `/static/img/game_sprites/game2/bitcoin.png?v=${version}`);
		this.load.image("litecoin", `/static/img/game_sprites/game2/litecoin.png?v=${version}`);
		this.load.image("monero", `/static/img/game_sprites/game2/monero.png?v=${version}`);
		this.load.image("ethereum", `/static/img/game_sprites/game2/ethereum.png?v=${version}`);
		this.load.image("tripleShot", `/static/img/game_sprites/game2/triple_shot.png?v=${version}`);
		this.load.image("waveShot", `/static/img/game_sprites/game2/wave_shot.png?v=${version}`);
		this.load.image("doubleShot", `/static/img/game_sprites/game2/double_shot.png?v=${version}`);
		this.load.image("controlsPC", `/static/img/game_sprites/game2/controls.png?v=${version}`);
		this.load.image("start", `/static/img/game_sprites/start${prefixForLang}.png?v=${version}`);
		this.load.image("controlsMobile", `/static/img/game_sprites/game2/controls_mobile.png?v=${version}`);
		this.load.image("score", `/static/img/game_sprites/score_with_icon.png?v=${version}`);
		this.load.image("lives", `/static/img/game_sprites/lives_single.png?v=${version}`);
		this.load.image("time", `/static/img/game_sprites/time_with_icon.png?v=${version}`);
		this.load.image("bossLivesSprite", `/static/img/game_sprites/game2/boss_lives.png?v=${version}`);
		this.load.image("bossEmptySector", `/static/img/game_sprites/game2/boss_empty_sector.png?v=${version}`);
		this.load.image("emptySector", `/static/img/game_sprites/empty_sector.png?v=${version}`);
		this.load.image("header", `/static/img/game_sprites/header.png?v=${version}`);
		this.load.spritesheet("preloadGame", "/static/img/game_sprites/321go.png?v=1.1", { frameWidth: 373, frameHeight: 141 });
		this.load.spritesheet("startBackground", startBackground, { frameWidth: 960, frameHeight: 828 });
		this.load.image("startFullscreen", `/static/img/game_sprites/fullscreen${prefixForLang}.png`);
		this.load.image("restartSprite", `/static/img/game_sprites/restart${prefixForLang}.png`);
		this.load.image("gainSprite", `/static/img/game_sprites/gain_power${prefixForLang}.png`);
		this.load.image("quitButton", `/static/img/game_sprites/quit.png`);
		this.load.image("gameOver", `/static/img/game_sprites/game_over${prefixForLang}.png`);
		this.load.image("youWin", `/static/img/game_sprites/you_win${prefixForLang}.png`);
		this.cameras.main.setBackgroundColor("#18202f");
	}

	create() {
		this.scene.start("Start");
	}
}
