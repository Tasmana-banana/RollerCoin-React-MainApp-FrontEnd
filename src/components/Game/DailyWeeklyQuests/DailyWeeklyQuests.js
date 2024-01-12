import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { toast } from "react-toastify";
import LazyLoad from "react-lazyload";
import DailyWeeklyTasksCard from "./DailyWeeklyQuestsCard";
import DailyWeeklyQuestsModal from "./DailyWeeklyQuestsModal";
import DailyWeeklyOnClickTrigger from "./DailyWeeklyOnClickTrigger";
import RollerTabs from "../../SingleComponents/RollerTabs";
import RollerButton from "../../SingleComponents/RollerButton";
import decimalAdjust from "../../../services/decimalAdjust";
import fetchWithToken from "../../../services/fetchWithToken";
import { initTimer, makeCounterData } from "../../../services/countdownТimer";
import getCurrencyConfig from "../../../services/getCurrencyConfig";
import * as actions from "../../../actions/game";

import clockIcon from "../../../assets/img/icon/clock_icon.svg";
import loaderImg from "../../../assets/img/loader_sandglass.gif";
import schedulerIcon from "../../../assets/img/icon/scheduler.svg";

import "../../../assets/scss/Game/DailyWeeklyQuests.scss";

const mapDispatchToProps = (dispatch) => ({
	setIsOpenDailyWeeklyQuestModal: (state) => dispatch(actions.setIsOpenDailyWeeklyQuestModal(state)),
	setIsOpenCryptoQuestModal: (state) => dispatch(actions.setIsOpenCryptoQuestModalRedux(state)),
});

// Map Redux state to component props
const mapStateToProps = (state) => ({
	isMobile: state.game.isMobile,
	language: state.game.language,
	isOpenDailyWeeklyQuestModal: state.game.isOpenDailyWeeklyQuestModal,
	isOpenCryptoQuestModal: state.game.isOpenCryptoQuestModal,
});
class ComponentDailyWeeklyQuests extends Component {
	static propTypes = {
		isMobile: PropTypes.bool.isRequired,
		t: PropTypes.func.isRequired,
		language: PropTypes.string.isRequired,
		history: PropTypes.object.isRequired,
		wsReact: PropTypes.object.isRequired,
		isOpenDailyWeeklyQuestModal: PropTypes.bool,
		setIsOpenDailyWeeklyQuestModal: PropTypes.func.isRequired,
		setIsOpenCryptoQuestModal: PropTypes.func.isRequired,
		isOpenCryptoQuestModal: PropTypes.bool,
	};

	static renderToast = (text, icon) => (
		<div className="content-with-image">
			<img src={icon} alt="season notification" />
			<span>{text}</span>
		</div>
	);

	constructor(props) {
		super(props);
		this.state = {
			activeTab: "daily",
			seasonTitle: {},
			tasks: [],
			isLoading: true,
			timeLeftSeconds: 0,
			collectLoading: false,
			isShowQuestsModal: false,
			viewTime: {
				days: "",
				hours: "0H",
				minutes: "00M",
				seconds: "00S",
			},
			tabsConfig: {
				daily: { title: this.props.t("header.daily"), count: 0 },
				weekly: { title: this.props.t("header.weekly"), count: 0 },
			},
		};
		this.toastDefaultConfig = {
			position: "top-left",
			autoClose: 3000,
			hideProgressBar: true,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
		};
		this.controllers = {};
		this.signals = {};
	}

	componentDidMount() {
		this.initialization();
	}

	initialization = async () => {
		await Promise.all([this.getQuests(), this.getCountQuests()]);

		this.timer = setInterval(() => {
			const time = makeCounterData(this.state.timeLeftSeconds);
			this.setState({
				viewTime: {
					days: time.days,
					hours: time.hours,
					minutes: time.minutes,
					seconds: time.seconds,
				},
				timeLeftSeconds: time.leftSeconds,
			});
		}, 1000);
	};

