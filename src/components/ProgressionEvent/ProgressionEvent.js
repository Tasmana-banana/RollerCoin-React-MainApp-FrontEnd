import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link } from "react-router-dom";
import { initTimer, makeCounterData } from "../../services/countdownТimer";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import { getPEData, getUserStats } from "../../services/ProgressionEventDataProcessing";
import progressionEventRewardToast from "../../services/progressionEventRewardToast";
import progressionEventTaskToast from "../../services/progressionEventTaskToast";
import progressionRewardData from "../../services/progressionRewardData";
import ProgressionEventModal from "./ProgressionEventModal";
import ProgressionEventWidget from "./ProgressionEventWidget";
import * as actionsGame from "../../actions/game";
import * as actionsPE from "../../actions/progressionEvent";

import "../../assets/scss/ProgressionEvent/ProgressionEventRewardToast.scss";
import "../../assets/scss/ProgressionEvent/ProgressionEventTaskToast.scss";

import defaultBanner from "../../assets/img/eventBanners/default/center_2023.png";
import loaderImg from "../../assets/img/loader_sandglass.gif";

// Map Redux actions to component props
const mapDispatchToProps = (dispatch) => ({
	setPeModalOpen: (state) => dispatch(actionsGame.setPeModalOpen(state)),
	setPEUserStats: (state) => dispatch(actionsPE.setPEUserStats(state)),
	setRemovePE: () => dispatch(actionsPE.setRemovePE()),
});

// Map Redux state to component props
const mapStateToProps = (state) => ({
	isMobile: state.game.isMobile,
	language: state.game.language,
	isPeModalOpen: state.game.isPeModalOpen,
	PEData: state.progressionEvent,
	phaserScreenInputManager: state.game.phaserScreenInputManager,
	wsNode: state.webSocket.wsNode,
});

class ProgressionEvent extends Component {
	static propTypes = {
		isMobile: PropTypes.bool.isRequired,
		isPeModalOpen: PropTypes.bool.isRequired,
		PEData: PropTypes.object.isRequired,
		setRemovePE: PropTypes.func.isRequired,
		setPEUserStats: PropTypes.func.isRequired,
		setPeModalOpen: PropTypes.func.isRequired,
		language: PropTypes.string.isRequired,
		wsReact: PropTypes.object.isRequired,
		wsNode: PropTypes.object.isRequired,
		phaserScreenInputManager: PropTypes.object,
		t: PropTypes.func.isRequired,
		indented: PropTypes.bool,
		isBannerLine: PropTypes.bool,
		banner: PropTypes.object,
	};

	constructor(props) {
		super(props);
		this.state = {
			nextReward: null,
			mainReward: null,
			startUserXp: 0,
			currentLevelXp: 0,
			timeLeftSeconds: 0,
			viewTime: {
				days: "",
				hours: "0H",
				minutes: "00M",
			},
			multiplierLeftSeconds: 0,
			multiplierTimeString: "00:00:00",
			isCompleted: false,
			isLoading: true,
		};
		this.defaultMultiplier = 100;
		this.controllers = {};
		this.signals = {};
	}

	onWSNodeMessage = (event) => {
		const {
			PEData: { isPEAvailable },
		} = this.props;
		const data = JSON.parse(event.data);
		const { cmd, value } = data;
		switch (cmd) {
			case "pe_user_task_update":
				if (isPEAvailable && (!value.event_type || value.event_type === "default")) {
					progressionEventTaskToast(value);
					this.handleUpdaleUserProgress(value);
				}
				break;
			case "pe_user_multiplier_update":
				if (!value.event_type || value.event_type === "default") {
					this.handleUpdateUserMultiplier(value);
				}
				break;
			case "pe_user_reward_info":
				if (!value.event_type || value.event_type === "default") {
					progressionEventRewardToast(value);
				}
				break;
			default:
				break;
		}
	};

	handleUpdaleUserProgress = (value) => {
		const {
			PEData: { peUserStats },
			setPEUserStats,
		} = this.props;
		setPEUserStats({ ...peUserStats, user_level: value.user_level, user_xp: value.user_xp });
		this.handleCurrentLevelStatus();
	};

