import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "reactstrap";
import { GoogleReCaptcha } from "react-google-recaptcha-v3";
import Spritesheet from "react-responsive-spritesheet";
import connect from "react-redux/es/connect/connect";
import LazyLoad from "react-lazyload";
import StartGame from "../../components/Phaser/Games/StartGame";
import * as actions from "../../actions/game";
import getPrefixPower from "../../services/getPrefixPower";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import encryptData from "../../services/encryptData";
import { RecaptchaModalWS, ModalGotTrophy } from "../../components/Game";
import ModalGotDrops from "../../components/Game/ModalGotDrops";
import Tips from "../../components/Game/Tips";
import BannersLoader from "../../components/Banners/BannersLoader";
import fetchWithToken from "../../services/fetchWithToken";
import progressionEventRewardToast from "../../services/progressionEventRewardToast";
import progressionEventTaskToast from "../../services/progressionEventTaskToast";

import "../../assets/scss/Game/Choose.scss";
import "../../assets/scss/Game/Play.scss";
import "../../assets/scss/ProgressionEvent/ProgressionEventTaskToast.scss";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	currentPhaserGame: state.game.currentPhaserGame,
	startGameFunction: state.game.startGameFunction,
	gameFinishedResult: state.game.gameFinishedResult,
	currentGameInfo: state.game.currentGameInfo,
	timeDeltaFinishedGame: state.game.timeDeltaFinishedGame,
	userPower: state.game.userPower,
	statsGamesPlayed: state.game.statsGamesPlayed,
	finishedGameWS: state.game.finishedGameWS,
	finishedGameError: state.game.finishedGameError,
	trophy: state.game.trophy,
	captcha: state.game.captcha,
	games: state.game.games,
	language: state.game.language,
	uid: state.user.uid,
	wsNode: state.webSocket.wsNode,
});

// Map Redux actions to component props
const mapDispatchToProps = (dispatch) => ({
	setCurrentPhaserGame: (state) => dispatch(actions.setCurrentPhaserGame(state)),
	setCurrentGameInfo: (state) => dispatch(actions.setCurrentGameInfo(state)),
	setGameFinishedResult: (state) => dispatch(actions.setGameFinishedResult(state)),
	setFinishedGameWS: (state) => dispatch(actions.setFinishedGameWS(state)),
	setFinishedGameError: (state) => dispatch(actions.setFinishedGameError(state)),
});

class PlayClass extends Component {
	static propTypes = {
		gameFinishedResult: PropTypes.object.isRequired,
		currentPhaserGame: PropTypes.object.isRequired,
		currentGameInfo: PropTypes.object.isRequired,
		statsGamesPlayed: PropTypes.object.isRequired,
		wsReact: PropTypes.object.isRequired,
		wsNode: PropTypes.object.isRequired,
		history: PropTypes.object.isRequired,
		timeDeltaFinishedGame: PropTypes.object.isRequired,
		finishedGameWS: PropTypes.object.isRequired,
		trophy: PropTypes.string.isRequired,
		uid: PropTypes.string.isRequired,
		setCurrentGameInfo: PropTypes.func.isRequired,
		userPower: PropTypes.number.isRequired,
		finishedGameError: PropTypes.string.isRequired,
		setCurrentPhaserGame: PropTypes.func.isRequired,
		setGameFinishedResult: PropTypes.func.isRequired,
		setFinishedGameWS: PropTypes.func.isRequired,
		setFinishedGameError: PropTypes.func.isRequired,
		captcha: PropTypes.object.isRequired,
		games: PropTypes.array.isRequired,
		language: PropTypes.string.isRequired,
		t: PropTypes.func.isRequired,
	};

