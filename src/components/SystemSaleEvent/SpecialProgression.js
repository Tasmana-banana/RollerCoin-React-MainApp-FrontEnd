import React, { Fragment, useEffect, useRef, useState } from "react";
import { Col, Progress, Row } from "reactstrap";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import RewardMinersModal from "./SystemSaleEventModals/RewardMinersModal";
import ItemRewardModal from "../SingleComponents/ItemRewardModal";
import specialEventPEToast from "../../services/specialEventPEToast";
import progressionEventRewardToast from "../../services/progressionEventRewardToast";
import fetchWithToken from "../../services/fetchWithToken";

import "../../assets/scss/SystemSaleEvent/SpecialProgression.scss";
import "../../assets/scss/ProgressionEvent/ProgressionEventTaskToast.scss";
import "../../assets/scss/ProgressionEvent/ProgressionEventRewardToast.scss";

import completeIcon from "../../assets/img/system_sale_event/tick.svg";
import loaderImg from "../../assets/img/loader_sandglass.gif";

const initialState = {
	isPEAvailable: false,
	peConfig: {
		event: null,
		levelsConfig: [],
		rewards: [],
		mainReward: null,
	},
	peTasks: [],
	peUserStats: {
		user_xp: 0,
		user_level: 0,
		user_multiplier: 100,
		user_multiplier_date_to: 0,
	},
	isPEUserStatsNeedRefresh: false,
};

const imageConstructor = (itemType, item) => {
	const typeImgConfig = {
		miner: `${process.env.STATIC_URL}/static/img/market/miners/${item.item?.filename}.gif?v=${item.item?.img_ver || 1}`,
	};
	return typeImgConfig[itemType];
};

