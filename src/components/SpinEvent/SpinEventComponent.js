import React, { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, Route, useHistory } from "react-router-dom";
import { Col, Nav, NavItem, NavLink, Row } from "reactstrap";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import confetti from "canvas-confetti";
import QuestsList from "../SingleComponents/Quests/QuestsList";
import RewardsPuzzle from "./RewardsPuzzle";
import RewardCollectModal from "../SingleComponents/RewardCollectModal";

import getLanguagePrefix from "../../services/getLanguagePrefix";
import fetchWithToken from "../../services/fetchWithToken";

import rewardActiveIcon from "../../assets/img/icon/reward_active.svg";
import rewardIcon from "../../assets/img/icon/reward.svg";
import schedulerActiveIcon from "../../assets/img/icon/scheduler_black.svg";
import schedulerIcon from "../../assets/img/icon/scheduler.svg";

const endTimer = Date.now() + 10 * 1000;
const colors = ["#bb0000", "#ffffff", "#3f3290"];

const SpinEventComponent = ({ eventConfig, eventIcon }) => {
	const [rewardsData, setRewardsData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isAllTasksClaimed, setIsAllTasksClaimed] = useState(false);
	const [isShowRewardModal, setIsShowRewardModal] = useState(false);
	const [claimedRewardData, setClaimedRewardData] = useState(null);
	const { t } = useTranslation("Game");
	const isMobile = useSelector((state) => state.game.isMobile);
	const language = useSelector((state) => state.game.language);
	const history = useHistory();
	const controllers = {};
	const signals = {};

	const isTabActive = (path) => {
		const { pathname } = history.location;
		return pathname.endsWith(path);
	};

	useEffect(async () => {
		await getEventProgressData();
		return () =>
			Object.keys(controllers).forEach((key) => {
				if (controllers[key]) {
					controllers[key].abort();
				}
			});
	}, []);

	const createSignalAndController = (id) => {
		if (controllers[id]) {
			controllers[id].abort();
		}
		controllers[id] = new AbortController();
		signals[id] = controllers[id].signal;
	};

	const getEventProgressData = async () => {
		createSignalAndController("getEventProgressData");
		setIsLoading(true);
		try {
			const json = await fetchWithToken("/api/events/spin-event/progress", {
				method: "GET",
				signal: signals.getEventProgressData,
			});
			if (!json.success) {
				return false;
			}
			const isAllTasksClaimedResult = json.data.every((task) => task.is_claimed);
			setIsAllTasksClaimed(isAllTasksClaimedResult);
			setRewardsData(json.data);
		} catch (e) {
			console.error(e);
		} finally {
			setIsLoading(false);
		}
	};

	const confettiFrame = () => {
		confetti({
			particleCount: 3,
			angle: 60,
			spread: 55,
			origin: { x: 0 },
			colors,
		});
		confetti({
			particleCount: 3,
			angle: 120,
			spread: 55,
			origin: { x: 1 },
			colors,
		});
		confetti({
			particleCount: 3,
			angle: 180,
			spread: 55,
			origin: { x: 2 },
			colors,
		});

		if (Date.now() < endTimer) {
			requestAnimationFrame(confettiFrame);
		}
	};

	const claimedQuestSuccess = (rewardId) => {
		if (!rewardId) {
			return false;
		}
		if (isMobile) {
			history.push(`${getLanguagePrefix(language)}${eventConfig.site_paths.main}`);
			setTimeout(() => {
				setClaimedReward(rewardId);
			}, 500);
		} else {
			setClaimedReward(rewardId);
		}
	};

	const setClaimedReward = (rewardId) => {
		const newRewardsData = rewardsData.map((reward) => {
			if (reward._id === rewardId) {
				return { ...reward, is_claimed: true };
			}
			return reward;
		});
		const isAllRewardsClaimedResult = newRewardsData.every((reward) => reward.is_claimed);
		if (isAllRewardsClaimedResult) {
			setIsAllTasksClaimed(isAllRewardsClaimedResult);
			confettiFrame();
		}
		setRewardsData(newRewardsData);
	};

	const rewardModalOpen = (itemId) => {
		const rewardItem = rewardsData.find((reward) => reward._id === itemId);
		setClaimedRewardData(rewardItem);
		setIsShowRewardModal(true);
	};

	const closeRewardModal = () => {
		setIsShowRewardModal(false);
		setClaimedRewardData(null);
	};

	const isShowTasksAndPuzzle = !isAllTasksClaimed && !!rewardsData.length;
	const imgPath = `${process.env.STATIC_URL}/static/img/events/spin_event/`;
	const backgroundImageUrl = eventConfig ? `url("${imgPath}${eventConfig._id}/${eventConfig.files.complete_banner_background}")` : "";
	const bannerBackgroundImage = `url("${imgPath}${eventConfig._id}/${eventConfig.files.progress_img}")`;
	const completedBannerBackgroundImage = `url("${imgPath}${eventConfig._id}/${eventConfig.files.progress_complete_img}")`;
	return (
		<Fragment>
			{isShowRewardModal && claimedRewardData && <RewardCollectModal isOpen={isShowRewardModal} closeModal={closeRewardModal} reward={claimedRewardData} />}
			{isAllTasksClaimed && !isMobile && (
				<Row className="spin-reward">
					<Col lg={6} className="complete-page-banner">
						<div className="spin-event-banner" style={{ background: `${completedBannerBackgroundImage} center center / cover no-repeat` }} />
					</Col>
					<Col lg={6} className="complete-page-text">
						<div className="spin-event-banner content-block" style={{ background: backgroundImageUrl }}>
							<div className="text-description-block">
								<p className="text-description">
									<span>{t("spinEvent.completeDescription1")}</span>
									<br />
									<span>{t("spinEvent.completeDescription2")}</span>
									<br />
									<span>{t("spinEvent.completeDescription3")}</span>
									<br />
									<span>{t("spinEvent.completeDescription4")}</span>
								</p>
								<p className="rollecroin-team-text">{t("spinEvent.team")}</p>
							</div>
						</div>
					</Col>
				</Row>
			)}
			{isAllTasksClaimed && isMobile && (
				<Fragment>
					<Row className="spin-reward" noGutters={true}>
						<Col xs={12} className="complete-page-text">
							<div className="spin-event-banner content-block text-content-block">
								<div className="text-description-block">
									<p className="text-description">
										<span>{t("spinEvent.completeDescription1")}</span>
										<br />
										<span>{t("spinEvent.completeDescription2")}</span>
										<br />
										<span>{t("spinEvent.completeDescription3")}</span>
										<br />
										<span>{t("spinEvent.completeDescription4")}</span>
									</p>
									<p className="rollecroin-team-text">{t("spinEvent.team")}</p>
								</div>
							</div>
						</Col>
					</Row>
					<Row className="spin-reward" noGutters={true}>
						<Col xs={12}>
							<div className="spin-event-banner" style={{ background: `${bannerBackgroundImage} center center / cover no-repeat` }} />
						</Col>
					</Row>
				</Fragment>
			)}
			{isShowTasksAndPuzzle && !isMobile && (
				<Row>
					<Col lg={6}>
						<QuestsList
							claimedQuestSuccess={(id) => claimedQuestSuccess(id)}
							isClaimedAllPassRewards={false}
							isUserMaxXp={false}
							eventType="spin_event"
							eventName={eventConfig.title[language] || eventConfig.title.en}
							eventIcon={eventIcon}
							rewardToast={rewardModalOpen}
						/>
					</Col>
					<Col lg={6}>
						<RewardsPuzzle eventConfig={eventConfig} rewardsData={rewardsData} isLoading={isLoading} />
					</Col>
				</Row>
			)}
			{isShowTasksAndPuzzle && isMobile && (
				<Fragment>
					<Row noGutters={true}>
						<Col xs="12">
							<Nav pills className="spin-event-nav">
								<NavItem>
									<NavLink tag={Link} className={isTabActive(eventConfig.site_paths.quests) ? "active" : ""} to={`${getLanguagePrefix(language)}${eventConfig.site_paths.quests}`}>
										<img
											src={isTabActive(eventConfig.site_paths.quests) ? schedulerActiveIcon : schedulerIcon}
											width={24}
											height={24}
											alt="event quests"
											className="event-tab-img"
										/>
										<span>{t("eventPass.quests")}</span>
									</NavLink>
								</NavItem>
								<NavItem>
									<NavLink tag={Link} className={isTabActive(eventConfig.site_paths.main) ? "active" : ""} to={`${getLanguagePrefix(language)}${eventConfig.site_paths.main}`}>
										<img src={isTabActive(eventConfig.site_paths.main) ? rewardActiveIcon : rewardIcon} width={24} height={24} alt="season rewards" className="event-tab-img" />
										<span>{t("eventPass.event")}</span>
									</NavLink>
								</NavItem>
							</Nav>
						</Col>
					</Row>
					<Row noGutters={true}>
						<Col xs="12">
							<Route
								exact
								path={`${getLanguagePrefix(language)}${eventConfig.site_paths.quests}`}
								render={() => (
									<QuestsList
										claimedQuestSuccess={(id) => claimedQuestSuccess(id)}
										isClaimedAllPassRewards={false}
										isUserMaxXp={false}
										eventType={"spin_event"}
										eventName={eventConfig.title[language] || eventConfig.title.en}
										eventIcon={eventIcon}
										rewardToast={rewardModalOpen}
									/>
								)}
							/>
						</Col>
						<Col xs="12">
							<Route
								exact
								path={`${getLanguagePrefix(language)}${eventConfig.site_paths.main}`}
								render={() => <RewardsPuzzle eventConfig={eventConfig} rewardsData={rewardsData} isLoading={isLoading} />}
							/>
						</Col>
					</Row>
				</Fragment>
			)}
		</Fragment>
	);
};

SpinEventComponent.propTypes = {
	eventConfig: PropTypes.object.isRequired,
	eventIcon: PropTypes.string.isRequired,
};

export default SpinEventComponent;