	async componentDidUpdate(prevProps, prevState) {
		const { timeLeftSeconds } = this.state;

		const isActiveTabChanged = prevState.activeTab !== this.state.activeTab;
		const isCloseModal = prevState.isShowQuestsModal && !this.state.isShowQuestsModal;
		if (isActiveTabChanged || isCloseModal) {
			await Promise.all([this.getQuests(), this.getCountQuests()]);
		}
		if (this.timer && prevState.timeLeftSeconds !== timeLeftSeconds && timeLeftSeconds <= 0) {
			clearInterval(this.timer);
			this.setState({
				viewTime: {
					days: "",
					hours: "00h",
					minutes: "00m",
					seconds: "00S",
				},
			});
		}
		if (prevProps.isOpenDailyWeeklyQuestModal !== this.props.isOpenDailyWeeklyQuestModal && this.props.isOpenDailyWeeklyQuestModal) {
			this.setState({
				isShowQuestsModal: true,
				activeTab: "weekly",
			});
			this.props.setIsOpenDailyWeeklyQuestModal(false);
		}
		if (prevProps.isOpenCryptoQuestModal !== this.props.isOpenCryptoQuestModal && this.props.isOpenCryptoQuestModal) {
			this.setState({
				isShowQuestsModal: false,
			});
		}
	}

	componentWillUnmount() {
		if (this.timer) {
			clearInterval(this.timer);
		}
		Object.keys(this.controllers).forEach((key) => {
			if (this.controllers[key]) {
				this.controllers[key].abort();
			}
		});
	}

	createSignalAndController = (id) => {
		if (this.controllers[id]) {
			this.controllers[id].abort();
		}
		this.controllers[id] = new AbortController();
		this.signals[id] = this.controllers[id].signal;
	};

	refreshBalance = () => {
		this.props.wsReact.send(
			JSON.stringify({
				cmd: "balance_request",
			})
		);
	};

	getCountQuests = async () => {
		const { tabsConfig } = this.state;
		try {
			const json = await fetchWithToken(`/api/quests/user-tasks-count`, {
				method: "GET",
			});

			if (!json.success) {
				return false;
			}

			const { daily, weekly } = json.data;

			this.setState({
				tabsConfig: {
					daily: { ...tabsConfig.daily, count: daily },
					weekly: { ...tabsConfig.weekly, count: weekly },
				},
			});
		} catch (error) {
			console.error(error);
		}
	};

	getQuests = async () => {
		const { activeTab } = this.state;
		this.setState({ isLoading: true });
		try {
			const json = await fetchWithToken(`/api/quests/tasks?type=${activeTab}&limit=3`, {
				method: "GET",
			});

			if (!json.success) {
				return null;
			}

			const tasks = json.data.tasks.map((task) => {
				const rltConfig = getCurrencyConfig("RLT");
				const newTitle = { en: task.title.en, cn: task.title.cn };
				const formatCountRepeat = ["amount_spent", "buy_rlt", "offers_amount", "offers_amount_provider", "amount_spent_in_store"].includes(task.type)
					? decimalAdjust(+task.count_repeats / rltConfig.toSmall, 2)
					: task.count_repeats;
				if (task.additional_data && task.additional_data.game_name) {
					newTitle.en = newTitle.en.replace("{game_name}", task.additional_data.game_name);
					newTitle.cn = newTitle.cn.replace("{game_name}", task.additional_data.game_name);
				}
				if (task.additional_data && task.additional_data.provider_title) {
					newTitle.en = newTitle.en.replace("{provider_name}", task.additional_data.provider_title);
					newTitle.cn = newTitle.cn.replace("{provider_name}", task.additional_data.provider_title);
				}
				if (task.reward.type === "money" && !["RLT", "RST"].includes(task.reward.currency)) {
					newTitle.en = task.reward.title.en;
					newTitle.cn = task.reward.title.cn;
				}
				if (task.type === "visit_game" && activeTab === "weekly") {
					newTitle.en = "Play Games For {count_repeats} Days a Week";
					newTitle.cn = "Play Games For {count_repeats} Days a Week";
				}

				newTitle.en = newTitle.en.replace("{count_repeats}", formatCountRepeat).replace("{day_type}", activeTab).replace("{additional_title}", task.reward.additional_title);
				newTitle.cn = newTitle.cn.replace("{count_repeats}", formatCountRepeat).replace("{day_type}", activeTab).replace("{additional_title}", task.reward.additional_title);
				return { ...task, title: newTitle };
			});

			this.setState({
				viewTime: {
					days: "",
					hours: "00h",
					minutes: "00m",
					seconds: "00S",
				},
				timeLeftSeconds: initTimer(json.data.end_date),
				tasks,
			});
		} catch (e) {
			console.error(e);
		} finally {
			this.setState({ isLoading: false });
		}
	};