	handleUpdateUserMultiplier = (value) => {
		const {
			PEData: { peUserStats },
			setPEUserStats,
		} = this.props;
		setPEUserStats({ ...peUserStats, user_multiplier: value.multiplier || 100, user_multiplier_date_to: value.date_to || 0 });
		this.setState({
			multiplierLeftSeconds: initTimer(value.date_to),
		});
	};

	createSignalAndController = (id) => {
		if (this.controllers[id]) {
			this.controllers[id].abort();
		}
		this.controllers[id] = new AbortController();
		this.signals[id] = this.controllers[id].signal;
	};

	componentDidMount() {
		const { wsNode } = this.props;
		if (wsNode && !wsNode.listenersMessage.progressionEvent) {
			wsNode.setListenersMessage({ progressionEvent: this.onWSNodeMessage });
		}
		this.initialization();
	}

	initialization = async () => {
		const {
			PEData: { isPEAvailable, isPEUserStatsNeedRefresh },
		} = this.props;
		if (isPEAvailable && isPEUserStatsNeedRefresh) {
			await getUserStats();
		}
		if (!isPEAvailable) {
			await getPEData();
		}
		if (isPEAvailable) {
			this.handleCurrentLevelStatus();
			this.initTimers();
		}
		this.setState({ isLoading: false });
	};

	handleCurrentLevelStatus = () => {
		const {
			PEData: { peConfig, peUserStats },
		} = this.props;
		const mainReward = peConfig.rewards.find((item) => +item.required_level === +peConfig.event.max_level);
		const isCompleted = peUserStats.user_level >= +peConfig.event.max_level;
		if (isCompleted) {
			const lastReward = peConfig.rewards.find((item) => +item.required_level === +peConfig.event.max_level);
			const lastRewardAdditionalData = progressionRewardData(lastReward);
			return this.setState({
				isCompleted: true,
				nextReward: { ...lastReward, ...lastRewardAdditionalData },
				mainReward,
			});
		}
		const prevLevel = peConfig.levelsConfig.find((item) => +item.level === +peUserStats.user_level);
		const currentLevel = peConfig.levelsConfig.find((item) => +item.level === +peUserStats.user_level + 1);
		const nextReward = peConfig.rewards.find((item) => +item.required_level === +peUserStats.user_level + 1);

		const nextRewardAdditionalData = progressionRewardData(nextReward);
		if (!currentLevel || !nextReward) {
			return false;
		}
		this.setState({
			startUserXp: peUserStats.user_xp - (prevLevel ? prevLevel.required_xp : 0),
			currentLevelXp: currentLevel.level_xp,
			nextReward: { ...nextReward, ...nextRewardAdditionalData },
			mainReward,
		});
	};

	initTimers = () => {
		const {
			PEData: { peConfig, peUserStats },
		} = this.props;
		this.setState({
			timeLeftSeconds: initTimer(peConfig.event.end_date),
			multiplierLeftSeconds: initTimer(peUserStats.user_multiplier_date_to),
		});
		if (this.timer) {
			clearInterval(this.timer);
		}
		this.timer = setInterval(() => {
			const time = makeCounterData(this.state.timeLeftSeconds);
			const multiplierTime = makeCounterData(this.state.multiplierLeftSeconds, true);
			this.setState({
				timeLeftSeconds: time.leftSeconds,
				viewTime: {
					days: time.days,
					hours: time.hours,
					minutes: time.minutes,
				},
				multiplierTimeString: multiplierTime.timeString,
				multiplierLeftSeconds: multiplierTime.leftSeconds,
			});
		}, 1000);
	};

