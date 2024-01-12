import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { Route, Switch } from "react-router-dom";
import { toast } from "react-toastify";
import * as Sentry from "@sentry/react";
import * as actions from "../../actions/game";
import PhaserScreen from "./PhaserScreen";
import Choose from "./Choose";
import Play from "./Play";
import AdBlockDetect from "../../components/AdBlockDetect/AdBlockDetect";
import decimalAdjust from "../../services/decimalAdjust";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import fetchWithToken from "../../services/fetchWithToken";

import "../../assets/scss/Game/main.scss";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	balance: state.game.balance.btc,
	games: state.game.games,
	minersBroken: state.game.minersBroken,
	pathName: state.router.location.pathname,
	captcha: state.game.captcha,
	userId: state.user.uid,
	language: state.game.language,
	currencies: state.wallet.rollerCurrencies,
});
// Map Redux actions to component props
const mapDispatchToProps = (dispatch) => ({
	setCurrentGameInfo: (state) => dispatch(actions.setCurrentGameInfo(state)),
	setGamesInfo: (state) => dispatch(actions.setGamesInfo(state)),
	setTimeDeltaFinishedGame: (state) => dispatch(actions.setTimeDeltaFinishedGame(state)),
	setStatsGamesPlayed: (state) => dispatch(actions.setStatsGamesPlayed(state)),
	setBlockProgress: (state) => dispatch(actions.setBlockProgress(state)),
	setFinishedGameWS: (state) => dispatch(actions.setFinishedGameWS(state)),
	setFinishedGameError: (state) => dispatch(actions.setFinishedGameError(state)),
	setTrophy: (state) => dispatch(actions.setTrophy(state)),
	setMinersBroken: (state) => dispatch(actions.setMinersBroken(state)),
	setPlayForFixMiners: (state) => dispatch(actions.setPlayForFixMiners(state)),
	setMinersJustFixed: (state) => dispatch(actions.setMinersJustFixed(state)),
	setCaptcha: (state) => dispatch(actions.setCaptcha(state)),
	setTotalRewardBlock: (state) => dispatch(actions.setTotalRewardBlock(state)),
	setJustBoughtItem: (state) => dispatch(actions.setJustBoughtItem(state)),
});

