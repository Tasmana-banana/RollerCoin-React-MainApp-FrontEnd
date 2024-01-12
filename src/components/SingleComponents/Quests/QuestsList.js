import React, { Fragment, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col } from "reactstrap";
import { LazyLoadImage } from "react-lazy-load-image-component";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import SimpleBar from "simplebar-react";
import QuestCard from "./QuestCard";
import EventTimer from "../EventTimer";
import fetchWithToken from "../../../services/fetchWithToken";
import getLanguagePrefix from "../../../services/getLanguagePrefix";
import scrollToElement from "../../../services/scrollToElement";
import redDotNotification from "../../../services/redDotNotify";
import decimalAdjust from "../../../services/decimalAdjust";
import getCurrencyConfig from "../../../services/getCurrencyConfig";
import * as actionsUser from "../../../actions/userInfo";

import "simplebar-react/dist/simplebar.min.css";
import "../../../assets/scss/SingleComponents/QuestsList.scss";

import loaderImg from "../../../assets/img/loader_sandglass.gif";
import emptyIcon from "../../../assets/img/seasonPass/empty_quests.gif";

const EVENT_CONFIG = {
	spin_event: {
		collectUrl: "/api/events/spin-event/claim-task",
		getTasksUrl: "/api/events/spin-event/tasks-list",
		toasterTitle: "Spin event",
		heightClaimed: 620,
		height: 724,
	},
	season: {
		collectUrl: "/api/season/collect-task",
		getTasksUrl: "/api/season/seasons-tasks",
		toasterTitle: "Season pass",
		heightClaimed: 685,
		height: 880,
	},
};

