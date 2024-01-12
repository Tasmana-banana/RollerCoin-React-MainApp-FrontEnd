import React, { Fragment, useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Row, Col, Progress } from "reactstrap";
import { toast } from "react-toastify";
import SimpleBar from "simplebar-react";
import EventReward from "./EventReward";
import BuyLevelModal from "../Market/BuyLevelModal";
import RollerButton from "../SingleComponents/RollerButton";
import fetchWithToken from "../../services/fetchWithToken";

import "../../assets/scss/Game/SeasonRewards.scss";
import "simplebar-react/dist/simplebar.min.css";

import buyIcon from "../../assets/img/icon/buy_icon.svg";
import scrollToElement from "../../services/scrollToElement";

const renderToast = (text, icon) => (
	<div className="content-with-image">
		<img src={`/static/img/icon/${icon}.svg`} alt={icon} />
		<span>{text}</span>
	</div>
);

const rewardToastConstructor = (reward) => {
	if (reward.type === "money") {
		return `Reward ${reward.amount} ${reward.currency} successfully received`;
	}
	return `Reward ${reward.type} successfully received`;
};

const SeasonRewards = ({
	season,
	rewards,
	userStats,
	seasonLevelPassBuyConfig,
	isClaimedAllPassRewards,
	buyLevelHandler,
	isBuyProcessing,
	claimedRewards,
	toggleUpgradeModal,
	isDisabledUpgradeModal,
}) => {
	const { t } = useTranslation("Game");
	const isMobile = useSelector((state) => state.game.isMobile);
	const [isBuyLevelModalOpen, setIsBuyLevelModalOpen] = useState(false);
	const [isClaimProcessing, setIsClaimProcessing] = useState(false);
	const controllers = {};
	const signals = {};
	const scrollableNodeRef = useRef(null);

	useEffect(() => {
		if (userStats.user_level > 2 && !isClaimedAllPassRewards) {
			autoScroll();
		}
		return () => {
			Object.keys(controllers).forEach((key) => {
				if (controllers[key]) {
					controllers[key].abort();
				}
			});
		};
	}, []);

	const createSignalAndController = (id) => {
		if (controllers[id]) {
			controllers[id].abort();
		}
		controllers[id] = new AbortController();
		signals[id] = controllers[id].signal;
	};

	const postClaimRewards = async (e, reward = {}) => {
		e.stopPropagation();
		setIsClaimProcessing(true);
		const body = {
			is_claim_all: true,
		};
		if (reward?.rewardId) {
			body.is_claim_all = false;
			body.reward_id = reward.rewardId;
		}
		createSignalAndController("postClaimRewards");
		try {
			const json = await fetchWithToken("/api/season/claim-reward", {
				method: "POST",
				body: JSON.stringify(body),
				signal: signals.postClaimRewards,
			});

			if (!json.success) {
				toast(renderToast(json.error, "error_notice"));
				console.error(json.error);
				return false;
			}

			claimedRewards(reward?.rewardId, reward?.rewardType);
			if (body.is_claim_all) {
				return toast(renderToast("All rewards successfully received", "success_notice"));
			}
			toast(renderToast(rewardToastConstructor(reward), "success_notice"));
		} catch (err) {
			console.error(err);
		} finally {
			setIsClaimProcessing(false);
		}
	};

	const autoScroll = () => {
		if (isMobile) {
			scrollToElement(".event-shop-reward.current-level", -250);
		} else {
			const nestedScrollBox = scrollableNodeRef.current.getScrollElement();
			const mainScrollTarget = document.querySelector(".event-shop");
			if (mainScrollTarget) {
				const mainTargetElement = mainScrollTarget.getBoundingClientRect();
				const scrollTime = Math.abs(mainTargetElement.top) + 200;
				const scrollBounce = scrollTime > 600 ? 600 : scrollTime;
				window.scrollTo(0, mainTargetElement.top + window.scrollY - 60);
				setTimeout(() => {
					const scrollTarget = document.getElementById(`level_${userStats.user_level}`);
					if (scrollTarget) {
						const scrollTargetElement = scrollTarget.getBoundingClientRect();
						nestedScrollBox.scrollTo(0, nestedScrollBox.scrollTop - 435 - scrollTargetElement.height + scrollTargetElement.top);
					}
				}, scrollBounce);
			}
		}
	};

	const toggleBuyModal = () => setIsBuyLevelModalOpen(!isBuyLevelModalOpen);
	const isEveryOneReadyToClaim = rewards.some((reward) => Object.values(reward).some((item) => item.is_ready_to_claim));
	const buyLevelConstructor = () => {
		const result = {
			text: t("eventPass.activatePass"),
			action: toggleUpgradeModal,
		};

		if (isClaimedAllPassRewards) {
			result.text = t("eventPass.getAllRewardsAgain");
			result.action = toggleUpgradeModal;
		}

		if (!isClaimedAllPassRewards && seasonLevelPassBuyConfig) {
			result.text = t("eventPass.getAllRewards");
			result.action = toggleUpgradeModal;
		}

		return result;
	};

	return (
		<Fragment>
			<BuyLevelModal
				isOpen={isBuyLevelModalOpen}
				toggleModal={toggleBuyModal}
				userLevel={userStats.user_level}
				nextLevelPriceConfig={seasonLevelPassBuyConfig}
				buyLevelHandler={buyLevelHandler}
			/>

			<div className={`event-shop ${!isMobile ? "with-scroll" : ""}`}>
				{!isClaimedAllPassRewards && (
					<div className="event-shop-header">
						<div className="user-stats-wrapper">
							<Fragment>
								<div className={`user-stats-progress-block ${seasonLevelPassBuyConfig ? "with-button" : ""}`}>
									<div className="d-flex justify-content-between">
										<p className="user-level">{t("eventPass.level", { count: userStats.user_level })}</p>
										<p className="user-xp">
											XP: {userStats.xp} / {season.level_step}
										</p>
									</div>
									<div className="user-stats-progress-bar">
										<Progress value={(userStats.xp / season.level_step) * 100} className="user-progress-bar" />
									</div>
								</div>
								{seasonLevelPassBuyConfig && (
									<div className="user-stats-btn-block">
										<RollerButton
											className="user-stats-buy-level-btn"
											text={t("eventPass.buyLevel")}
											disabled={isBuyProcessing || userStats.is_max_xp}
											icon={buyIcon}
											color="cyan"
											action={() => toggleBuyModal()}
										/>
									</div>
								)}
							</Fragment>
						</div>
					</div>
				)}
				{!isClaimedAllPassRewards && isMobile && (
					<div className="mobile-claim-reward-block">
						<div className="claim-reward-block">
							<p className="claim-reward-text">
								You can <span>Claim</span> all available rewards for completing levels
							</p>
							<div className="claim-reward-btn-block">
								<RollerButton disabled={isClaimProcessing || !isEveryOneReadyToClaim} text="Claim All" color="cyan" action={(e) => postClaimRewards(e)} />
							</div>
						</div>
					</div>
				)}
				<Row className="activate-pass-btn-row">
					<Col className="activate-pass-btn-block" xs={isClaimedAllPassRewards ? 12 : 5}>
						<RollerButton
							className="activate-pass-btn"
							text={buyLevelConstructor().text}
							disabled={isBuyProcessing || isDisabledUpgradeModal}
							color="gold"
							action={() => buyLevelConstructor().action()}
						/>
					</Col>
				</Row>
				<Row className="header-reward-pass">
					<Col xs={5} className="header-name gold">
						<p>{t("eventPass.goldPass")}</p>
					</Col>
					<Col xs={{ size: 5, offset: 2 }} className="header-name cyan">
						<p>{t("eventPass.freePass")}</p>
					</Col>
				</Row>
				<SimpleBar className="rewards-simplebar" style={{ maxHeight: isMobile ? "auto" : 610 }} autoHide={false} ref={scrollableNodeRef}>
					<div className="rewards-block">
						{rewards.map((reward, index) => {
							return (
								<EventReward
									reward={reward}
									key={index}
									userLevel={userStats.user_level}
									isClaimedAllPassRewards={isClaimedAllPassRewards}
									postClaimRewards={postClaimRewards}
									isClaimProcessing={isClaimProcessing}
									seasonLevelPassBuyConfig={seasonLevelPassBuyConfig}
									t={t}
								/>
							);
						})}
					</div>
				</SimpleBar>
				{!isClaimedAllPassRewards && !isMobile && (
					<div className="claim-reward-block">
						<p className="claim-reward-text">
							You can <span>Claim</span> all available rewards for completing levels
						</p>
						<RollerButton disabled={isClaimProcessing || !isEveryOneReadyToClaim} text="Claim All" color="cyan" action={(e) => postClaimRewards(e)} />
					</div>
				)}
			</div>
		</Fragment>
	);
};

SeasonRewards.propTypes = {
	season: PropTypes.object.isRequired,
	rewards: PropTypes.object.isRequired,
	userStats: PropTypes.object.isRequired,
	isClaimedAllPassRewards: PropTypes.bool.isRequired,
	seasonLevelPassBuyConfig: PropTypes.object,
	buyLevelHandler: PropTypes.func.isRequired,
	isBuyProcessing: PropTypes.bool,
	seasonPassLevel: PropTypes.string,
	claimedRewards: PropTypes.func.isRequired,
	toggleUpgradeModal: PropTypes.func.isRequired,
	isDisabledUpgradeModal: PropTypes.bool.isRequired,
};

export default SeasonRewards;