class GameClass extends Component {
	static propTypes = {
		minersBroken: PropTypes.bool.isRequired,
		balance: PropTypes.number.isRequired,
		games: PropTypes.array.isRequired,
		wsReact: PropTypes.object.isRequired,
		history: PropTypes.object.isRequired,
		setGamesInfo: PropTypes.func.isRequired,
		setCurrentGameInfo: PropTypes.func.isRequired,
		setTimeDeltaFinishedGame: PropTypes.func.isRequired,
		setStatsGamesPlayed: PropTypes.func.isRequired,
		setBlockProgress: PropTypes.func.isRequired,
		setJustBoughtItem: PropTypes.func.isRequired,
		setFinishedGameWS: PropTypes.func.isRequired,
		setFinishedGameError: PropTypes.func.isRequired,
		setTrophy: PropTypes.func.isRequired,
		setMinersBroken: PropTypes.func.isRequired,
		setPlayForFixMiners: PropTypes.func.isRequired,
		setMinersJustFixed: PropTypes.func.isRequired,
		setTotalRewardBlock: PropTypes.func.isRequired,
		pathName: PropTypes.string.isRequired,
		setCaptcha: PropTypes.func.isRequired,
		captcha: PropTypes.object.isRequired,
		userId: PropTypes.string.isRequired,
		language: PropTypes.string.isRequired,
		t: PropTypes.func.isRequired,
		currencies: PropTypes.array.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			currentSelectedGame: null,
		};
		this.controllers = {};
		this.signals = {};
	}

	createSignalAndController = (id) => {
		if (this.controllers[id]) {
			this.controllers[id].abort();
		}
		this.controllers[id] = new AbortController();
		this.signals[id] = this.controllers[id].signal;
	};

	componentDidMount() {
		this.props.wsReact.setListenersMessage({ game: this.onWSMessage });
		this.props.wsReact.setListenersOpen({ game: this.socketOpen });
		this.getUserTrophy();
	}

	socketOpen = () => {
		const cmd = ["block_mining_progress_request", "get_global_settings"];
		cmd.forEach((item) => {
			this.props.wsReact.send(
				JSON.stringify({
					cmd: item,
				})
			);
		});
	};

	componentWillUnmount() {
		this.props.wsReact.removeListenersMessage("game");
		this.props.wsReact.removeListenersOpen("game");
		Object.keys(this.controllers).forEach((key) => {
			if (this.controllers[key]) {
				this.controllers[key].abort();
			}
		});
	}

	onWSMessage = (event) => {
		let data = null;
		try {
			data = JSON.parse(event.data);
		} catch (e) {
			return null;
		}
		const command = data.cmd;
		const value = data.cmdval;
		switch (command) {
			case "game_start_response":
				this.handleStartEvent(value);
				break;
			case "game_state_response":
				this.handleGameState(value);
				break;
			case "stat_games_played":
				this.handleStatsGamesPlayed(value);
				break;
			case "block_mining_progress_response":
				this.handleProgress(value);
				break;
			case "game_finished_accepted":
				this.handleAcceptedGame(value);
				break;
			case "verification_required":
				this.handleCaptcha(value);
				break;
			case "verify_captcha_response":
				this.handleVerifyCaptcha(value);
				break;
			case "trophies":
				this.handleTrophies(value);
				break;
			case "game_finished_error":
				this.handleErrorGame(value);
				break;
			case "verify_token_error":
				this.handleVerifyTokenError(value);
				break;
			case "miner_purchased":
				this.handleSeccesfullyPurchase(value);
				break;
			case "rack_purchased":
				this.handleSeccesfullyPurchase(value);
				break;
			case "games_data_response":
				this.handleGamesData(value);
				break;
			case "global_settings":
				this.handleGlobalSettings(value);
				break;
			case "notice_error":
				this.handleNoticeError(value);
				break;
			case "notice_info":
				this.handleNoticeSuccess(value);
				break;
			default:
				break;
		}
	};

	// WS EVENTS
	handleGlobalSettings = (data) => {
		data = data.map((item) => {
			const currentPoolPowerConfig = this.props.currencies.find((config) => config.balanceKey === item.currency);
			return {
				currency: item.currency,
				blockSize: decimalAdjust(item.block_size / currentPoolPowerConfig.divider / (item.currency !== "SAT" ? currentPoolPowerConfig.toSmall : 1), currentPoolPowerConfig.precisionToBalance),
				poolPower: item.pool_power_for_currency,
			};
		});
		this.props.setTotalRewardBlock(data);
	};

	handleProgress = (data) => {
		this.props.setBlockProgress({
			currency: data.currency,
			progress: data.progress,
			timeLeft: data.time_left,
		});
	};

	handleTrophies = (data) => {
		if (data.win_trophies && data.win_trophies.length) {
			const trophy = data.win_trophies.sort((a, b) => +a - +b).pop() || "";
			this.props.setTrophy(trophy.toString());
		}
	};

	handleStatsGamesPlayed = (data) => {
		this.props.setStatsGamesPlayed(data);
	};

	handleAcceptedGame = (data) => {
		this.props.setFinishedGameWS(data);
		this.props.setCaptcha({ isVerificationRequired: false, userGameId: "", isCaptchaValid: true });
	};

	handleErrorGame = (data) => {
		this.props.setFinishedGameError(data);
		Sentry.captureException(new Error(JSON.stringify(data)));
	};

	handleCaptcha = (data) => {
		this.props.setCaptcha({ isVerificationRequired: true, userGameId: data.user_game_id, isCaptchaValid: true });
	};

	handleVerifyCaptcha = (data) => {
		const { language, t } = this.props;
		if (data.expired) {
			this.handleNoticeError(t("messages.captcha"));
			this.props.setCaptcha({ isVerificationRequired: false, userGameId: "", isCaptchaValid: true });
			return this.props.history.push(`${getLanguagePrefix(language)}/game/choose_game`);
		}
		this.props.setCaptcha({ ...this.props.captcha, ...{ isCaptchaValid: data.valid } });
	};

	handleVerifyTokenError = () => {
		const { language, t } = this.props;
		this.handleNoticeError(t("messages.verifyTokenError"));
		this.props.setCaptcha({ captchaBase64: false, userGameId: "", isCaptchaValid: true });
		this.props.history.push(`${getLanguagePrefix(language)}/game/choose_game`);
	};

	handleNoticeError = (data) => {
		toast(this.constructor.renderBlockMined(data, "error_notice"), {
			position: "top-left",
			autoClose: 3000,
			hideProgressBar: true,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
		});
	};

	handleSeccesfullyPurchase = (data) => {
		if (!data.success) {
			return null;
		}
		const { t } = this.props;
		toast(this.constructor.renderBlockMined(t("messages.successful"), "cart_successfully_notice"), {
			position: "top-left",
			autoClose: 3000,
			hideProgressBar: true,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
		});
		this.props.setJustBoughtItem(data.item_id);
	};

	handleNoticeSuccess = (data) => {
		toast(this.constructor.renderBlockMined(data, "success_notice"), {
			position: "top-left",
			autoClose: 3000,
			hideProgressBar: true,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
		});
	};

	static renderBlockMined(text, icon) {
		return (
			<div className="content-with-image">
				<img src={`/static/img/icon/${icon}.svg`} alt="block_mined" />
				<span>{text}</span>
			</div>
		);
	}

	handleStartEvent = (data) => {
		const { language } = this.props;
		if (+data.cool_down === 0) {
			this.props.setCurrentGameInfo({
				id: data.user_game_id,
				number: data.game_number,
				level: data.level.level,
			});
			this.setState({
				currentSelectedGame: data.game_number,
			});
			this.props.history.push(`${getLanguagePrefix(language)}/game/play_game`);
		}
	};

	handleGameState = async (data) => {
		if (this.props.minersBroken) {
			try {
				this.createSignalAndController("handleGameState");
				const json = await fetchWithToken("/api/game/check-count-played-games", { method: "GET", signal: this.signals.handleGameState });
				if (!json.success) {
					return false;
				}
				this.props.setPlayForFixMiners(json.data.needToFix);
				this.props.setMinersJustFixed(json.data.fixedOnThisCheck);
				if (json.data.fixedOnThisCheck) {
					this.props.setMinersBroken(false);
				}
			} catch (e) {
				console.error(e);
			}
		}
		if (this.state.currentSelectedGame !== null && this.state.currentSelectedGame === data.game_number) {
			this.props.setTimeDeltaFinishedGame(data.time_delta);
		}
	};

	handleGamesData = (data) => {
		this.props.setGamesInfo(
			this.props.games.map((obj) => {
				const foundGame = data.find((game) => +game.game_number === +obj.id);
				if (!foundGame) {
					return obj;
				}
				obj.reward = obj.setReward(foundGame.level.level);
				obj.level = foundGame.level;
				obj.coolDown = foundGame.cool_down > 0 ? foundGame.cool_down : 0;
				obj.coolDownMaxForGame = foundGame.cool_down_max > 0 ? foundGame.cool_down_max : 0;
				return obj;
			})
		);
	};

	getUserTrophy = async () => {
		try {
			this.createSignalAndController("getUserTrophy");
			const json = await fetchWithToken("/api/profile/user-trophy", {
				method: "GET",
				signal: this.signals.getUserTrophy,
			});
			if (!json.success) {
				return false;
			}
			this.props.setTrophy(json.data);
		} catch (e) {
			console.error(e);
		}
	};

	render() {
		const { language } = this.props;
		return (
			<div className="react-body">
				<AdBlockDetect pathName={this.props.pathName} />
				<div className="react-wrapper">
					<Switch>
						<Route exact path={`${getLanguagePrefix(language)}/game`} render={() => <PhaserScreen wsReact={this.props.wsReact} />} />
						<Route exact path={`${getLanguagePrefix(language)}/game/choose_game`} render={() => <Choose wsReact={this.props.wsReact} />} />
						<Route exact path={`${getLanguagePrefix(language)}/game/play_game`} render={() => <Play history={this.props.history} wsReact={this.props.wsReact} />} />
					</Switch>
				</div>
			</div>
		);
	}
}
const Game = withTranslation("Game")(connect(mapStateToProps, mapDispatchToProps)(GameClass));
export default Game;
