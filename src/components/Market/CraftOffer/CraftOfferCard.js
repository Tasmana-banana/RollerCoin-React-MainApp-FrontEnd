import React, { Fragment, useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { Col, Row } from "reactstrap";
import dayjs from "dayjs";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import MinerRatingStar from "../../SingleComponents/MinerRatingStar";
import RollerButton from "../../SingleComponents/RollerButton";
import { RARITY_DATA_BY_LEVEL } from "../../../constants/Storage";
import decimalAdjust from "../../../services/decimalAdjust";
import getPrefixPower from "../../../services/getPrefixPower";
import { initTimer, makeCounterData } from "../../../services/countdownТimer";
import getCurrencyConfig from "../../Marketplace/helpers/getCurrencyConfig";

import craftTimerIcon from "../../../assets/img/market/crafting_timer_icon.svg";
import craftOfferBtnIcon from "../../../assets/img/market/crafting_offer_btn_icon.svg";
import craftOfferBtnClaimIcon from "../../../assets/img/market/crafting_claim_icon.svg";

import "../../../assets/scss/Market/MarketCraftOffer/MarketCraftOfferCard.scss";
import minerStarImg from "../../../assets/img/storage/level_star.png";

const imgSrc = (type, id, imgVer) => {
	let src = "";
	switch (type) {
		case "miners":
			src = `${process.env.STATIC_URL}/static/img/market/miners/${id}.gif?v=${imgVer}`;
			break;
		case "mutation_components":
			src = `${process.env.STATIC_URL}/static/img/storage/mutation_components/${id}.png?v=1.0.1`;
			break;
		case "racks":
			src = `${process.env.STATIC_URL}/static/img/market/racks/${id}.png?v=1.0.1`;
			break;
		case "batteries":
			src = `${process.env.STATIC_URL}/static/img/market/batteries/${id}.png?v=1.0.1`;
			break;
		default:
			src = "";
	}
	return src;
};

const ITEM_IMAGE_SIZE = {
	miners: { width: 150, height: 189 },
	mutation_components: { width: 96, height: 96 },
	racks: { width: 150, height: 189 },
	batteries: { width: 150, height: 189 },
};

const getMinersIdToMoveFromRack = (miners) => {
	if (!miners.length) {
		return [];
	}
	return miners.reduce((acc, minerInfo) => {
		const minersOnRacks = minerInfo.user_items.filter((userItem) => !userItem.is_in_inventory).map(({ id }) => id);
		const countMinersInInventory = minerInfo.user_items.length - minersOnRacks.length;
		if (minerInfo.count > countMinersInInventory && minerInfo.user_count >= minerInfo.count) {
			acc.push(...minersOnRacks.slice(countMinersInInventory - minerInfo.count));
		}
		return acc;
	}, []);
};

const CraftOfferCard = ({ item, craftRecipe, claimRecipe, getCraftOffers, isOnlyOne }) => {
	const { t } = useTranslation("Game");
	const language = useSelector((state) => state.game.language);
	const balance = useSelector((state) => state.game.balance);
	const [confirmationId, setConfirmationId] = useState("");
	const [confirmationType, setConfirmationType] = useState("");
	const [viewTime, setViewTime] = useState({
		days: "",
		hours: "0H",
		minutes: "00M",
		seconds: "",
	});
	const [timeOver, setTimeOver] = useState([]);
	const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
	const [timeTotalSeconds, setTimeTotalSeconds] = useState(0);
	const [timerBg, setTimerBg] = useState(0);
	const controllers = {};
	const timer = useRef(null);

	useEffect(async () => {
		clearInterval(timer.current);

		if (item.progress.time_left > 0 && !item.progress.is_in_progress) {
			const time = await makeCounterData(initTimer(dayjs().add(item.progress.time_left, "ms")));
			setViewTime({
				days: time.days,
				hours: time.hours,
				minutes: time.minutes,
				seconds: time.seconds,
			});
			setTimeOver([...timeOver, item._id]);
		}

		if (item.progress.time_left > 0 && item.progress.is_in_progress) {
			setTimeOver([...timeOver, item._id]);
			startTimer(dayjs().add(item.progress.time_left, "ms"), dayjs().add(item.progress.total_time, "ms"));
		}
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
	}, [item.progress.is_in_progress]);

	useEffect(async () => {
		if (timeLeftSeconds < 0) {
			clearInterval(timer.current);
			setTimeOver(timeOver.filter((id) => id !== item._id));
			return false;
		}
		const time = makeCounterData(timeLeftSeconds);

		if (viewTime.hours > time.hours) {
			await getCraftOffers();
		}
		setViewTime({
			days: time.days,
			hours: time.hours,
			minutes: time.minutes,
			seconds: time.seconds,
		});

		if (timeTotalSeconds) {
			const timerWidth = 100 - (timeLeftSeconds / timeTotalSeconds) * 100;
			if (timerWidth > timerBg) {
				setTimerBg(timerWidth);
			}
		}
	}, [timeLeftSeconds]);

	const craftRecipeHandler = (id, minersToMoveIds = []) => {
		confirmationHandler("");
		craftRecipe(id, minersToMoveIds);
	};

	const claimRecipeHandler = async (mutationId, offerId, isFree = false) => {
		confirmationHandler("");
		await claimRecipe({ mutationId, offerId, isFree });
		setTimerBg(0);
	};

	const startTimer = (leftDate, totalDate) => {
		if (timer.current) {
			clearInterval(timer.current);
		}
		setTimeLeftSeconds(initTimer(leftDate));
		setTimeTotalSeconds(initTimer(totalDate));
		timer.current = setInterval(() => {
			setTimeLeftSeconds((prev) => prev - 1);
		}, 1000);
	};

	const confirmationHandler = (id, actionType) => {
		setConfirmationId(id || "");
		setConfirmationType(actionType || "false");
	};

	const isCanBeClaimed = item.progress.is_in_progress;
	const isSpeedUp = item.progress.is_in_progress && item.progress.time_left > 0;
	const currency = (!isSpeedUp && getCurrencyConfig(item.currency)) || (isSpeedUp && getCurrencyConfig(item.progress.speedup_currency));
	const isTimer = timeOver.includes(item._id);
	const isEnoughFunds = (!isCanBeClaimed && balance[currency.code] < item.price) || (isCanBeClaimed && isTimer && balance[currency.code] < item.progress.speedup_price);
	const claimText = isTimer ? t("market.craftingOffer.claimNow") : t("market.craftingOffer.claim");
	const minersIdToMoveFromRack = getMinersIdToMoveFromRack(item.required_items.filter(({ type }) => type === "miners"));

	return (
		<Col xs={12} lg={{ offset: isOnlyOne ? 4 : 0, size: 4 }} key={item._id} className="crafting-card-container">
			<div className="card-wrapper">
				<div className="item-title">
					<span className="item-title">{item.result.name[language] || item.result.name.en}</span>
				</div>
				<div className="item-power">
					<span>
						{item.result.type === "miners" && `${getPrefixPower(item.result.power).power} ${getPrefixPower(item.result.power).hashDetail}`}
						{item.result.type === "mutation_components" && RARITY_DATA_BY_LEVEL[item.result.level].title}
						{item.result.type === "racks" && <br></br>}
					</span>
				</div>
				{item.result.type === "miners" && (
					<div className="crafting-status-of-sell">
						{item.result?.is_can_be_sold_on_mp ? <p className="text positive">{t("market.canBeSold")}</p> : <p className="text negative">{t("market.cantBeSold")}</p>}
					</div>
				)}
				<div className="result-image-wrapper">
					<div className="image-wrapper">
						{!!item.result.level && item.result.type === "miners" && (
							<img
								className={`level-img-size-${item.result.width || 2}`}
								src={item.result.is_old_merge ? minerStarImg : `/static/img${RARITY_DATA_BY_LEVEL[item.result.level].icon}`}
								width={22}
								height={16}
								alt={item.result.level}
							/>
						)}
						<LazyLoadImage
							alt={item.result._id}
							height={ITEM_IMAGE_SIZE[item.result.type].height}
							width={ITEM_IMAGE_SIZE[item.result.type].width}
							src={`${process.env.STATIC_URL}/static/img/market/miners/${item.result.filename}.gif?v=${item.result.img_ver}`}
							threshold={100}
							className="product-image"
							style={{ opacity: !item.progress.is_in_progress && !item.required_items_available ? "0.3" : "1" }}
						/>
					</div>
					<div className={`crafting-timer-block ${!isTimer ? "timer-out" : ""}`}>
						{isTimer && (
							<Fragment>
								<span className="progress-timer" style={{ width: `${timerBg}%` }}></span>
								<div className="timer-text">
									<img src={craftTimerIcon} alt="crafting-timer" width={15} height={15} />
									<span>{t("market.craftingOffer.craftingTimer")}</span>
								</div>
								<div className="crafting-timer">
									<p className="timer-text">
										{viewTime.days && `${viewTime.days}`} {viewTime.hours} {viewTime.minutes} {viewTime.seconds}
									</p>
								</div>
							</Fragment>
						)}
						{!isTimer && (
							<div className="timer-text">
								<span>{t("market.craftingOffer.timerReady")}</span>
							</div>
						)}
					</div>
				</div>
				{!isCanBeClaimed && !!item.required_items.length && (
					<Row noGutters className="components-list">
						{item.required_items.map((component) => (
							<Col xs={12} key={component.item_id} className="component-list-col">
								<div className="component-list-item">
									{component.type === "miners" && (
										<Fragment>
											{!component.is_old_merge && (
												<img
													className="component-item-level-img"
													src={`/static/img${RARITY_DATA_BY_LEVEL[component.level || 0].icon}`}
													width={22}
													height={16}
													style={{ zIndex: 1 }}
													alt={component.level}
												/>
											)}
											{component.is_old_merge && <MinerRatingStar className="component-item-level-img" />}
										</Fragment>
									)}
									<LazyLoadImage
										alt={component.item_id}
										height={component.type === "mutation_components" ? 32 : 50}
										width={component.type === "mutation_components" ? 32 : 63}
										src={imgSrc(component.type, component.type === "miners" ? component.filename : component.item_id, component.img_ver)}
										threshold={100}
										className="component-img"
										style={{ opacity: component.count > component.user_count ? "0.3" : "1" }}
									/>
									<p className="component-count-wrapper">
										<span className={`component-count ${component.user_count < component.count ? "red" : "green"}`}>{component.user_count}</span>
										<span className="component-count">/{component.count}</span>
									</p>
								</div>
							</Col>
						))}
					</Row>
				)}

				{isSpeedUp && isTimer && (
					<div className="claim-speed-price">
						<span>{t("market.craftingOffer.speedUpPrice")}</span>
						<span className={`price-value ${isEnoughFunds ? "not-enough" : ""}`}>
							{decimalAdjust(item.progress.speedup_price / currency.toSmall / currency.divider, currency.precision)} {item.currency}
						</span>
					</div>
				)}

				{!isSpeedUp && isTimer && (
					<div className="claim-speed-price">
						<span>{t("market.craftingOffer.craftPrice")}</span>
						<span className={`price-value ${isEnoughFunds ? "not-enough" : ""}`}>
							{decimalAdjust(item.price / currency.toSmall / currency.divider, currency.precision)} {item.progress.speedup_currency}
						</span>
					</div>
				)}

				{isCanBeClaimed && (
					<RollerButton
						text={isEnoughFunds ? t("market.notEnough") : claimText}
						width={100}
						disabled={isEnoughFunds}
						icon={craftOfferBtnClaimIcon}
						color="gold"
						className="crafting-button"
						hidden={confirmationId && confirmationId === item._id}
						action={() => (isCanBeClaimed && !isTimer ? claimRecipeHandler(item._id, item.offer_id, !isTimer) : confirmationHandler(item._id, "claim"))}
					/>
				)}
				{!isCanBeClaimed && (
					<RollerButton
						text={isEnoughFunds ? t("market.notEnough") : t("market.craftingOffer.craft")}
						width={100}
						disabled={isEnoughFunds || (!isSpeedUp && !item.required_items_available)}
						icon={craftOfferBtnIcon}
						color="gold"
						className="crafting-button"
						hidden={confirmationId && confirmationId === item._id}
						action={() => confirmationHandler(item._id, "craft")}
					/>
				)}

				{confirmationId && confirmationId === item._id && (
					<div className="confirmation-wrapper">
						{!!minersIdToMoveFromRack.length && confirmationType === "craft" && (
							<p className="confirmation-merge-info">
								<span className="cyan-text">{minersIdToMoveFromRack.length}</span> {t("market.removedFromTheRack")}
							</p>
						)}
						<p className="confirmation-text">{t("market.youSure")}</p>
						<div className="confirmation-btn-block">
							<RollerButton
								text={confirmationType === "craft" ? t("market.craftingOffer.craft") : t("market.craftingOffer.claim")}
								width={48}
								color="gold"
								className="crafting-button"
								size="small"
								action={() => (confirmationType === "craft" ? craftRecipeHandler(item._id, minersIdToMoveFromRack) : claimRecipeHandler(item._id, item.offer_id, !isTimer))}
							/>
							<RollerButton text={t("market.craftingOffer.discard")} width={48} color="red" className="crafting-button" action={() => confirmationHandler("")} size="small" />
						</div>
					</div>
				)}
			</div>
		</Col>
	);
};

CraftOfferCard.propTypes = {
	item: PropTypes.object.isRequired,
	craftRecipe: PropTypes.func.isRequired,
	claimRecipe: PropTypes.func.isRequired,
	getCraftOffers: PropTypes.func.isRequired,
	isOnlyOne: PropTypes.bool,
};

export default CraftOfferCard;