const SpecialProgression = ({ rewardIcon, eventType }) => {
	const { t } = useTranslation("SystemSaleEvent");
	const wsNode = useSelector((state) => state.webSocket.wsNode);
	const isMobile = useSelector((state) => state.game.isMobile);
	const PEData = useRef(initialState);
	const [startUserXp, setStartUserXp] = useState(0);
	const [currentLevelXp, setCurrentLevelXp] = useState(0);
	const [currentLevel, setCurrentLevel] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [viewItem, setViewItem] = useState(null);
	const [isViewItemModal, setIsViewItemModal] = useState(false);
	const [isViewRewardsModal, setIsViewRewardsModal] = useState(false);
	const [nextReward, setNextReward] = useState(null);
	const [isCompleted, setIsCompleted] = useState(false);
	const controllers = useRef(null);
	const signal = useRef(null);

	useEffect(() => {
		if (wsNode && !wsNode.listenersMessage.progressionEvent) {
			wsNode.setListenersMessage({ progressionEvent: onWSNodeMessage });
		}

		initialization();

		return () => {
			if (wsNode) {
				wsNode.removeListenersMessage("progressionEvent");
			}

			Object.keys(controllers).forEach((key) => {
				if (controllers[key]) {
					controllers[key].abort();
				}
			});
		};
	}, [wsNode]);

	useEffect(() => {
		const { isPEAvailable } = PEData.current;
		if (isPEAvailable) {
			initialization();
		}
	}, [PEData.current]);

	const createSignalAndController = () => {
		if (controllers.current) {
			controllers.current.abort();
		}
		controllers.current = new AbortController();
		signal.current = controllers.current.signal;
	};

	const getTasks = async (type) => {
		createSignalAndController("getTasks");
		try {
			const query = type ? `type=${type}` : "";
			const url = `/api/progression-event/progression-tasks/?${query}`;
			const json = await fetchWithToken(url, {
				method: "GET",
				signal: signal.getTasks,
			});
			if (!json.success) {
				return false;
			}

			return {
				success: true,
				data: { peTasks: json.data },
			};
		} catch (e) {
			console.error(e);
			return { success: false };
		}
	};

	const getUserStats = async (type) => {
		createSignalAndController("getUserStats");
		try {
			const query = type ? `type=${type}` : "";
			const url = `/api/progression-event/progression-user-stats/?${query}`;
			const json = await fetchWithToken(url, {
				method: "GET",
				signal: signal.getUserStats,
			});
			if (!json.success) {
				return false;
			}

			return {
				success: true,
				data: {
					peUserStats: json.data,
					isPEUserStatsNeedRefresh: false,
				},
			};
		} catch (e) {
			console.error(e);
			return { success: false };
		}
	};

	const getProgressionEvent = async (type) => {
		createSignalAndController("getProgressionEvent");
		try {
			const query = type ? `type=${type}` : "";
			const url = `/api/progression-event/progression-event/?${query}`;
			const json = await fetchWithToken(url, {
				method: "GET",
				signal: signal.getProgressionEvent,
			});
			if (!json.success || !json.data) {
				return false;
			}
			const dataString = atob(json.data);
			const dataObject = JSON.parse(dataString);
			const { event, rewards, levels_config: levelsConfig } = dataObject;
			const mainPEReward = dataObject.rewards.find((item) => +item.required_level === +dataObject.event.max_level);

			return {
				success: true,
				peConfig: {
					event,
					rewards,
					levelsConfig,
					mainPEReward,
				},
			};
		} catch (e) {
			console.error(e);
			return { success: false };
		}
	};

	const getPEData = async (type) => {
		const eventAvailable = await getProgressionEvent(type);
		if (eventAvailable.success) {
			const peData = await Promise.all([getTasks(type), getUserStats(type)]);
			const allPEDataSuccess = peData.every((item) => item.success);
			if (allPEDataSuccess) {
				const adjustedData = peData.reduce((acc, val) => {
					const entries = Object.entries(val.data);
					entries.forEach(([key, value]) => {
						acc[key] = value;
					});
					return acc;
				}, {});

				PEData.current = {
					isPEAvailable: true,
					peConfig: eventAvailable.peConfig,
					isPEUserStatsNeedRefresh: adjustedData.isPEUserStatsNeedRefresh,
					peTasks: adjustedData.peTasks,
					peUserStats: adjustedData.peUserStats,
				};
			}
		}
	};
	const initialization = async () => {
		const { isPEAvailable, isPEUserStatsNeedRefresh } = PEData.current;

		if (isPEAvailable && isPEUserStatsNeedRefresh) {
			await getUserStats(eventType);
		}
		if (!isPEAvailable) {
			await getPEData(eventType);
		}

		if (isPEAvailable) {
			handleCurrentLevelStatus();
		}
		setIsLoading(false);
	};

	const onWSNodeMessage = (event) => {
		const { isPEAvailable } = PEData.current;
		const data = JSON.parse(event.data);
		const { cmd, value } = data;
		switch (cmd) {
			case "pe_user_task_update":
				if (isPEAvailable && value.event_type === eventType) {
					specialEventPEToast(Math.floor(value.received_xp / PEData.current.peConfig.event.divider), rewardIcon);
					handleUpdateUserProgress(value);
				}
				break;
			case "pe_user_reward_info":
				if (value.event_type === eventType) {
					progressionEventRewardToast(value);
				}
				break;
			default:
				break;
		}
	};

	const handleUpdateUserProgress = (value) => {
		const { peUserStats } = PEData.current;
		PEData.current = {
			...PEData.current,
			peUserStats: { ...peUserStats, user_level: value.user_level, user_xp: value.user_xp, user_multiplier: value.multiplier || 100, user_multiplier_date_to: value.date_to || 0 },
		};
		handleCurrentLevelStatus();
	};

	const handleCurrentLevelStatus = () => {
		const { peConfig, peUserStats } = PEData.current;
		const peIsCompleted = peUserStats.user_level >= +peConfig.event.max_level;

		if (peIsCompleted) {
			const lastReward = peConfig.rewards.find((item) => +item.required_level === +peConfig.event.max_level);
			const currLevel = peConfig.levelsConfig.find((item) => +item.level === +peUserStats.user_level);
			setCurrentLevel(currLevel);
			setCurrentLevelXp(currLevel.level_xp);
			setNextReward(lastReward);
			setIsCompleted(true);
			setStartUserXp(currLevel.level_xp);
			return;
		}
		const prevLevel = peConfig.levelsConfig.find((item) => +item.level === +peUserStats.user_level);
		const currLevel = peConfig.levelsConfig.find((item) => +item.level === +peUserStats.user_level + 1);
		const newNextReward = peConfig.rewards.find((item) => +item.required_level === +peUserStats.user_level + 1);

		if (!currLevel || !newNextReward) {
			return false;
		}

		setStartUserXp(peUserStats.user_xp - (prevLevel ? prevLevel.required_xp : 0));
		setCurrentLevel(currLevel);
		setCurrentLevelXp(currLevel.level_xp);
		setNextReward(newNextReward);
	};

	const toggleViewItemModal = (e, item = null) => {
		e.stopPropagation();
		setIsViewItemModal(!isViewItemModal);
		setViewItem(item);
	};

	const toggleViewRewardsModal = () => {
		setIsViewRewardsModal(!isViewRewardsModal);
	};

	const {
		isPEAvailable,
		peConfig: { rewards, levelsConfig, event },
		peUserStats,
	} = PEData.current;
	const levelsAndRewardsData = rewards.map((reward, i) => {
		return { ...reward, ...levelsConfig[i] };
	});

	const calculateProgressBar = () => {
		if (isCompleted) {
			return 100;
		}

		if (isMobile) {
			return (+startUserXp / +currentLevelXp) * 100;
		}

		const totalLevels = levelsConfig.length;
		let completedLevels = currentLevel ? currentLevel.level - 1 : 0;
		let percentPerLevel = 100 / totalLevels;
		const currentLevelPercentage = (percentPerLevel / levelsConfig[completedLevels].level_xp) * startUserXp;
		return completedLevels * percentPerLevel + currentLevelPercentage;
	};

	return (
		<Row noGutters={true}>
			<Fragment>
				<Col xs={12}>
					<div className="special-event-progression">
						{isLoading && (
							<div className="event-progress">
								<div className="season-banner-preloader">
									<img src={loaderImg} height={63} width={63} alt="Loading..." />
								</div>
							</div>
						)}

						{!isLoading && isPEAvailable && (
							<div className="event-progress">
								{isMobile && (
									<div className="mobile-progress-result">
										<div className="progress-bar-points progress-points-abs">
											<span>{t("progressBar.level")}</span>
											<span className="progress-points-text">
												{peUserStats.user_level}/{event.max_level}
											</span>
										</div>

										<div className="progress-bar-points">
											<img src={rewardIcon} alt="coin-icon" width="17" height="17" />
											<span className="progress-points-text">
												{Math.floor(peUserStats.user_xp / (event.divider || 1))}/{event.max_xp / (event.divider || 1)}
											</span>
										</div>
									</div>
								)}
								<div className="custom-progress-bar">
									<Progress value={calculateProgressBar()} />
									<div className="event-items-list">
										{isMobile && (
											<>
												<div className="progress-bar-item-wrapper">
													<div className="progress-bar-first-item progress-bar-item">
														<img src={rewardIcon} alt="coin-icon" width="24" height="24" />
													</div>
												</div>

												{nextReward && (
													<div
														className="progress-bar-item progress-bar-item-card"
														onClick={(e) =>
															toggleViewItemModal(e, {
																...nextReward,
																item_type: nextReward.type,
															})
														}
													>
														<img src={imageConstructor(nextReward?.type, nextReward)} alt={nextReward?.title} />
														{isCompleted && (
															<>
																<span className="progress-completed-bg"></span>
																<img className="progress-completed-img" src={completeIcon} alt="completed-task" />
															</>
														)}
													</div>
												)}
											</>
										)}

										{!isMobile && (
											<>
												<div className="progress-bar-item-wrapper">
													<div className="progress-bar-points progress-points-abs">
														<span>{t("progressBar.level")}</span>
														<span className="progress-points-text">
															{peUserStats.user_level}/{event.max_level}
														</span>
													</div>
													<div className="progress-bar-first-item progress-bar-item">
														<img src={rewardIcon} alt="coin-icon" width="24" height="24" />
													</div>
												</div>

												{levelsAndRewardsData.map((value, index) => {
													const isLastItem = levelsAndRewardsData.length - 1 === index;
													const isLvlCompleted = +peUserStats.user_xp >= +value.required_xp;

													return (
														<div className="progress-bar-item-wrapper" key={`level_${value.level}`}>
															{isLastItem && (
																<div className={`progress-bar-points progress-points-abs`}>
																	<img src={rewardIcon} alt="coin-icon" width="17" height="17" />
																	<span className="progress-points-text">
																		{Math.floor(peUserStats.user_xp / (event.divider || 1))}/{event.max_xp / (+event.divider || 1)}
																	</span>
																</div>
															)}

															{!isLastItem && (
																<div className={`progress-bar-points`}>
																	<img src={rewardIcon} alt="coin-icon" width="17" height="17" />
																	<span className="progress-points-text">{+value.required_xp / (+event.divider || 1)}</span>
																</div>
															)}

															<div
																className={`${isLastItem ? "progress-bar-last-item" : ""}`}
																onClick={(e) =>
																	toggleViewItemModal(e, {
																		...value,
																		item_type: value.type,
																	})
																}
															>
																<div className="progress-bar-item progress-bar-item-card">
																	<img src={imageConstructor(value.type, value)} alt="" />

																	{isLvlCompleted && (
																		<>
																			<span className="progress-completed-bg"></span>
																			<img className="progress-completed-img" src={completeIcon} alt="completed-task" />
																		</>
																	)}
																</div>
															</div>
														</div>
													);
												})}
											</>
										)}
									</div>
								</div>
								{isMobile && (
									<div className="show-all-rewards">
										<span onClick={isMobile ? toggleViewRewardsModal : null}>{t("progressBar.showAllRewards")}</span>
									</div>
								)}
							</div>
						)}
					</div>
				</Col>
				{isViewItemModal && viewItem && (
					<ItemRewardModal
						reward={viewItem}
						isViewReward={isViewItemModal}
						toggleViewReward={toggleViewItemModal}
						imgUrl={imageConstructor(viewItem.item_type, viewItem)}
						eventType={"system_sale_event"}
					/>
				)}
				{isMobile && isViewRewardsModal && (
					<RewardMinersModal
						rewards={levelsAndRewardsData}
						divider={event.divider}
						isViewRewardsModal={isViewRewardsModal}
						toggleViewRewardsModal={toggleViewRewardsModal}
						rewardIcon={rewardIcon}
					/>
				)}
			</Fragment>
		</Row>
	);
};

SpecialProgression.propTypes = {
	rewardIcon: PropTypes.string,
	eventType: PropTypes.string,
};

export default SpecialProgression;
