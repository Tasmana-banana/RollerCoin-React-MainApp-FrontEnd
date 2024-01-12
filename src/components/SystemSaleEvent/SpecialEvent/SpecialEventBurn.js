import React, { useState, useEffect, Fragment } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Row, Col } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import SpecialEventProductCard from "./SpecialEventProductCard";
import SpecialAnimationBlock from "./SpecialAnimationBlock";
import EventTimer from "../../SingleComponents/EventTimer";
import RollerButton from "../../SingleComponents/RollerButton";
import ReplenishmentModal from "../../BuyRLTModal/ReplenishmentModal";
import getCurrencyConfig from "../../../services/getCurrencyConfig";
import decimalAdjust from "../../../services/decimalAdjust";
import fetchWithToken from "../../../services/fetchWithToken";
import { setRefreshBalance } from "../../../actions/wallet";
import { setReplenishmentModalStats } from "../../../actions/game";
import { BLOCK_TYPES, ANIMATION_TYPE, ITEMS_TYPES_IS_MULTIPLE } from "../../../constants/SystemSaleEvent";

import "../../../assets/scss/SystemSaleEvent/SpecialEventBurn.scss";
import "../../../assets/scss/ProgressionEvent/ProgressionEventTaskToast.scss";

import greyFireIcon from "../../../assets/img/system_sale_event/icon/black_fire.svg";
import blackFireIcon from "../../../assets/img/system_sale_event/icon/fire_black.svg";
import loaderImg from "../../../assets/img/loader_sandglass.gif";
import fireIcon from "../../../assets/img/system_sale_event/icon/fire.svg";
import errorNotice from "../../../assets/img/icon/error_notice.svg";

const renderErrorToast = (text, icon) => (
	<div className="content-with-image">
		<img src={icon} alt="Toast icon" />
		<span>{text}</span>
	</div>
);

