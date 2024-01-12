import { Scene } from "phaser";
import preloadGame from "../../../../../assets/img/game_sprites/interface/321go.png";
import start from "../../../../../assets/img/game_sprites/interface/start.png";
import fullscreen from "../../../../../assets/img/game_sprites/interface/fullscreen.png";
import restartSprite from "../../../../../assets/img/game_sprites/interface/restart.png";
import gainSprite from "../../../../../assets/img/game_sprites/interface/gain_power.png";
import quitButton from "../../../../../assets/img/game_sprites/interface/quit.png";
import youWin from "../../../../../assets/img/game_sprites/interface/you_win.png";
import gameOver from "../../../../../assets/img/game_sprites/interface/game_over.png";
import score from "../../../../../assets/img/game_sprites/interface/score.png";
import time from "../../../../../assets/img/game_sprites/interface/time.png";
import lives from "../../../../../assets/img/game_sprites/interface/lives.png";
import hamstersIMG from "../../../../../assets/img/game_sprites/game12/hamsters.png";
import hamstersJSON from "../atlas/hamsters.json";
import target from "../../../../../assets/img/game_sprites/game12/target.png";
import splashScreen from "../../../../../assets/img/game_sprites/game12/splash_screen.png";
import drop from "../../../../../assets/img/game_sprites/game12/drop.png";
import anger from "../../../../../assets/img/game_sprites/game12/anger.png";
import background from "../../../../../assets/img/game_sprites/game12/background.png";
import controlsMobile from "../../../../../assets/img/game_sprites/game12/controls_mobile.png";
import controlsPC from "../../../../../assets/img/game_sprites/game12/controls_desktop.png";

export default class Preload extends Scene {
	constructor() {
		super({ key: "Preload" });
	}

	preload() {
		this.load.spritesheet("preloadGame", preloadGame, { frameWidth: 373, frameHeight: 141 });
		this.load.image("start", start);
		this.load.image("startFullscreen", fullscreen);
		this.load.image("restartSprite", restartSprite);
		this.load.image("gainSprite", gainSprite);
		this.load.image("quitButton", quitButton);
		this.load.image("youWin", youWin);
		this.load.image("gameOver", gameOver);
		this.load.image("controlsMobile", controlsMobile);
		this.load.image("controlsPC", controlsPC);

		// interface
		this.load.image("splashScreen", splashScreen);
		this.load.spritesheet("lives", lives, { frameWidth: 34, frameHeight: 11 });
		this.load.image("score", score);
		this.load.image("time", time);

		// game sprites
		this.load.atlas("hamsters", hamstersIMG, hamstersJSON);
		this.load.spritesheet("target", target, { frameWidth: 49, frameHeight: 49 });
		this.load.image("background", background);
		this.load.image("drop", drop);
		this.load.image("anger", anger);
	}

	create() {
		this.scene.start("Start");
	}
}
