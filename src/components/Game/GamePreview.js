import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { Row, Col, Progress } from "reactstrap";
import ReactPixel from "react-facebook-pixel";
import { CircularProgressbar } from "react-circular-progressbar";
import { LazyLoadImage } from "react-lazy-load-image-component";
import googleAnalyticsPush from "../../services/googleAnalyticsPush";
import * as actions from "../../actions/game";
import LevelBar from "./LevelBar";
import ComingSoon from "./ComingSoon";
import "react-circular-progressbar/dist/styles.css";

import flagImage from "../../assets/img/icon/flag.svg";
import clockImage from "../../assets/img/game/clock.svg";

const options = {
	autoConfig: true, // set pixel's autoConfig
	debug: false, // enable logs
};
ReactPixel.init(process.env.FACEBOOK_PIXEL_ID, {}, options);

// Map Redux state to component props
const mapStateToProps = (state) => ({
	games: state.game.games,
	language: state.game.language,
	selectedGame: state.game.selectedGame,
});

// Map Redux actions to component props
const mapDispatchToProps = (dispatch) => ({
	selectGame: (state) => dispatch(actions.selectGame(state)),
	setGamesInfo: (state) => dispatch(actions.setGamesInfo(state)),
});

class GamePreviewClass extends Component {
	static propTypes = {
		startGame: PropTypes.func.isRequired,
		games: PropTypes.array.isRequired,
		selectedGame: PropTypes.object.isRequired,
		selectGame: PropTypes.func.isRequired,
		setGamesInfo: PropTypes.func.isRequired,
		t: PropTypes.func.isRequired,
		language: PropTypes.string.isRequired,
		isLoading: PropTypes.bool.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = { activeGameInfo: "", activatedItems: [] };
		this.timers = this.props.games.map(() => 0);
		if (!Object.keys(this.props.selectedGame).length) {
			this.props.selectGame(this.props.games[0]);
		}
	}

	componentDidMount() {
		document.addEventListener("click", this.handleClickOutside);
	}

	componentWillUnmount() {
		this.timers.map((item) => clearInterval(item));
		document.removeEventListener("click", this.handleClickOutside);
	}

	handleClickOutside = (event) => {
		const element = event.target.closest(".choose-game-item-container");
		if (!element) {
			this.setState({ activeGameInfo: "" });
		}
	};

	intervalFunc = (index) => {
		const infoToSet = this.props.games.slice();
		infoToSet[index].coolDown = +(infoToSet[index].coolDown - 0.1).toFixed(2);
		this.props.setGamesInfo(infoToSet);
	};

	timerFunc = (index) => {
		if (this.props.games[index].coolDown > 0) {
			this.timers[index] = setInterval(this.intervalFunc.bind(this, index), 100);
		}
	};

	renderTimer = (index) => {
		const { games } = this.props;
		if (games[index].coolDown > 0) {
			const percent = (games[index].coolDown / games[index].coolDownMaxForGame) * 100;
			if (!this.timers[index]) {
				this.timerFunc(index);
			}
			return (
				<div className="timer">
					<CircularProgressbar
						value={percent}
						strokeWidth={50}
						text={null}
						styles={{
							path: {
								stroke: "rgba(0, 0, 0, 0.5)",
								strokeLinecap: "butt",
							},
							trail: {
								stroke: "transparent",
							},
						}}
						counterClockwise
					/>
				</div>
			);
		}
		if (this.timers[index]) {
			this.timers[index] = clearInterval(this.timers[index]);
		}
		return "";
	};

	static createDifficultBar = (currentLevel) => {
		const MAX_LEVEL = 10;
		const progress = [];
		for (let i = 0; i < MAX_LEVEL; i += 1) {
			progress.push(<Progress value={i < currentLevel ? 100 : 0} className="progress-block" key={i.toString()} />);
		}
		return progress;
	};

	startGame = (event, item) => {
		googleAnalyticsPush("start_game_v2", { step: "6th_step", game: item.name });
		const { selectGame, startGame } = this.props;
		ReactPixel.trackCustom("StartGame", {
			content_name: +item.id,
		});
		event.stopPropagation();
		selectGame(item);
		startGame(+item.id);
	};

	setActiveGameInfo = (event, gameId) => {
		const element = event.target.closest(".tree-dimensional-button");
		if (element) {
			return false;
		}
		const newData = { activeGameInfo: gameId === this.state.activeGameInfo ? "" : gameId };
		if (+gameId >= 1 && !this.state.activatedItems.includes(gameId)) {
			newData.activatedItems = [...this.state.activatedItems, gameId];
		}
		this.setState(newData);
	};