	componentDidUpdate(prevProps, prevState) {
		const {
			PEData: { isPEAvailable, peUserStats },
			setPEUserStats,
			setRemovePE,
		} = this.props;
		const { timeLeftSeconds, multiplierLeftSeconds } = this.state;
		if (isPEAvailable && isPEAvailable !== prevProps.PEData.isPEAvailable) {
			this.initialization();
		}
		if (this.timer && prevState.timeLeftSeconds !== timeLeftSeconds && timeLeftSeconds <= 0) {
			clearInterval(this.timer);
			this.setState({
				viewTime: {
					days: "",
					hours: "00h",
					minutes: "00m",
				},
				multiplierTimeString: "00:00:00",
			});
			setRemovePE();
		}
		if (this.timer && prevState.multiplierLeftSeconds !== multiplierLeftSeconds && multiplierLeftSeconds <= 0) {
			setPEUserStats({ ...peUserStats, user_multiplier: this.defaultMultiplier });
			this.setState({
				multiplierTimeString: "00:00:00",
			});
		}
	}

	componentWillUnmount() {
		const { wsNode } = this.props;
		if (wsNode) {
			wsNode.removeListenersMessage("progressionEvent");
		}
		if (this.timer) {
			clearInterval(this.timer);
		}
		Object.keys(this.controllers).forEach((key) => {
			if (this.controllers[key]) {
				this.controllers[key].abort();
			}
		});
	}

	toggleModal = () => {
		const { phaserScreenInputManager, isPeModalOpen, setPeModalOpen } = this.props;
		setPeModalOpen(!isPeModalOpen);
		if (phaserScreenInputManager) {
			phaserScreenInputManager.enabled = isPeModalOpen;
		}
	};

	render() {
		const {
			indented,
			isPeModalOpen,
			language,
			isBannerLine,
			PEData: { isPEAvailable, peConfig, peTasks, peMultiplierTasks, peUserStats },
		} = this.props;
		const { viewTime, multiplierTimeString, startUserXp, currentLevelXp, nextReward, mainReward, isCompleted, isLoading } = this.state;
		const { isMobile, banner } = this.props;
		return (
			<Fragment>
				{isLoading && (
					<div className="season-banner-preloader">
						<img src={loaderImg} height={63} width={63} alt="Loading..." />
					</div>
				)}
				{!isLoading && (
					<Fragment>
						{isPEAvailable && mainReward && (
							<Fragment>
								{!isBannerLine && (
									<ProgressionEventWidget
										toggleModal={this.toggleModal}
										eventID={peConfig.event._id}
										imgVer={peConfig.event.last_updated ? peConfig.event.last_updated.toString() : "1.0.0"}
										startUserXp={startUserXp}
										currentLevelXp={currentLevelXp}
										reward={nextReward}
										userStats={peUserStats}
										isCompleted={isCompleted}
										indented={indented}
										isBannerLine={isBannerLine}
									/>
								)}
								{isBannerLine && (
									<div className="banner-card modal-banner" style={{ cursor: "pointer" }} onClick={isMobile ? this.toggleModal : null}>
										<img
											src={
												isMobile
													? `${process.env.STATIC_URL}/static/img/banners/${banner._id}/${banner.images.mobile}`
													: `${process.env.STATIC_URL}/static/img/banners/${banner._id}/${banner.images.desktop}`
											}
											width={299}
											height={119}
											className="w-100 main-banner-card-img"
											alt="Banner img"
										/>
										<div className="progression-info-block">
											<button type="button" className="info-btn" onClick={isMobile ? null : this.toggleModal}>
												<span className="btn-text">More Details</span>
											</button>
										</div>
									</div>
								)}
								<ProgressionEventModal
									isModalOpen={isPeModalOpen}
									toggleModal={this.toggleModal}
									maxMultiplier={peConfig.event.max_multiplier}
									eventID={peConfig.event._id}
									imgVer={peConfig.event.last_updated ? peConfig.event.last_updated.toString() : "1.0.0"}
									startUserXp={startUserXp}
									currentLevelXp={currentLevelXp}
									reward={nextReward}
									mainReward={mainReward}
									userStats={peUserStats}
									viewTime={viewTime}
									multiplierTimeString={multiplierTimeString}
									tasks={peTasks}
									multiplierTasks={peMultiplierTasks}
									isCompleted={isCompleted}
								/>
							</Fragment>
						)}
					</Fragment>
				)}
			</Fragment>
		);
	}
}

export default withTranslation("ProgressionEvent")(connect(mapStateToProps, mapDispatchToProps)(ProgressionEvent));
