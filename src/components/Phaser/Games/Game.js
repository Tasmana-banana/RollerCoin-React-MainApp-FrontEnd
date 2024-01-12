import Phaser3 from "phaser";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import removePhaserEventListeners from "../../../services/removePhaserEventListeners";
import resizeCanvas from "../../../services/resizeCanvas";
import Boot from "./DefaultScenes/Boot";
import GameEnd from "./DefaultScenes/GameEnd";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	language: state.game.language,
});

class Game extends Component {
	static propTypes = {
		options: PropTypes.object.isRequired,
		rewards: PropTypes.object.isRequired,
		language: PropTypes.string.isRequired,
		pixelArt: PropTypes.bool,
		scenes: PropTypes.array,
		width: PropTypes.number,
		height: PropTypes.number,
		debug: PropTypes.bool,
		fpsForceSetTimeOut: PropTypes.bool,
	};

	static defaultProps = {
		scenes: [],
		width: 960,
		height: 828,
		debug: false,
		pixelArt: false,
		fpsForceSetTimeOut: false,
	};

	constructor(props) {
		super(props);
		this.config = {
			type: Phaser3.CANVAS,
			parent: "phaserGame",
			width: props.width,
			height: props.height,
			physics: {
				default: "arcade",
				arcade: {
					debug: props.debug,
				},
			},
			scale: {
				mode: Phaser3.Scale.NONE,
			},
			fps: {
				forceSetTimeOut: props.fpsForceSetTimeOut,
			},
			pixelArt: props.pixelArt,
			scene: [Boot, ...props.scenes, GameEnd],
		};
	}

	componentDidMount() {
		this.game = new Phaser3.Game(this.config);
		this.game.customOptions = this.props.options;
		this.game.rewardsList = this.props.rewards;
		this.game.isEnglishLang = this.props.language !== "cn";
		removePhaserEventListeners(this.game);
		this.resizeGame();
		window.addEventListener("resize", this.resizeGame);
	}

	resizeGame = () => {
		resizeCanvas("phaserGame", this.config.width, this.config.height);
		this.game.scale.refresh();
	};

	shouldComponentUpdate() {
		return false;
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.resizeGame);
		if (this.game) {
			this.game.destroy();
			removePhaserEventListeners(this.game);
		}
	}

	render() {
		return <div id="phaserGame" />;
	}
}

export default connect(mapStateToProps, null)(Game);