	render() {
		const { activeGameInfo, activatedItems } = this.state;
		const { games, language, t, isLoading } = this.props;
		return (
			<Row>
				{this.props.games.map((item, index) => (
					<Col
						xs={12}
						md={6}
						lg={4}
						key={item.id}
						className={`choose-game-item-container ${item.id === activeGameInfo ? "active" : ""} ${activatedItems.includes(item.id) ? "activated-animation" : ""}`}
						onClick={(event) => this.setActiveGameInfo(event, item.id)}
					>
						<Row noGutters={true} className="choose-game-item">
							<Col xs={5} className="img-container">
								<div className="img-item">
									<LazyLoadImage src={`/static/img/gamePreview/${item.imgSmall}?v=1.0.2`} width={107} height={107} alt={item.imgSmall} threshold={100} />
									{this.renderTimer(index)}
									{!!item.tag && (
										<div className={`game-tag ${item.tag}`}>
											<p className="game-tag-text">{item.tag.toUpperCase()}</p>
										</div>
									)}
								</div>
							</Col>
							<Col xs={7}>
								<p className="game-title">{item.name}</p>
								<div className="game-information-block">
									<div className="game-information-text-wrapper">
										<p className="game-information-text">{t("difficulty")}</p>
										<p className="game-information-number">{item.level.level}</p>
									</div>
									<div className="progress-difficult progress-info">{this.constructor.createDifficultBar(item.level.level)}</div>
								</div>
								<div className="animated-element-wrapper">
									<div className="game-information-block">
										<div className="game-information-text-wrapper">
											<p className="game-information-text">{t("level")}</p>
											<p className="game-information-number">{item.level.progress}</p>
										</div>
										<div className="progress-level progress-info">
											<LevelBar level={item.level} />
										</div>
									</div>
									<div className="game-start-button">
										<button
											className={`tree-dimensional-button btn-cyan w-100 ${isLoading ? "active-game" : ""}`}
											disabled={item.coolDown > 0}
											onClick={(event) => this.startGame(event, item)}
										>
											<span className="with-horizontal-image flex-lg-row button-text-wrapper">
												{item.coolDown <= 0 && (
													<Fragment>
														<img src={flagImage} alt="play_game" />
														<span className="btn-text">{t("start")}</span>
													</Fragment>
												)}
												{item.coolDown > 0 && (
													<Fragment>
														<img src={clockImage} alt="clock" />
														<span className="btn-text">{t("wait")}</span>
													</Fragment>
												)}
											</span>
										</button>
									</div>
								</div>
							</Col>
						</Row>
						<Row noGutters={true} className="game-info-hidden">
							<Col xs={5}>
								<p className="game-description">{item.description[language] || item.description.en}</p>
							</Col>
							<Col xs={7} className="game-info-hidden-padding">
								<div className="game-information-block">
									<div className="game-information-text-wrapper">
										<p className="game-information-text">{t("time")}</p>
										<p>{item.time} sec</p>
									</div>
								</div>
								<div className="game-information-block game-reward">
									<div className="game-information-text-wrapper">
										<p className="game-information-text">{t("reward")}</p>
										<p>{item.reward} pts</p>
									</div>
								</div>
								<div className="game-start-button">
									<button
										className={`tree-dimensional-button btn-cyan w-100 ${isLoading ? "active-game" : ""}`}
										disabled={item.coolDown > 0}
										onClick={(event) => this.startGame(event, item)}
									>
										<span className="with-horizontal-image flex-lg-row button-text-wrapper">
											{item.coolDown <= 0 && (
												<Fragment>
													<img src={flagImage} alt="play_game" />
													<span className="btn-text">{t("start")}</span>
												</Fragment>
											)}
											{item.coolDown > 0 && (
												<Fragment>
													<img src={clockImage} alt="clock" />
													<span className="btn-text">{t("wait")}</span>
												</Fragment>
											)}
										</span>
									</button>
								</div>
							</Col>
						</Row>
					</Col>
				))}
				<ComingSoon games={games} createDifficultBar={this.constructor.createDifficultBar} />
			</Row>
		);
	}
}

const GamePreview = withTranslation("Games")(connect(mapStateToProps, mapDispatchToProps)(GamePreviewClass));
export default GamePreview;