	onSelect = (tab) => {
		this.setState({
			activeTab: tab,
		});
	};

	collectTask = async (id) => {
		const { activeTab, tasks } = this.state;
		this.setState({
			collectLoading: true,
		});
		this.createSignalAndController("collect");
		try {
			const json = await fetchWithToken("/api/quests/collect-tasks", {
				method: "POST",
				body: JSON.stringify({ task_id: id, type: activeTab }),
				signal: this.signals.collect,
			});
			if (!json.success) {
				return false;
			}

			const claimedTask = tasks.map((task) => {
				if (task.id === id) {
					task.is_claimed = true;
				}
				return task;
			});

			this.calcTabCountQuests();
			this.refreshBalance();
			this.setState({
				tasks: claimedTask,
			});

			toast(this.constructor.renderToast("Reward received", schedulerIcon), this.toastDefaultConfig);
		} catch (e) {
			console.error(e);
		} finally {
			this.setState({
				collectLoading: false,
			});
		}
	};

	onClickTrigger = (taskID, type, link) => {
		const { history, language } = this.props;
		if (type !== "cryptoQuest") {
			DailyWeeklyOnClickTrigger({ taskID, type, link, language, history });
		}
		if (type === "cryptoQuest" && !this.props.isOpenCryptoQuestModal) {
			this.props.setIsOpenCryptoQuestModal(true);
		}
	};

	calcTabCountQuests = (tab) => {
		const { activeTab, tabsConfig } = this.state;

		const currentTab = tab || activeTab;

		this.setState({
			tabsConfig: {
				...tabsConfig,
				[currentTab]: {
					...tabsConfig[currentTab],
					count: tabsConfig[currentTab].count - 1,
				},
			},
		});
	};

	toggleQuestsModal = () => {
		const { isShowQuestsModal } = this.state;

		this.setState({
			isShowQuestsModal: !isShowQuestsModal,
		});
	};

	render() {
		const { activeTab, viewTime, tasks, isLoading, isShowQuestsModal, collectLoading, tabsConfig } = this.state;
		const { t, language } = this.props;

		return (
			<div className="quests-container">
				{isShowQuestsModal && (
					<DailyWeeklyQuestsModal
						isShowQuestsModal={isShowQuestsModal}
						currentTab={activeTab}
						refreshBalance={this.refreshBalance}
						toggleQuestsModal={this.toggleQuestsModal}
						onClickTrigger={this.onClickTrigger}
						tabsConfig={tabsConfig}
						calcTabCountQuests={this.calcTabCountQuests}
						t={t}
					/>
				)}
				<RollerTabs active={activeTab} tabsConfig={tabsConfig} onSelect={this.onSelect} className="daily-weekly-quests">
					{!isLoading && (
						<Fragment>
							<div className="event-timer-wrapper">
								<div className="remaining-time">
									<div className="time-icon-block">
										<LazyLoad offset={100}>
											<img className="time-icon" src={clockIcon} alt="timer" width={15} />
										</LazyLoad>
									</div>

									<p className="time-text">
										{viewTime.days && `${viewTime.days}`} {viewTime.hours} {viewTime.minutes} {viewTime.seconds}
									</p>
								</div>
							</div>
						</Fragment>
					)}
					<Fragment>
						{isLoading && (
							<div className="marketplace-preloader-layer">
								<img src={loaderImg} height="63" width="63" className="loader-img" alt="preloader" />
							</div>
						)}
						{!isLoading && !!tasks.length && (
							<div className="quests-block">
								{tasks.map((task) => (
									<DailyWeeklyTasksCard
										key={task.id}
										collectTask={this.collectTask}
										onClickTrigger={this.onClickTrigger}
										task={task}
										language={language}
										collectLoading={collectLoading}
									/>
								))}
							</div>
						)}
					</Fragment>
					<div className="quests-btn-block">
						<RollerButton width={100} text={t("header.moreQuests")} action={() => this.toggleQuestsModal()} />
					</div>
				</RollerTabs>
			</div>
		);
	}
}

export default withRouter(withTranslation("Game")(connect(mapStateToProps, mapDispatchToProps)(ComponentDailyWeeklyQuests)));
