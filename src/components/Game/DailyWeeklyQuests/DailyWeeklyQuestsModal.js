import React, { Fragment, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { connect, useSelector } from "react-redux";
import { withRouter } from "react-router-dom";
import SimpleBar from "simplebar-react";
import { withTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Modal, ModalBody, Nav, NavItem, NavLink, UncontrolledTooltip } from "reactstrap";
import LazyLoad from "react-lazyload";
import DailyWeeklyQuestModalItemCard from "./DailyWeeklyQuestModalItemCard";
import InfoBlockWithIcon from "../../SingleComponents/InfoBlockWithIcon";
import fetchWithToken from "../../../services/fetchWithToken";
import getCurrencyConfig from "../../../services/getCurrencyConfig";
import decimalAdjust from "../../../services/decimalAdjust";
import { initTimer, makeCounterData } from "../../../services/countdownТimer";

import loaderImg from "../../../assets/img/loader_sandglass.gif";
import clockIcon from "../../../assets/img/icon/clock_icon.svg";
import closeIcon from "../../../assets/img/header/close_menu.svg";
import schedulerIcon from "../../../assets/img/icon/scheduler.svg";
import infoTooltipImg from "../../../assets/img/storage/info_icon_round.svg";

import "simplebar-react/dist/simplebar.min.css";
import "../../../assets/scss/Game/DailyWeeklyQuestsModal.scss";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	isMobile: state.game.isMobile,
	language: state.game.language,
});

const renderToast = (text, icon) => (
	<div className="content-with-image">
		<img src={icon} alt="season notification" />
		<span>{text}</span>
	</div>
);