const renderToastReward = (img, points, text) => (
	<div className="progression-task-toast">
		<div className="progression-toast-img-wrapper">
			<img className="progression-toast-img" src={img} width="40" height="40" alt="progression event multiplier" />
		</div>
		<div className="progression-toast-description">
			<p className="progression-toast-text">
				{points} {text}
			</p>
		</div>
	</div>
);
const renderToast = (icon, text) => (
	<div className="toast-with-image">
		<img className="special-toast-img" src={icon} alt="Toast icon" />
		<span className="special-toast-text">{text}</span>
	</div>
);
const SpecialEventBurn = ({
	isLoadingBurn,
	eventConfig,
	burningItems,
	handleControlBurningItems,
	totalRewardCount,
	handleStartBurnProcessing,
	processingData,
	handleCancelBurnItems,
	setProcessingData,
	needToRefreshUserActiveEvent,
	wsReact,
}) => {
	const dispatch = useDispatch();
	const { t } = useTranslation("SystemSaleEvent");
	const [burningSlots, setBurningSlots] = useState([]);
	const [itemsProcessingTime, setItemsProcessingTime] = useState({ toDate: dayjs().toString(), startDate: dayjs().toString() });
	const [isStartingProcessingTimer, setIsStartingProcessingTimer] = useState(false);
	const [isStartAnimation, setIsStartAnimation] = useState(false);
	const [isAnimationComplete, setIsAnimationComplete] = useState(false);
	const [animationType, setAnimationType] = useState("");
	const [isProcessingLoading, setIsProcessingLoading] = useState(false);
	const [isLittleEventTime, setIsLittleEventTime] = useState(false);
	const [totalProcessingTimeMs, setTotalProcessingTimeMs] = useState(0);
	const [isRewardClaimed, setIsRewardClaimer] = useState(false);
	const { language, isMobile, balance, replenishmentModalStats } = useSelector((state) => state.game);
	const controllers = {};
	const signals = {};

	useEffect(() => {
		getBurningSlots();
	}, [burningItems]);

	useEffect(() => {
		getProcessingData();
	}, [processingData]);

	useEffect(() => {
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
	const getBurningSlots = () => {
		const newBurningSlots = [...burningItems];
		const burnSlotIsNeedAdded = eventConfig.slots - newBurningSlots.length;
		for (let i = 0; i < burnSlotIsNeedAdded; i++) {
			newBurningSlots.push({});
		}
		setBurningSlots(newBurningSlots);
		getProcessingTime();
	};

	const getProcessingData = () => {
		if (processingData?.processing_time_ms) {
			const toDate = dayjs(processingData.processing_date_to).toString();
			const startDate = dayjs(toDate).subtract(processingData.processing_time_ms, "millisecond").toString();
			setItemsProcessingTime({ toDate, startDate });
			setAnimationType(ANIMATION_TYPE.START_BURN);
			setIsStartAnimation(true);
			setIsAnimationComplete(true);
			setIsStartingProcessingTimer(true);
			getProcessingTime(true, processingData.processing_date_to, startDate);
		}
		return false;
	};

	const handleIsLittleEventTime = (eventEndTime, processingEndTime = dayjs().add(totalProcessingTimeMs, "millisecond").toString()) => {
		if (new Date(eventEndTime) < new Date(processingEndTime)) {
			setIsLittleEventTime(true);
		} else if (new Date(eventEndTime) > new Date(processingEndTime) && isLittleEventTime) {
			setIsLittleEventTime(false);
		}
	};

	const getProcessingTime = (isStartTimer = false, processingDateTo = null, startDate = null) => {
		if (!processingDateTo) {
			const totalProcessingTime = burningItems.reduce((accum, currentValue) => {
				return accum + currentValue.processing_time_ms;
			}, 0);
			if (isStartTimer) {
				setIsStartingProcessingTimer(true);
			}
			const startProcessingTime = dayjs()
				.add(totalProcessingTime + eventConfig.default_processing_time_ms, "millisecond")
				.toString();

			handleIsLittleEventTime(eventConfig.end_date, startProcessingTime);
			setTotalProcessingTimeMs(totalProcessingTime + eventConfig.default_processing_time_ms);
			return setItemsProcessingTime({ toDate: startProcessingTime, startDate: dayjs().toString() });
		}

		handleIsLittleEventTime(eventConfig.end_date, processingDateTo);
		setTotalProcessingTimeMs(dayjs().add(eventConfig.default_processing_time_ms, "millisecond").toString());
		setItemsProcessingTime({ toDate: processingDateTo, startDate: startDate || dayjs().toString() });
	};

	const handleChangeAnimationType = () => {
		setAnimationType(ANIMATION_TYPE.COMPLETE_BURN);
	};

	const postStartBurning = async () => {
		createSignalAndController("postStartBurning");
		setIsProcessingLoading(true);
		const itemMap = new Map();
		burningItems.forEach((item) => {
			let key = item.user_item_id;
			if (ITEMS_TYPES_IS_MULTIPLE[item.item_type]) {
				key = `${item.item_type}-${item.item_id}`;
			}

			if (itemMap.has(key)) {
				itemMap.get(key).count += 1;
			} else {
				itemMap.set(key, { item_type: item.item_type, item_id: item.item_id, count: 1 });
			}
		});

		const resultArray = Array.from(itemMap.values());
		try {
			const body = {
				items: resultArray,
			};
			const json = await fetchWithToken(`/api/system-sales-events/sell`, {
				method: "POST",
				body: JSON.stringify(body),
				signal: signals.postStartBurning,
			});

			if (!json.success) {
				return toast(renderErrorToast(json.error, errorNotice));
			}
			setProcessingData(json.data, json.data.reward.amount);
			handleStartBurnProcessing();
			setAnimationType(ANIMATION_TYPE.START_BURN);
			getProcessingTime(true, json.data.processing_date_to);
			setIsAnimationComplete(false);
			setIsStartAnimation(true);
		} catch (err) {
			console.error(err);
		} finally {
			setIsProcessingLoading(false);
		}
	};

	const postSpeedUp = async () => {
		setIsProcessingLoading(true);
		createSignalAndController("postSpeedUp");
		try {
			const json = await fetchWithToken("/api/system-sales-events/speedup", {
				method: "POST",
				body: JSON.stringify({ user_system_sale_event_id: processingData.user_system_sale_event_id }),
				signal: signals.postSpeedUp,
			});

			if (!json.success) {
				return toast(renderErrorToast(json.error, errorNotice));
			}

			toast(renderToast(fireIcon, t("specialEventBurn.successfullyBurning")), {
				className: "special-event-toast-container",
				position: "top-left",
				autoClose: 4000,
				hideProgressBar: true,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
			});

			const currentRewardCurrencyConfig = getCurrencyConfig(json.data.currency);
			toast(
				renderToastReward(
					`/static/img/wallet/${currentRewardCurrencyConfig.img}.svg`,
					`+${decimalAdjust(json.data.amount / currentRewardCurrencyConfig.toSmall, currentRewardCurrencyConfig.precision)}`,
					"Event Coins"
				),
				{
					className: "progression-task-toast-container",
					position: "top-left",
					autoClose: 4000,
					hideProgressBar: true,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
				}
			);
			dispatch(setRefreshBalance(true));
			setAnimationType(ANIMATION_TYPE.CLAIM_REWARD);
			setIsAnimationComplete(false);
			setIsStartAnimation(true);
			setIsRewardClaimer(false);
			setProcessingData({ user_system_sale_event_id: "", processing_time_ms: 0, processing_date_to: null, reward: { currency: "ECOIN", amount: 0 } }, 0);
		} catch (err) {
			console.error(err);
		} finally {
			setIsProcessingLoading(false);
		}
	};

	const postClaimReward = async () => {
		setIsProcessingLoading(true);
		createSignalAndController("postClaimReward");
		try {
			const json = await fetchWithToken("/api/system-sales-events/claim", {
				method: "POST",
				body: JSON.stringify({ user_system_sale_event_id: processingData.user_system_sale_event_id }),
				signal: signals.postClaimReward,
			});

			if (!json.success) {
				return toast(renderErrorToast(json.error, errorNotice));
			}
			const currentRewardCurrencyConfig = getCurrencyConfig(json.data.currency);
			toast(
				renderToastReward(
					`/static/img/wallet/${currentRewardCurrencyConfig.img}.svg`,
					`+${decimalAdjust(json.data.amount / currentRewardCurrencyConfig.toSmall, currentRewardCurrencyConfig.precision)}`,
					"Event Coins"
				),
				{
					className: "progression-task-toast-container",
					position: "top-left",
					autoClose: 4000,
					hideProgressBar: true,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
				}
			);
			dispatch(setRefreshBalance(true));
			setAnimationType(ANIMATION_TYPE.CLAIM_REWARD);
			setIsAnimationComplete(false);
			setIsStartAnimation(true);
			setIsRewardClaimer(false);
			setProcessingData({ user_system_sale_event_id: "", processing_time_ms: 0, processing_date_to: null, reward: { currency: "ECOIN", amount: 0 } }, 0);
		} catch (err) {
			console.error(err);
		} finally {
			setIsProcessingLoading(false);
		}
	};

	const handleCompleteAnimation = () => {
		if (animationType !== ANIMATION_TYPE.CLAIM_REWARD && isStartAnimation) {
			return setIsAnimationComplete(true);
		}
		setAnimationType("");
		setIsStartAnimation(false);
		setIsRewardClaimer(true);
		setIsStartingProcessingTimer(false);
		setIsAnimationComplete(false);
		handleControlBurningItems([]);
		handleStartBurnProcessing(false);
	};

	const handleControlToBurn = (item) => {
		const newBurningItems = burningItems.filter((elem) => elem.user_item_id !== item.user_item_id);
		handleControlBurningItems(newBurningItems, item.user_item_id);
	};

	const currentCurrencyConfig = getCurrencyConfig(processingData?.reward?.currency || eventConfig.reward_currency);
	const speedupCurrencyConfig = getCurrencyConfig(processingData?.speedup_price?.currency || eventConfig?.speedup_price?.currency);
	const speedupPrice = processingData?.speedup_price?.amount || eventConfig?.speedup_price?.amount;
	const ecoinBalance = balance?.ecoin || 0;
	const isUserHaveSpeedupMoney = speedupPrice <= +balance[speedupCurrencyConfig.code];

	const handleReplenishModal = () => {
		dispatch(setReplenishmentModalStats({ ...replenishmentModalStats, isOpen: true, itemName: "Speed up Burning", quantity: 1, price: speedupPrice }));
	};

	return (
		<Fragment>
			<div className={`special-timer-block ${isLittleEventTime ? "little-time-left" : ""}`}>
				<EventTimer toDate={eventConfig.end_date} timerText={t("specialEventBurn.timerText")} handleIsLittleLeftTime={handleIsLittleEventTime} />
			</div>

			<div className="special-burn-wrapper">
				<div className="special-burn-header">
					<h2 className="special-burn-title">{t("specialEventBurn.title")}</h2>
					<div className="special-total-coin-block">
						<img className="special-total-coin-icon" src={`/static/img/wallet/${currentCurrencyConfig.img}.svg?v=1.13`} alt="Ecoin icon" width={16} height={17} />
						<span className="special-total-coin">{decimalAdjust(ecoinBalance / currentCurrencyConfig.toSmall, currentCurrencyConfig.precision)}</span>
					</div>
				</div>
				<div className="special-info-block" dangerouslySetInnerHTML={{ __html: eventConfig.description[language] || eventConfig.description.en }} />
				{isLoadingBurn && (
					<div className="special-burn-loading-wrapper">
						<img src={loaderImg} height="126" width="126" className="loader-img" alt="preloader" />
					</div>
				)}

				{!isLoadingBurn && (
					<Fragment>
						<div
							className={`special-burn-items-block ${isStartAnimation && animationType !== ANIMATION_TYPE.CLAIM_REWARD ? "special-animation" : ""} ${
								isRewardClaimed ? "special-animation-reward" : ""
							}`}
						>
							{!isStartAnimation && (
								<Row className="special-burn-products">
									{burningSlots.map((item, index) => {
										const isEmptyStot = !item?.item_id;
										const key = item?.user_item_id || index;
										return (
											<Fragment key={key}>
												{isEmptyStot && (
													<Col xs={6} lg={4} className="special-burn-item">
														<div className="special-burn-card">
															<img src={greyFireIcon} alt="Black fire icon" />
														</div>
													</Col>
												)}
												{!isEmptyStot && <SpecialEventProductCard item={item} itemType={"miner"} blockType={BLOCK_TYPES.BURN} handleControlToBurn={handleControlToBurn} />}
											</Fragment>
										);
									})}
								</Row>
							)}
							{isStartAnimation && (
								<SpecialAnimationBlock
									animationType={animationType}
									handleCompleteAnimation={handleCompleteAnimation}
									isAnimationComplete={isAnimationComplete}
									eventFiles={eventConfig.files}
									animationSettings={eventConfig.animation_settings}
									imgVer={new Date(eventConfig.last_update).getTime()}
								/>
							)}
						</div>

						<div className="special-burn-action-block">
							{["", ANIMATION_TYPE.START_BURN].includes(animationType) && (
								<div className="special-profit-block">
									<span className="special-profit-text">{t("specialEvent.exchangeProfit")}</span>
									<div className="special-profit-count-block">
										<img
											className="special-profit-img"
											src={`${eventConfig.files.reward_icon}?v=${new Date(eventConfig.last_update).getTime()}`}
											alt="Reward icon"
											width={16}
											height={16}
										/>
										<img className="special-profit-count-img" src={`/static/img/wallet/${currentCurrencyConfig.img}.svg?v=1.13`} alt="Ecoin icon" width={16} height={16} />
										<span className="special-profit-count">+ {decimalAdjust(totalRewardCount / currentCurrencyConfig.toSmall, currentCurrencyConfig.precision)}</span>
									</div>
								</div>
							)}
							{["", ANIMATION_TYPE.START_BURN].includes(animationType) && (
								<div className="special-processing-timer">
									<EventTimer
										toDate={itemsProcessingTime.toDate}
										minWidth={100}
										isStartTimer={isStartingProcessingTimer}
										isShowSeconds={true}
										startDate={itemsProcessingTime.startDate}
										handleChangeAnimationType={handleChangeAnimationType}
										needToFetch={needToRefreshUserActiveEvent}
									/>
								</div>
							)}
							{!isStartAnimation && (
								<Fragment>
									<div className="special-burn-button-block">
										<RollerButton
											icon={blackFireIcon}
											text={t("specialEventBurn.btnStart")}
											disabled={!burningItems.length || isProcessingLoading}
											color="cyan"
											className="special-burn-btn"
											isLoading={isProcessingLoading}
											action={postStartBurning}
										/>
										{isMobile && <RollerButton className="special-burn-btn-cancel" text={t("specialEventBurn.cancelBtnText")} action={handleCancelBurnItems} />}
									</div>
									<div className="special-burn-action-text">{t("specialEventBurn.actionText")}</div>
								</Fragment>
							)}
							{isStartAnimation && (
								<>
									{animationType === ANIMATION_TYPE.START_BURN && speedupPrice && (
										<div className="special-speedup-block">
											<span className="special-speedup-text">{t("specialEventBurn.speedUpText")}</span>
											<RollerButton
												icon={`/static/img/wallet/${speedupCurrencyConfig.img}.svg`}
												color="cyan"
												text={`${decimalAdjust(speedupPrice / speedupCurrencyConfig.toSmall, speedupCurrencyConfig.precision)} ${speedupCurrencyConfig.name}`}
												action={isUserHaveSpeedupMoney ? postSpeedUp : handleReplenishModal}
												disabled={isProcessingLoading}
												isLoading={isProcessingLoading}
											/>
										</div>
									)}
									{animationType === ANIMATION_TYPE.COMPLETE_BURN && (
										<div className="special-claimreward-block">
											<div className="special-claimreward-profit-block">
												<span className="profit-text">{t("specialEventBurn.youProfit")}</span>
												<div className="special-profit-count-block">
													<img
														className="special-profit-count-img"
														src={`/static/img/wallet/${currentCurrencyConfig.img}.svg?v=1.13`}
														alt="Ecoin icon"
														width={24}
														height={24}
													/>
													<span className="special-profit-count">+ {decimalAdjust(totalRewardCount / currentCurrencyConfig.toSmall, currentCurrencyConfig.precision)}</span>
												</div>
											</div>
											<RollerButton
												color="cyan"
												text={t("specialEventBurn.claimReward")}
												isLoading={isProcessingLoading}
												disabled={isProcessingLoading}
												action={postClaimReward}
											/>
										</div>
									)}
								</>
							)}
						</div>
					</Fragment>
				)}
			</div>
			{replenishmentModalStats.isOpen && <ReplenishmentModal wsReact={wsReact} />}
		</Fragment>
	);
};

SpecialEventBurn.propTypes = {
	isLoadingBurn: PropTypes.bool.isRequired,
	eventConfig: PropTypes.object.isRequired,
	burningItems: PropTypes.array.isRequired,
	handleControlBurningItems: PropTypes.func.isRequired,
	totalRewardCount: PropTypes.number.isRequired,
	handleStartBurnProcessing: PropTypes.func.isRequired,
	processingData: PropTypes.object.isRequired,
	handleCancelBurnItems: PropTypes.func.isRequired,
	setProcessingData: PropTypes.func.isRequired,
	needToRefreshUserActiveEvent: PropTypes.func.isRequired,
	wsReact: PropTypes.object.isRequired,
};

export default SpecialEventBurn;
