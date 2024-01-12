import React, { Component } from "react";
import PropTypes from "prop-types";
import connect from "react-redux/es/connect/connect";
import * as actions from "../../../actions/game";
import getPrefixPower from "../../../services/getPrefixPower";
import Game from "./Game";
import scenes1 from "./Game1";
import scenes2 from "./Game2";
import scenes3 from "./Game3";
import scenes4 from "./Game4";
import scenes5 from "./Game5";
import scenes6 from "./Game6";
import scenes7 from "./Game7";
import scenes8 from "./Game8";
import scenes9 from "./Game9";
import scenes10 from "./Game10";
import scenes11 from "./Game11";
import scenes12 from "./Game12";
import rewardsList from "../../../reducers/defaultData/rewardsList";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	currentGameInfo: state.game.currentGameInfo,
	userPower: state.game.userPower,
	isMobile: state.game.isMobile,
});

// Map Redux actions to component props
const mapDispatchToProps = (dispatch) => ({
	setCurrentGameInfo: (state) => dispatch(actions.setCurrentGameInfo(state)),
	setGameFinishedResult: (state) => dispatch(actions.setGameFinishedResult(state)),
});

class StartGame extends Component {
	callbackGame = (power, status) => {
		const time = Date.now();
		this.props.setGameFinishedResult({
			power,
			time,
			user_game_id: this.props.currentGameInfo.id,
			win_status: status,
		});
		this.props.setCurrentGameInfo({});
	};

	renderSelectedGame = () => {
		const { number, level } = this.props.currentGameInfo;
		const hashInfo = `${getPrefixPower(this.props.userPower).power}${getPrefixPower(this.props.userPower).hashDetail}`;
		const options = { level, hashInfo, callback: this.callbackGame };
		const games = [
			{
				id: 1,
				scenes: scenes1,
				height: 720,
				fpsForceSetTimeOut: true,
			},
			{
				id: 2,
				scenes: scenes2,
			},
			{
				id: 3,
				scenes: scenes3,
			},
			{
				id: 4,
				scenes: scenes4,
				fpsForceSetTimeOut: true,
			},
			{
				id: 5,
				height: 720,
				scenes: scenes5,
			},
			{
				id: 6,
				height: 720,
				scenes: scenes6,
			},
			{
				id: 7,
				scenes: scenes7,
			},
			{
				id: 8,
				scenes: scenes8,
			},
			{
				id: 9,
				scenes: scenes9,
				fpsForceSetTimeOut: true,
			},
			{
				id: 10,
				scenes: scenes10,
			},
			{
				id: 11,
				scenes: scenes11,
				fpsForceSetTimeOut: true,
			},
			{
				id: 12,
				scenes: scenes12,
				fpsForceSetTimeOut: true,
				width: this.props.isMobile ? 600 : 960,
				height: this.props.isMobile ? 1100 : 800,
				pixelArt: true,
			},
		];

		const currentGame = games.find(({ id }) => number === id);

		if (!currentGame) {
			return <p className="text-center">Game not found</p>;
		}

		return <Game {...currentGame} options={options} rewards={rewardsList[currentGame.id]} key={`Game${currentGame.id}`} />;
	};

	render() {
		return <React.Fragment>{this.renderSelectedGame()}</React.Fragment>;
	}
}

StartGame.propTypes = {
	setCurrentGameInfo: PropTypes.func.isRequired,
	currentGameInfo: PropTypes.object.isRequired,
	setGameFinishedResult: PropTypes.func.isRequired,
	userPower: PropTypes.number.isRequired,
	isMobile: PropTypes.bool.isRequired,
};
export default connect(mapStateToProps, mapDispatchToProps)(StartGame);