const QuestsList = ({ isClaimedAllPassRewards, claimedQuestSuccess, isUserMaxXp, eventType, isShowTimer = false, eventIcon, rewardToast }) => {
	const dispatch = useDispatch();
	const history = useHistory();
	const isMobile = useSelector((state) => state.game.isMobile);
	const language = useSelector((state) => state.game.language);
	const isViewedEventQuestion = useSelector((state) => state.user.isViewedEventQuestion);

	const { t } = useTranslation("Game");
	const [tasks, setTasks] = useState([]);
	const [eventTitle, setEventTitle] = useState({});
	const [isClaimProcessed, setIsClaimProcessed] = useState(false);
	const [endDate, setEndDate] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [isAllTasksClaimed, setIsAllTasksClaimed] = useState(false);
	const scrollableNodeRef = useRef();
	const controllers = {};
	const signals = {};

	const createSignalAndController = (id) => {
		if (controllers[id]) {
			controllers[id].abort();
		}
		controllers[id] = new AbortController();
		signals[id] = controllers[id].signal;
	};

	const getTasks = async () => {
		setIsLoading(true);
		createSignalAndController("getTasks");
		try {
			const json = await fetchWithToken(EVENT_CONFIG[eventType].getTasksUrl, {
				method: "GET",
				signal: signals.getTasks,
			});
			if (!json.success || !json.data.available) {
				return setIsLoading(false);
			}
			const newTasks = json.data.tasks
				.map((task) => {
					const rltConfig = getCurrencyConfig("RLT");
					const newTitle = { en: task.title.en, cn: task.title.cn };
					const newDescription = { en: task.description.en, cn: task.description.cn };
					const formatCountRepeat = ["amount_spent", "offers_amount", "buy_rlt", "amount_spent_in_store"].includes(task.type)
						? decimalAdjust(+task.count_repeats / rltConfig.toSmall)
						: task.count_repeats;
					if (task.additional_data && task.additional_data.game_name) {
						newTitle.en = newTitle.en.replace("{game_name}", task.additional_data.game_name);
						newTitle.cn = newTitle.cn.replace("{game_name}", task.additional_data.game_name);
						newDescription.en = newDescription.en.replace("{game_name}", task.additional_data.game_name);
						newDescription.cn = newDescription.cn.replace("{game_name}", task.additional_data.game_name);
					}
					newTitle.en = newTitle.en.replace("{count_repeats}", formatCountRepeat).replace("{xp_reward}", task.xp_reward);
					newTitle.cn = newTitle.cn.replace("{count_repeats}", formatCountRepeat).replace("{xp_reward}", task.xp_reward);
					newDescription.en = newDescription.en.replace("{count_repeats}", formatCountRepeat).replace("{xp_reward}", task.xp_reward);
					newDescription.cn = newDescription.cn.replace("{count_repeats}", formatCountRepeat).replace("{xp_reward}", task.xp_reward);
					return { ...task, title: newTitle, description: newDescription };
				})
				.sort((a, b) => a.task_position - b.task_position);
			const isAllTasksClaimedResult = json.data.tasks.every((task) => task.is_claimed);

			setEndDate(json.data.end_date);
			setTasks(newTasks);
			setEventTitle(json.data.quest_title || {});
			setIsLoading(false);
			setIsAllTasksClaimed(isAllTasksClaimedResult);
		} catch (e) {
			console.error(e);
		}
	};

	const initialization = async () => {
		await getTasks();
		if (!isViewedEventQuestion && EVENT_CONFIG[eventType] === "season") {
			localStorage.setItem("day_of_view_event_quests", redDotNotification.getDayNumber());
			dispatch(actionsUser.setViewedEventQuestion(true));
		}
	};

	useEffect(() => {
		if (!isClaimedAllPassRewards) {
			initialization();
		}
		return () => {
			Object.keys(controllers).forEach((key) => {
				if (controllers[key]) {
					controllers[key].abort();
				}
			});
		};
	}, []);

	const collectTask = async (id) => {
		createSignalAndController("collect");
		setIsClaimProcessed(true);
		try {
			const json = await fetchWithToken(EVENT_CONFIG[eventType].collectUrl, {
				method: "POST",
				body: JSON.stringify({ task_id: id }),
				signal: signals.collect,
			});
			if (!json.success) {
				return false;
			}
			if (json.data?.spin_events_rewards_id) {
				await claimedQuestSuccess(json.data.spin_events_rewards_id);
			} else {
				await claimedQuestSuccess();
			}
			await getTasks();
			if (rewardToast && (json.data.is_level_up || json.data.spin_events_rewards_id)) {
				rewardToast(json.data?.spin_events_rewards_id);
			}
		} catch (e) {
			console.error(e);
		} finally {
			setIsClaimProcessed(false);
		}
	};

	const onClickTrigger = async (taskID, type, link) => {
		switch (type) {
			case "games_by_number":
			case "visit_game":
			case "games":
				return history.push(`${getLanguagePrefix(language)}/game/choose_game`);
			case "referral":
				return history.push(`${getLanguagePrefix(language)}/referral/stats`);
			case "amount_spent":
			case "amount_spent_in_store":
				return history.push(`${getLanguagePrefix(language)}/game/market`);
			case "open_lootbox":
			case "open_particular_lootbox":
				return history.push(`${getLanguagePrefix(language)}/game/market/lootboxes`);
			case "buy_rlt":
				return history.push(`${getLanguagePrefix(language)}/wallet`);
			case "offer_task":
			case "offers_amount_provider":
			case "offers_amount":
				return history.push(`${getLanguagePrefix(language)}/taskwall`);
			case "make_any_craft":
			case "make_craft_by_type":
				return history.push(`${getLanguagePrefix(language)}/storage/merge/parts`);
			case "youtube":
			case "facebook":
			case "twitter":
			case "telegram":
			case "discord":
			case "like_twitter":
			case "subscribe_twitter":
			case "subscribe_discord":
			case "subscribe_telegram":
			case "subscribe_instagram":
			case "subscribe_tiktok":
				window.open(link, "_blank");
				await collectTask(taskID);
				break;
			case "finish_tasks":
				if (isMobile) {
					scrollToElement(".quest-do-btn", -150);
				} else {
					const nestedScrollBox = scrollableNodeRef.current.getScrollElement();
					const mainScrollTarget = document.querySelector(".quests-wrapper");
					if (mainScrollTarget) {
						const mainTargetElement = mainScrollTarget.getBoundingClientRect();
						const scrollTime = Math.abs(mainTargetElement.top) + 200;
						const scrollBounce = scrollTime > 600 ? 600 : scrollTime;
						window.scrollTo(0, mainTargetElement.top + window.scrollY - 60);
						setTimeout(() => {
							const scrollTarget = document.querySelector(".quest-scroll-target");
							if (scrollTarget) {
								const scrollTargetElement = scrollTarget.getBoundingClientRect();
								nestedScrollBox.scrollTo(0, nestedScrollBox.scrollTop - 30 - scrollTargetElement.height + scrollTargetElement.top);
							}
						}, scrollBounce);
					}
				}
				break;
			default:
				break;
		}
	};

	const isViewedStubImg = isAllTasksClaimed || !tasks.length || isUserMaxXp;
	return (
		<Row className={`quests-wrapper ${isClaimedAllPassRewards ? "max-user-xp" : ""} ${isViewedStubImg ? "empty-tasks" : ""}`} noGutters={true}>
			<Col xs="12">
				{isLoading && (
					<div className={`quests-preloader ${eventType === "season" ? "season-preloader" : ""}`}>
						<LazyLoadImage width={126} height={126} src={loaderImg} alt="preloader" threshold={100} className="loader-img" />
					</div>
				)}
				{!isLoading && (
					<Fragment>
						{!!tasks.length && !isAllTasksClaimed && !isViewedStubImg && (
							<div className="event-quest-title-wrapper">
								<h2 className="event-quest-title">{eventTitle[language] || eventTitle.en || t("eventPass.dailyQuests")}</h2>
								{endDate && isShowTimer && <EventTimer toDate={endDate} />}
							</div>
						)}
						{isViewedStubImg && (
							<Fragment>
								<div className="event-quest-title-wrapper">
									<h2 className="event-quest-title">{eventTitle[language] || eventTitle.en || t("seasonQuests.allQuestCompleted")}</h2>
								</div>
								<div className="event-quest-unavailable-block">
									<img src={emptyIcon} alt="hamster sleep" />
									<h2 className="event-quest-unavailable">{t("seasonQuests.allQuestCompleted")}</h2>
								</div>
							</Fragment>
						)}
						{!isViewedStubImg && (
							<Fragment>
								{isMobile && (
									<div className="event-quest-list">
										{tasks.map((task) => (
											<QuestCard
												eventIcon={eventIcon}
												key={task.id}
												onClickTrigger={onClickTrigger}
												collectTask={collectTask}
												isLoading={isClaimProcessed}
												task={task}
												language={language}
											/>
										))}
									</div>
								)}
								{!isMobile && (
									<div className="event-quest-list with-scroll">
										<SimpleBar
											style={{ maxHeight: isClaimedAllPassRewards ? EVENT_CONFIG[eventType].heightClaimed : EVENT_CONFIG[eventType].height }}
											autoHide={false}
											ref={scrollableNodeRef}
										>
											{tasks.map((task) => (
												<QuestCard
													eventIcon={eventIcon}
													key={task.id}
													onClickTrigger={onClickTrigger}
													collectTask={collectTask}
													task={task}
													language={language}
													isLoading={isClaimProcessed}
												/>
											))}
										</SimpleBar>
									</div>
								)}
							</Fragment>
						)}
					</Fragment>
				)}
			</Col>
		</Row>
	);
};

QuestsList.propTypes = {
	isClaimedAllPassRewards: PropTypes.bool.isRequired,
	claimedQuestSuccess: PropTypes.func.isRequired,
	isUserMaxXp: PropTypes.bool.isRequired,
	isShowTimer: PropTypes.bool,
	eventType: PropTypes.string.isRequired,
	eventName: PropTypes.string,
	eventIcon: PropTypes.string,
	rewardToast: PropTypes.func,
};

export default QuestsList;
