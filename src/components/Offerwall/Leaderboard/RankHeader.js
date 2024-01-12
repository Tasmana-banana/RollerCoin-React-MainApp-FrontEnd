import React, { Fragment, useState, useEffect } from "react";
import PropTypes from "prop-types";
import LazyLoad from "react-lazyload";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Row, Col } from "reactstrap";
import { LazyLoadImage } from "react-lazy-load-image-component";
import ModalPoolRewardInfo from "./ModalPoolRewardInfo";
import RankHeaderCard from "./RankHeaderCard";
import getCurrencyConfig from "../../../services/getCurrencyConfig";
import decimalAdjust from "../../../services/decimalAdjust";
import fetchWithToken from "../../../services/fetchWithToken";
import onErrorLoadAvatar from "../../../services/onErrorLoadAvatar";
import getLanguagePrefix from "../../../services/getLanguagePrefix";
import numberToString from "../../../services/numberToString";
import { CONTEST_TYPE } from "../../../constants/Offerwall";

import leaderboardIcon from "../../../assets/img/offerwall/leaderboard_icon.svg";

const RankHeader = ({ contests, sponsoredProviders, activeTab, userBlock = false }) => {
	const language = useSelector((state) => state.game.language);
	const [currentUserRank, setCurrentUserRank] = useState({ [CONTEST_TYPE.WEEKLY]: {}, [CONTEST_TYPE.GRAND]: {} });
	const [isLoading, setIsLoading] = useState(false);
	const [isOpenModal, setIsOpenModal] = useState(false);
	const signals = {};
	const controllers = {};
	const { t } = useTranslation("Offerwall");

	useEffect(async () => {
		if (userBlock) {
			await getCurrentUserRank();
		}
		return () => {
			Object.keys(controllers).forEach((key) => {
				if (controllers[key]) {
					controllers[key].abort();
				}
			});
		};
	}, []);

	// Competitions sponsored by:
	const createSignalAndController = (id) => {
		if (controllers[id]) {
			controllers[id].abort();
		}
		controllers[id] = new AbortController();
		signals[id] = controllers[id].signal;
	};

	const fetchRun = async (contestId) => {
		const key = `getContestRank_${contestId}`;
		createSignalAndController(key);
		const apiUrl = `/api/offerwall/active-contest-rank?contest_id=${contestId}&only_current_user=true&limit=1`;
		const json = await fetchWithToken(apiUrl, {
			method: "GET",
			signal: signals[key],
		});
		if (!json.success) {
			console.error(json.error);
			return {};
		}
		return json.data;
	};

	const getCurrentUserRank = async () => {
		setIsLoading(true);
		try {
			const contestsIds = Object.keys(contests).map((key) => ({ contestId: contests[key].id, type: key }));

			const result = await Promise.all(
				contestsIds.map(async (item) => {
					const rankData = await fetchRun(item.contestId);
					return [item.type, rankData];
				})
			);
			setCurrentUserRank({ ...Object.fromEntries(result) });
		} catch (err) {
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	const toggleModalPoolReward = () => {
		setIsOpenModal(!isOpenModal);
	};

	const motivationalTextConstructor = (isWeeklyAndGrandActive) => {
		const isOnlyWeeklyActive = contests?.[CONTEST_TYPE.WEEKLY]?.isActive && !contests?.[CONTEST_TYPE.GRAND]?.isActive;
		const isOnlyGrandActive = contests?.[CONTEST_TYPE.GRAND]?.isActive && !contests?.[CONTEST_TYPE.WEEKLY]?.isActive;
		const currencyConfigGrand = getCurrencyConfig(contests?.[CONTEST_TYPE.GRAND]?.reward.currency);
		const currencyConfigWeekly = getCurrencyConfig(contests?.[CONTEST_TYPE.WEEKLY]?.reward.currency);

		if (isWeeklyAndGrandActive) {
			return `${t("rankHeader.motivationalText.completeTasks")} <span>${decimalAdjust(
				contests[CONTEST_TYPE.WEEKLY].poolReward[0].amount / currencyConfigWeekly.toSmall,
				currencyConfigWeekly.precision
			)} ${currencyConfigWeekly.name}</span> ${t("rankHeader.motivationalText.weeklyAndGrand")} <span>${decimalAdjust(
				contests[CONTEST_TYPE.GRAND].poolReward[0].amount / currencyConfigGrand.toSmall,
				currencyConfigGrand.precision
			)} ${currencyConfigGrand.name}</span> ${t("rankHeader.motivationalText.everyFourWeeks")}`;
		}
		if (!isWeeklyAndGrandActive && isOnlyWeeklyActive) {
			return `${t("rankHeader.motivationalText.completeTasks")} <span>${decimalAdjust(
				contests[CONTEST_TYPE.WEEKLY].poolReward[0].amount / currencyConfigWeekly.toSmall,
				currencyConfigWeekly.precision
			)} ${currencyConfigWeekly.name}</span> ${t("rankHeader.motivationalText.weekly")}`;
		}
		if (!isWeeklyAndGrandActive && isOnlyGrandActive) {
			return `${t("rankHeader.motivationalText.completeTasks")} <span>${decimalAdjust(
				contests[CONTEST_TYPE.GRAND].poolReward[0].amount / currencyConfigGrand.toSmall,
				currencyConfigGrand.precision
			)} ${currencyConfigGrand.name}</span> ${t("rankHeader.motivationalText.everyFourWeeks")}`;
		}
	};

	const isWeeklyAndGrandActive = contests?.[CONTEST_TYPE.WEEKLY]?.isActive && contests?.[CONTEST_TYPE.GRAND]?.isActive;
	const isEveryOneContestActive = contests?.[CONTEST_TYPE.WEEKLY]?.isActive || contests?.[CONTEST_TYPE.GRAND]?.isActive;
	const isCurrentUserInactiveRating = !currentUserRank[CONTEST_TYPE.WEEKLY]?.currentUser?.position && !currentUserRank[CONTEST_TYPE.GRAND]?.currentUser?.position;
	return (
		<Fragment>
			{isOpenModal && (
				<ModalPoolRewardInfo
					openModal={isOpenModal}
					poolReward={contests?.[activeTab].poolReward}
					activeTab={activeTab}
					toggleModal={toggleModalPoolReward}
					currency={contests?.[activeTab].reward.currency}
				/>
			)}

			<Row className="rank-header-row">
				{!userBlock && (
					<Col lg={12} className="rank-header-col">
						<RankHeaderCard contest={contests[activeTab]} toggleModalPoolReward={toggleModalPoolReward} activeTab={activeTab} />
					</Col>
				)}
				{userBlock &&
					Object.keys(contests).map((key) => {
						const currencyConfig = getCurrencyConfig(contests[key].reward.currency);
						return (
							<Col key={contests[key].id} lg={isWeeklyAndGrandActive ? 6 : 12} xs={isWeeklyAndGrandActive ? 11 : 12}>
								{contests[key].isActive && (
									<RankHeaderCard contest={contests[key]} isWeeklyAndGrandActive={isWeeklyAndGrandActive} toggleModalPoolReward={toggleModalPoolReward} activeTab={key} />
								)}
								{userBlock && contests[key].isActive && (
									<div className="rank-content only-user-block">
										{!isLoading && !!Object.keys(currentUserRank[key]).length && currentUserRank[key].currentUser.position && (
											<Fragment>
												<div className="rank-table">
													<div className={`rank-item currentUser ${isWeeklyAndGrandActive ? "" : "only-one-block"}`}>
														<div className="td-block user-position-block">
															<span className="user-position">{currentUserRank[key].currentUser.position}</span>
														</div>

														<div className="td-block user-info-block">
															<div className="user-img-container user-rank-img">
																<div className={currentUserRank[key].currentUser.avatar_type === "nft" ? "mask-hexagon" : "mask-circle"}>
																	<LazyLoad>
																		<img
																			src={`${process.env.AVATARS_STATIC_URL}/static/avatars/thumbnails/48/${currentUserRank[key].currentUser.user_id}.png?v=1.1.1`}
																			alt="ico"
																			width="48"
																			height="48"
																			className="avatar-icon"
																			onError={onErrorLoadAvatar}
																		/>
																	</LazyLoad>
																</div>
															</div>
															<p className="user-name-text">{currentUserRank[key].currentUser.full_name}</p>
														</div>
														<div className="td-block contest-tasks-block">
															<p className="text-tasks">x{currentUserRank[key].currentUser.count_completed_tasks}</p>
														</div>
														<div className="td-block contest-points-block">
															<p className="text-points">
																{currentUserRank[key]?.currentUser.count_points ? numberToString(currentUserRank[key].currentUser.count_points) : 0}
															</p>
														</div>
														<div className="td-block prize-block">
															<div className="prize-icon-block">
																<img className="prize-icon" src={`/static/img/wallet/${currencyConfig.img}.svg?v=1.13`} width={17} height={17} alt="Currency icon" />
															</div>
															<div className="prize-text">
																<span>
																	{currentUserRank[key]?.currentUser?.reward?.amount
																		? decimalAdjust(currentUserRank[key].currentUser.reward.amount / currencyConfig.toSmall, currencyConfig.precision)
																		: 0}
																</span>
															</div>
														</div>
													</div>
												</div>
												{!isWeeklyAndGrandActive && isEveryOneContestActive && (
													<Link className="rank-button" to={`${getLanguagePrefix(language)}/taskwall/leaderboard/${key}`}>
														<img src={leaderboardIcon} alt="leaderboard icon" width={22} height={17} />
														<p>{t("seeLeaderboard")}</p>
													</Link>
												)}
											</Fragment>
										)}
									</div>
								)}
							</Col>
						);
					})}
			</Row>
			{!!sponsoredProviders && !!sponsoredProviders.length && (
				<Row>
					<Col lg={12}>
						<div className={`rank-header-sponsored-block ${!isWeeklyAndGrandActive && isEveryOneContestActive ? "" : "with-padding"}`}>
							<p className="sponsored-provider-text">{t("rankHeader.sponsored")}: </p>
							<div className="sponsored-provider-img-block">
								{sponsoredProviders.map((provider) => (
									<div key={provider} className="sponsored-provider-img-wrapper">
										<LazyLoadImage
											key={provider}
											className="sponsored-provider-img"
											src={`${process.env.STATIC_URL}/static/img/offerwalls/providers/sponsored/${provider}.png?v=1.0.1`}
											alt={provider}
											threshold={100}
										/>
									</div>
								))}
							</div>
						</div>
					</Col>
				</Row>
			)}
			{isEveryOneContestActive && isCurrentUserInactiveRating && userBlock && (
				<Row>
					<Col lg={12}>
						<div className="contest-motivational-block">
							<p className="contest-motivational-text" dangerouslySetInnerHTML={{ __html: motivationalTextConstructor(isWeeklyAndGrandActive) }} />
						</div>
					</Col>
				</Row>
			)}
		</Fragment>
	);
};

RankHeader.propTypes = {
	contests: PropTypes.object.isRequired,
	sponsoredProviders: PropTypes.array.isRequired,
	activeTab: PropTypes.string,
	userBlock: PropTypes.bool,
};
export default RankHeader;
