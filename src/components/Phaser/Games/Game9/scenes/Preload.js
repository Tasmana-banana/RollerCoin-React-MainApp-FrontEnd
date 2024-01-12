import { Scene } from "phaser";
import bitcoin from "../../../../../assets/img/game_sprites/game9/bitcoin.png";
import dash from "../../../../../assets/img/game_sprites/game9/dash.png";
import tether from "../../../../../assets/img/game_sprites/game9/tether.png";
import hamster from "../../../../../assets/img/game_sprites/game9/hamster.png";
import virusBitcoin from "../../../../../assets/img/game_sprites/game9/virus_bitcoin.png";
import virusDash from "../../../../../assets/img/game_sprites/game9/virus_dash.png";
import virusTether from "../../../../../assets/img/game_sprites/game9/virus_tether.png";
import background from "../../../../../assets/img/game_sprites/game9/background_interface.png";
import bitcoinHamsterMiniature from "../../../../../assets/img/game_sprites/game9/bitcoin_hamster_miniature.png";
import dashHamsterMiniature from "../../../../../assets/img/game_sprites/game9/dash_hamster_miniature.png";
import tetherHamsterMiniature from "../../../../../assets/img/game_sprites/game9/tether_hamster_miniature.png";
import preloadGame from "../../../../../assets/img/game_sprites/321go.png";
import startBackground from "../../../../../assets/img/game_sprites/game9/start_background.png";
import controlsMobile from "../../../../../assets/img/game_sprites/game9/controlsMobile.png";
import controlsPC from "../../../../../assets/img/game_sprites/game9/controlsPC.png";
import button from "../../../../../assets/img/game_sprites/game9/button.png";

export default class Preload extends Scene {
	constructor() {
		super({ key: "Preload" });
	}

	preload() {
		const prefixForLang = this.game.isEnglishLang ? "" : "_cn";
		this.load.spritesheet("bitcoin", bitcoin, { frameWidth: 72, frameHeight: 72 });
		this.load.spritesheet("dash", dash, { frameWidth: 72, frameHeight: 72 });
		this.load.spritesheet("tether", tether, { frameWidth: 72, frameHeight: 72 });
		this.load.spritesheet("hamster", hamster, { frameWidth: 51, frameHeight: 57 });
		this.load.spritesheet("virusBitcoin", virusBitcoin, { frameWidth: 72, frameHeight: 72 });
		this.load.spritesheet("virusDash", virusDash, { frameWidth: 72, frameHeight: 72 });
		this.load.spritesheet("virusTether", virusTether, { frameWidth: 72, frameHeight: 72 });
		this.load.spritesheet("preloadGame", "/static/img/game_sprites/321go.png?v=1.1", { frameWidth: 373, frameHeight: 141 });
		this.load.image("start", `/static/img/game_sprites/game6/start${prefixForLang}.png`);
		this.load.image("startFullscreen", `/static/img/game_sprites/game6/fullscreen${prefixForLang}.png`);
		this.load.image("background", background);
		this.load.image("bitcoinHamsterMiniature", bitcoinHamsterMiniature);
		this.load.image("dashHamsterMiniature", dashHamsterMiniature);
		this.load.image("tetherHamsterMiniature", tetherHamsterMiniature);
		this.load.image("startBackground", startBackground);
		this.load.image("controlsMobile", controlsMobile);
		this.load.image("controlsPC", controlsPC);
		this.load.image("button", button);
		this.load.image("restartSprite", `/static/img/game_sprites/restart${prefixForLang}.png`);
		this.load.image("gainSprite", `/static/img/game_sprites/gain_power${prefixForLang}.png`);
		this.load.image("gameOver", `/static/img/game_sprites/game_over${prefixForLang}.png`);
		this.load.image("quitButton", `/static/img/game_sprites/quit.png`);
		this.load.image("youWin", `/static/img/game_sprites/you_win${prefixForLang}.png`);
	}

	create() {
		this.scene.start("Start");
	}
}