	constructor(props) {
		super(props);
		this.isMobile = window.screen.width < 992;
		this.state = {
			mounted: false,
			countGamesPlayed: +localStorage.getItem("count_games_played") || 1,
			showBtnHome: false,
			showLoading: false,
			gainedPower: 0,
			showTrophiesWindow: false,
			showCaptchaWindow: false,
			showDropsModal: false,
			useReactLink: !!((+localStorage.getItem("count_games_played") || 1) % 10),
		};
		this.controller = new AbortController();
		this.signal = this.controller.signal;
		this.gameDetails = this.props.games.find((obj) => obj.id === this.props.currentGameInfo.number);
	}

	componentDidMount() {
		const { language, wsNode } = this.props;
		this.setState({
			mounted: true,
		});
		if (wsNode && !wsNode.listenersMessage.playGame) {
			wsNode.setListenersMessage({ playGame: this.onWSNodeMessage });
		}
		if (!this.gameDetails) {
			window.location.href = `${getLanguagePrefix(language)}/game/choose_game`;
		} else if (!this.gameDetails.isNewPhaserGame) {
			this.startNewGame();
		}
	}

	componentDidUpdate(prevProps) {
		const { finishedGameWS } = this.props;
		const finishGameLength = Object.keys(finishedGameWS).length;
		if (this.props.trophy !== prevProps.trophy && this.props.trophy && !this.state.showTrophiesWindow) {
			this.setState({ showTrophiesWindow: true });
		}
		// if "game_finished_accepted" hide captcha window and show score
		if (finishGameLength && this.state.showCaptchaWindow) {
			this.toggleCaptchaWindow();
			this.setState({
				showBtnHome: true,
			});
		}
	}

	componentWillUnmount() {
		const { wsNode } = this.props;
		if (wsNode) {
			wsNode.removeListenersMessage("playGame");
		}
		if (Object.keys(this.props.currentPhaserGame).length) {
			this.props.currentPhaserGame.destroy();
			this.props.setCurrentPhaserGame({});
		}
		this.props.setGameFinishedResult({});
		if (this.controller) {
			this.controller.abort();
		}
		this.props.setFinishedGameWS({});
		this.props.setFinishedGameError("");
	}

	onWSNodeMessage = (event) => {
		const data = JSON.parse(event.data);
		const { cmd, value } = data;
		switch (cmd) {
			case "pe_user_reward_info":
				if (!value.event_type || value.event_type === "default") {
					progressionEventRewardToast(value);
				}
				break;
			case "pe_user_task_update":
				if (!value.event_type || value.event_type === "default") {
					progressionEventTaskToast(value);
				}
				break;
			default:
				break;
		}
	};

	toggleTrophyWindow = () => {
		this.setState({ showTrophiesWindow: !this.state.showTrophiesWindow });
	};

	toggleCaptchaWindow = () => {
		this.setState({ showCaptchaWindow: !this.state.showCaptchaWindow });
	};

	gameFinishCallback = async (token) => {
		this.showLoader();
		const { uid } = this.props;
		const dataFinishedGame = this.props.gameFinishedResult;
		if (dataFinishedGame) {
			try {
				const time = Date.now();
				localStorage.setItem("count_games_played", this.state.countGamesPlayed.toString());
				dataFinishedGame.time = time;
				dataFinishedGame.token = token;
				this.createSignalAndController();
				const encryptedData = encryptData(dataFinishedGame, uid);
				const encodedResult = await fetchWithToken(`/api/game/encode-data/${uid}`, {
					method: "POST",
					signal: this.signal,
					body: JSON.stringify({ data: encryptedData }),
				});
				if (!encodedResult.success) {
					throw new Error("Data can't be encoded");
				}
				this.props.wsReact.send(
					JSON.stringify({
						cmd: "game_end_request",
						cmdval: encodedResult.data,
					})
				);
			} catch (e) {
				console.error(e);
			}
		}
	};