const DailyWeeklyQuestsModal = ({ isShowQuestsModal, t, onClickTrigger, toggleQuestsModal, refreshBalance, tabsConfig, calcTabCountQuests, currentTab = "daily" }) => {
	const phaserScreenInputManager = useSelector((state) => state.game.phaserScreenInputManager);
	const language = useSelector((state) => state.game.language);
	const isMobile = useSelector((state) => state.game.isMobile);
	const [isLoading, setIsLoading] = useState(true);
	const [collectLoading, setCollectLoading] = useState(false);
	const [activeTab, setActiveTab] = useState(currentTab);
	const [tasks, setTasks] = useState([]);
	const [viewTime, setViewTime] = useState({
		days: "",
		hours: "0H",
		minutes: "00M",
		seconds: "",
	});
	const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
	const signals = {};
	const controllers = {};
	const timer = useRef(null);

	useEffect(async () => {
		clearInterval(timer.current);
		if (phaserScreenInputManager) {
			phaserScreenInputManager.enabled = false;
		}
		await getTasks();
		return () => {
			if (timer.current) {
				clearInterval(timer.current);
			}
			Object.keys(controllers).forEach((key) => {
				if (controllers[key]) {
					controllers[key].abort();
				}
			});
		};
	}, []);

	const startTimer = (date) => {
		if (timer.current) {
			clearInterval(timer.current);
		}
		setTimeLeftSeconds(initTimer(date));
		timer.current = setInterval(() => {
			setTimeLeftSeconds((prev) => prev - 1);
		}, 1000);
	};

	const closeModal = () => {
		phaserScreenInputManager.enabled = true;
		toggleQuestsModal();
	};

	useEffect(() => {
		if (timeLeftSeconds < 0) {
			clearInterval(timer.current);
			setViewTime({
				days: "",
				hours: "00H",
				minutes: "00M",
				seconds: "",
			});
			return false;
		}
		const time = makeCounterData(timeLeftSeconds);
		setViewTime({
			days: time.days,
			hours: time.hours,
			minutes: time.minutes,
			seconds: time.seconds,
		});
	}, [timeLeftSeconds]);

	useEffect(async () => {
		clearInterval(timer.current);
		await getTasks();
	}, [activeTab]);

	const createSignalAndController = (id) => {
		if (controllers[id]) {
			controllers[id].abort();
		}
		controllers[id] = new AbortController();
		signals[id] = controllers[id].signal;
	};

	const collectTask = async (id) => {
		setCollectLoading(true);
		clearInterval(timer.current);
		createSignalAndController("collect");
		try {
			const json = await fetchWithToken("/api/quests/collect-tasks", {
				method: "POST",
				body: JSON.stringify({ task_id: id, type: activeTab }),
				signal: signals.collect,
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
			calcTabCountQuests(activeTab);
			refreshBalance();
			setTasks(claimedTask);
			toast(renderToast("Reward received", schedulerIcon));
		} catch (e) {
			console.error(e);
		} finally {
			setCollectLoading(false);
		}
	};

	const getTasks = async () => {
		clearInterval(timer.current);
		createSignalAndController("getTasks");
		try {
			setIsLoading(true);
			const json = await fetchWithToken(`/api/quests/tasks?type=${activeTab}`, {
				method: "GET",
				signal: signals.getTasks,
			});
			if (!json.success || !json.data.available) {
				return false;
			}
			const namedTasks = json.data.tasks.map((task) => {
				const rltConfig = getCurrencyConfig("RLT");
				const currencyConfig = getCurrencyConfig(task.reward.currency);
				const newTitle = { en: task.title.en, cn: task.title.cn };
				const newDescription = { en: task.description.en, cn: task.description.cn };
				const formatCountRepeat = ["amount_spent", "buy_rlt", "offers_amount", "offers_amount_provider", "amount_spent_in_store"].includes(task.type)
					? decimalAdjust(+task.count_repeats / rltConfig.toSmall, 2)
					: task.count_repeats;
				if (task.additional_data && task.additional_data.game_name) {
					newTitle.en = newTitle.en.replace("{game_name}", task.additional_data.game_name);
					newTitle.cn = newTitle.cn.replace("{game_name}", task.additional_data.game_name);
					newDescription.en = newDescription.en.replace("{game_name}", task.additional_data.game_name);
					newDescription.cn = newDescription.cn.replace("{game_name}", task.additional_data.game_name);
				}
				if (task.additional_data && task.additional_data.provider_title) {
					newTitle.en = newTitle.en.replace("{provider_name}", task.additional_data.provider_title);
					newTitle.cn = newTitle.cn.replace("{provider_name}", task.additional_data.provider_title);
					newDescription.en = newDescription.en.replace("{provider_name}", task.additional_data.provider_title);
					newDescription.cn = newDescription.cn.replace("{provider_name}", task.additional_data.provider_title);
				}
				if (task.reward.type === "money" && !["RLT", "RST"].includes(task.reward.currency)) {
					newTitle.en = task.reward.title.en;
					newTitle.cn = task.reward.title.cn;
				}
				// TODO hardcode
				if (task.type === "visit_game" && activeTab === "weekly") {
					newTitle.en = "Play Games For {count_repeats} Days a Week";
					newTitle.cn = "Play Games For {count_repeats} Days a Week";
					newDescription.en = "Play at least one game for {count_repeats} days a week and get {reward} reward";
					newDescription.cn = "Play at least one game for {count_repeats} days a week and get {reward} reward";
				}

				let rewardText = `${decimalAdjust(task.reward.amount / currencyConfig.toSmall, currencyConfig.precision)} ${currencyConfig.name}`;

				if (task.reward.type === "battery") {
					rewardText = `${task.reward.amount} ${task.reward.amount > 1 ? "batteries" : "battery"}`;
				}
				newTitle.en = newTitle.en
					.replace("{count_repeats}", formatCountRepeat)
					.replace("{reward}", rewardText)
					.replace("{day_type}", activeTab)
					.replace("{additional_title}", task.reward.additional_title);
				newTitle.cn = newTitle.cn
					.replace("{count_repeats}", formatCountRepeat)
					.replace("{reward}", rewardText)
					.replace("{day_type}", activeTab)
					.replace("{additional_title}", task.reward.additional_title);
				newDescription.en = newDescription.en.replace("{count_repeats}", formatCountRepeat).replace("{reward}", rewardText);
				newDescription.cn = newDescription.cn.replace("{count_repeats}", formatCountRepeat).replace("{reward}", rewardText);

				return { ...task, title: newTitle, description: newDescription };
			});

			startTimer(json.data.end_date);
			setTasks(namedTasks);
			setIsLoading(false);
		} catch (e) {
			console.error(e);
		}
	};

	return (
		<Modal size="lg" isOpen={isShowQuestsModal} toggle={closeModal} centered className="quests-modal">
			<ModalBody className="quests-modal-body">
				<button className="tree-dimensional-button close-menu-btn btn-default quest-modal-close-btn" onClick={closeModal}>
					<span className="close-btn-img-wrapper">
						<img className="close-btn-img" src={closeIcon} width={12} height={12} alt="close_modal" />
					</span>
				</button>
				<Fragment>
					<div className="info-tooltip-icon-container">
						{isMobile && (
							<>
								<div className="info-icon-block" id="questsInfoMessageId">
									<img className="info-icon" src={infoTooltipImg} alt="info img" width="24" height="24" />
								</div>
								<UncontrolledTooltip placement="bottom" autohide={true} target="questsInfoMessageId">
									{t("infoHints.questsInfoMessage")}
								</UncontrolledTooltip>
							</>
						)}
						<h2 className="quests-title">Quests</h2>
					</div>
					{!isMobile && <InfoBlockWithIcon tName="Game" message="questsInfoMessage" obj="infoHints" />}
					<div className="quests-tab-panel">
						{/* <RollerTabs tabsConfig={tabsConfig} active={activeTab} onSelect={onSelect} /> */}
						<Nav tabs>
							<NavItem>
								<NavLink className={`${activeTab === "daily" ? "active" : ""}`} onClick={() => setActiveTab("daily")}>
									<span className="tab-text">{t("header.daily")}</span>
									<span className="count">{tabsConfig.daily.count}</span>
								</NavLink>
							</NavItem>
							<NavItem>
								<NavLink className={`${activeTab === "weekly" ? "active" : ""}`} onClick={() => setActiveTab("weekly")}>
									<span className="tab-text">{t("header.weekly")}</span>
									<span className="count">{tabsConfig.weekly.count}</span>
								</NavLink>
							</NavItem>
						</Nav>
						<div className="quest-tab-content">
							{isLoading && (
								<div className="quests-preloader">
									<LazyLoad offset={100}>
										<img src={loaderImg} height={126} width={126} className="loader-img" alt="preloader" />
									</LazyLoad>
								</div>
							)}
							{!isLoading && !tasks.length && <h2 className="event-quest-unavailable">Currently no quests</h2>}
							{!isLoading && (
								<div className="quest-timer-wrapper">
									<div className="remaining-time">
										<div className="time-icon">
											<LazyLoad offset={100}>
												<img src={clockIcon} alt="timer" width={20} height={20} />
											</LazyLoad>
										</div>
										<p className="time-text">
											{viewTime.days && `${viewTime.days}`} {viewTime.hours} {viewTime.minutes} {viewTime.seconds}
										</p>
									</div>
								</div>
							)}
							{!isLoading && !!tasks.length && (
								<SimpleBar style={{ maxHeight: 475 }} autoHide={false}>
									<div className="quests-block with-scroll">
										{tasks.map((task) => (
											<DailyWeeklyQuestModalItemCard
												key={task.id}
												onClickTrigger={onClickTrigger}
												t={t}
												collectTask={collectTask}
												collectLoading={collectLoading}
												isMobile={isMobile}
												task={task}
												language={language}
											/>
										))}
									</div>
								</SimpleBar>
							)}
						</div>
					</div>
				</Fragment>
			</ModalBody>
		</Modal>
	);
};

DailyWeeklyQuestsModal.propTypes = {
	isShowQuestsModal: PropTypes.bool.isRequired,
	toggleQuestsModal: PropTypes.func.isRequired,
	onClickTrigger: PropTypes.func.isRequired,
	currentTab: PropTypes.string,
	t: PropTypes.func.isRequired,
	refreshBalance: PropTypes.object.isRequired,
	tabsConfig: PropTypes.object.isRequired,
	calcTabCountQuests: PropTypes.func.isRequired,
};

export default withRouter(withTranslation("Game")(connect(mapStateToProps, null)(DailyWeeklyQuestsModal)));