	gameEndAnimationComplete = (spriteObj) => {
		const { finishedGameWS } = this.props;
		if (Object.keys(finishedGameWS).length) {
			const showDropsModal = finishedGameWS.drop_response && finishedGameWS.drop_response.type !== "none";
			this.setState({
				showBtnHome: true,
				showDropsModal,
			});
			spriteObj.pause();
		}
		if (this.props.captcha.isVerificationRequired) {
			this.toggleCaptchaWindow();
			spriteObj.pause();
		}
		if (this.props.finishedGameError.length) {
			spriteObj.pause();
		}
	};

	createSignalAndController = () => {
		if (this.controller) {
			this.controller.abort();
		}
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	};

	showLoader = () => {
		this.setState({
			showLoading: true,
		});
	};

	callbackGame = (power, gameNumber, winText, status) => {
		const time = Date.now();
		this.setState({
			gainedPower: power,
		});
		this.props.setGameFinishedResult({
			power,
			id: gameNumber,
			time,
			user_game_id: this.props.currentGameInfo.id,
			win_status: status,
		});
		this.props.setCurrentGameInfo({});
	};

	startNewGame = () => {
		if (Object.keys(this.props.currentPhaserGame).length) {
			this.props.currentPhaserGame.destroy();
			this.props.setCurrentPhaserGame({});
		}
	};

	closeDropModal = () => {
		this.setState({ showDropsModal: false });
	};

	render() {
		const { language, t, finishedGameWS } = this.props;
		const { useReactLink, showDropsModal } = this.state;
		const langPrefix = language === "en" ? "" : "_cn";
		return (
			<Container className="game-play-container">
				{showDropsModal && <ModalGotDrops isOpen={showDropsModal} closeModal={this.closeDropModal} data={finishedGameWS.drop_response} />}
				{this.state.showCaptchaWindow && <RecaptchaModalWS wsReact={this.props.wsReact} />}
				{(!!Object.keys(this.props.currentGameInfo).length || !!Object.keys(this.props.gameFinishedResult).length) && (
					<Row className="choose-game-main-container">
						<Col xs="12" lg="2" className="static-data-content game-banners banner-left">
							{this.state.mounted && <BannersLoader name="gamePlayLeft" isMobile={this.isMobile} />}
						</Col>
						{!!Object.keys(this.props.currentGameInfo).length && (
							<Col xs="12" lg="8" className="play-game-body">
								{!this.gameDetails.isNewPhaserGame && <div id="game1" />}
								{this.gameDetails.isNewPhaserGame && <StartGame />}
							</Col>
						)}
						{Object.keys(this.props.currentGameInfo).length === 0 && !!Object.keys(this.props.gameFinishedResult).length && (
							<Col xs="12" lg="8" className="play-game-result">
								<GoogleReCaptcha action="finish_game" onVerify={this.gameFinishCallback} />
								<Row noGutters={true} className="justify-content-center align-items-end container-result-info">
									<Col xs="12" className="game-result-info">
										<div className="result-sprite-container" hidden={!this.state.showBtnHome}>
											<LazyLoad offset={100}>
												<img src={`/static/img/game/power_gained${langPrefix}.svg`} alt="power_gained" />
											</LazyLoad>
										</div>
										<div className="loading" hidden={!this.state.showLoading}>
											{this.state.showLoading && (
												<Spritesheet
													className={`sprite-game-window`}
													image={`/static/img/game/loading.png`}
													widthFrame={462}
													heightFrame={141}
													steps={119}
													fps={12}
													isResponsive={false}
													loop={true}
													onLoopComplete={(spriteObj) => this.gameEndAnimationComplete(spriteObj)}
												/>
											)}
											{this.state.showLoading && !this.state.showBtnHome && <Tips />}
											{this.state.showBtnHome && this.state.showTrophiesWindow && (
												<ModalGotTrophy show={this.state.showTrophiesWindow} toggleTrophyWindow={this.toggleTrophyWindow} trophy={this.props.trophy} />
											)}
											{!!Object.keys(this.props.finishedGameWS).length && (
												<div className="power-block-inside" hidden={!this.state.showBtnHome}>
													<p>
														{t("play.power")} <span className="cyan-text bold-text">+{this.props.finishedGameWS.power}</span> Gh/s
														<span className="wrap-line" />
														<span className="d-sm-block d-md-none">
															(For Next{" "}
															<span className="magenta-text bold-text">
																{this.props.timeDeltaFinishedGame.time}
																{this.props.timeDeltaFinishedGame.short_title}
															</span>
															)
														</span>
													</p>
													<p className="d-none d-md-block hashrate-text">
														{t("play.newHashrate")} <span className="cyan-text bold-text">{getPrefixPower(this.props.userPower).power}</span>{" "}
														{getPrefixPower(this.props.userPower).hashDetail}
													</p>
													<p className="stats-games-info">
														<span className="bold-text">24h:</span>
														<img src="/static/img/game/gamepad_last_screen.svg" alt="gamepad_last_screen" />
														<span className="text-count">x {this.props.statsGamesPlayed.played_24h}</span>
														<img src="/static/img/game/cup_last_screen.svg" alt="cup_last_screen" />
														<span className="text-count">x {this.props.statsGamesPlayed.won_24h}</span>
													</p>
													<p className="d-none d-md-block power-remain">
														{!this.props.gameFinishedResult.power && <Fragment>{t("play.powerWhenYouWin")}</Fragment>}
														{!!this.props.gameFinishedResult.power && (
															<Fragment>
																{t("play.powerRemain")}{" "}
																<span className="magenta-text bold-text">
																	{this.props.timeDeltaFinishedGame.time} {t(`play.${this.props.timeDeltaFinishedGame.title}`)}
																</span>
															</Fragment>
														)}
													</p>
												</div>
											)}
											{!!this.props.finishedGameError.length && (
												<div className="power-block-inside" hidden={!this.state.showBtnHome}>
													<p className="danger-text">Error! Cannot validate game results!</p>
												</div>
											)}
										</div>
										<div className="router-btns" hidden={!this.state.showBtnHome}>
											{useReactLink && (
												<Link to={`${getLanguagePrefix(language)}/game`} className="btn btn-default-btn with-img col-12 col-lg-4">
													<img src="/static/img/game/home.svg" alt="home" />
													<span className="btn-text">{t("play.goHome")}</span>
												</Link>
											)}
											{useReactLink && (
												<Link to={`${getLanguagePrefix(language)}/game/choose_game`} className="btn btn-cyan with-img  col-12 col-lg-4">
													<img src="/static/img/game/gamepad.svg" alt="gamepad" />
													<span className="btn-text">{t("play.chooseGame")}</span>
												</Link>
											)}
											{!useReactLink && (
												<a href={`${getLanguagePrefix(language)}/game`} className="btn btn-default-btn with-img col-12 col-lg-4">
													<img src="/static/img/game/home.svg" alt="home" />
													<span className="btn-text">{t("play.goHome")}</span>
												</a>
											)}
											{!useReactLink && (
												<a href={`${getLanguagePrefix(language)}/game/choose_game`} className="btn btn-cyan with-img  col-12 col-lg-4">
													<img src="/static/img/game/gamepad.svg" alt="gamepad" />
													<span className="btn-text">{t("play.chooseGame")}</span>
												</a>
											)}
										</div>
									</Col>
									<div className="w-100" />
									<Col xs="12" lg="6" className="static-data-content win-banners banner-center">
										{this.state.mounted && <BannersLoader name="gameEndCenter" isMobile={this.isMobile} />}
									</Col>
								</Row>
							</Col>
						)}
						<Col xs="12" lg="2" className="static-data-content game-banners banner-right">
							{this.state.mounted && <BannersLoader name="gamePlayRight" isMobile={this.isMobile} />}
							{this.state.mounted && <BannersLoader name="gameMobile" isMobile={this.isMobile} />}
						</Col>
					</Row>
				)}
			</Container>
		);
	}
}
const Play = withTranslation("Games")(connect(mapStateToProps, mapDispatchToProps)(PlayClass));

export default Play;
