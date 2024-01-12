import React, { Fragment, useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Link, useHistory, useRouteMatch } from "react-router-dom";
import PropTypes from "prop-types";
import { Row, Modal, ModalBody, Tooltip } from "reactstrap";
import { toast } from "react-toastify";
import { MINERS_TYPES, RARITY_DATA_BY_LEVEL } from "../../constants/Storage";
import { ELECTRICITY_EVENTS } from "../../constants/SingleComponents";
import RollerButton from "../SingleComponents/RollerButton";
import QuantityInput from "../SingleComponents/QuantityInput";
import OrdersPriceTable from "./OrdersPriceTable";
import PriceChart from "./PriceChart";
import ItemInfo from "./ItemInfo";
import BuyProcessModal from "./BuyProcessModal";
import Captcha from "../Captcha/Captcha";
import decimalAdjust from "../../services/decimalAdjust";
import fetchWithToken from "../../services/fetchWithToken";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import getCurrencyConfig from "./helpers/getCurrencyConfig";
import progressionEventRewardToast from "../../services/progressionEventRewardToast";
import progressionEventTaskToast from "../../services/progressionEventTaskToast";
import googleAnalyticsPush from "../../services/googleAnalyticsPush";

import "../../assets/scss/Marketplace/BuyItemPage.scss";
import "../../assets/scss/ProgressionEvent/ProgressionEventRewardToast.scss";
import "../../assets/scss/ProgressionEvent/ProgressionEventTaskToast.scss";

import closeIcon from "../../assets/img/header/close_menu.svg";
import buyIcon from "../../assets/img/icon/buy_icon.svg";
import infoIcon from "../../assets/img/icon/info_box.svg";
import loaderImg from "../../assets/img/loader_sandglass.gif";
import errorNotice from "../../assets/img/icon/error_notice.svg";
import backIcon from "../../assets/img/wallet/back_angle.svg";
import { unpackTradeOffers, calculatePrice as calculatePriceHelper } from "./helpers/tradeOffersCompression";
import calculateQuantityIsEnoughMoney from "./helpers/calculateQuantityIsEnoughMoney";

const TOAST_CONFIG = {
	position: "top-left",
	autoClose: 3000,
	hideProgressBar: true,
	closeOnClick: true,
	pauseOnHover: true,
	draggable: true,
};

const BuyItemPage = ({ wsReact, wsNode }) => {
	const { t } = useTranslation("Marketplace");
	const match = useRouteMatch();
	const history = useHistory();
	const isMobile = useSelector((state) => state.game.isMobile);
	const language = useSelector((state) => state.game.language);
	const balance = useSelector((state) => state.game.balance);
	const fingerprint = useSelector((state) => state.user.fingerprint);
	const priceDebounceRef = useRef(null);
	const [itemId, setItemId] = useState("");
	const [itemType, setItemType] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [item, setItem] = useState({});
	const [totalOrders, setTotalOrders] = useState(0);
	const [quantity, setQuantity] = useState(1);
	const [totalPrice, setTotalPrice] = useState(0);
	const [isEnoughBalance, setIsEnoughBalance] = useState(false);
	const [isConfirmation, setIsConfirmation] = useState(false);
	const [isCreatingOrderProcess, setIsCreatingOrderProcess] = useState(false);
	const [isBuyProcess, setIsBuyProcess] = useState(false);
	const [isTooltipOpen, setIsTooltipOpen] = useState(false);
	const [marketplaceConfig, setMarketplaceConfig] = useState({
		quantityLimit: 1,
	});
	const [tradeOffersData, setTradeOffersData] = useState(null);

	const [captchaModalIsOpen, setCaptchaModalIsOpen] = useState(false);
	const [challenge, setChallenge] = useState("");
	const [captchaWidth, setCaptchaWidth] = useState("300px");
	const [captchaHeight, setCaptchaHeight] = useState("300px");
	const [captchaMaxDots, setCaptchaMaxDots] = useState(5);

	const currency = "RLT";
	const currentCurrencyConfig = getCurrencyConfig(currency);
	const signals = {};
	const controllers = {};

	const createSignalAndController = (id) => {
		if (controllers[id]) {
			controllers[id].abort();
		}
		controllers[id] = new AbortController();
		signals[id] = controllers[id].signal;
	};

	useEffect(async () => {
		const { event, params } = ELECTRICITY_EVENTS.OPEN_TO_BUY[match.params.type];
		googleAnalyticsPush(event, params);
		setItemId(match.params.id);
		setItemType(match.params.type);
		await Promise.all([itemInfo(), getMarketplaceConfig()]);
		return () => {
			clearTimeout(priceDebounceRef.current);
			Object.keys(controllers).forEach((key) => {
				if (controllers[key]) {
					controllers[key].abort();
				}
			});
		};
	}, []);

	useEffect(() => {
		if (wsNode && !wsNode.listenersMessage.orderUpdate) {
			wsNode.setListenersMessage({ orderUpdate: onWSNodeMessage });
		}
		return () => {
			if (wsNode) {
				wsNode.removeListenersMessage("orderUpdate");
			}
		};
	}, [wsNode, itemId]);

	const onWSNodeMessage = async (event) => {
		const data = JSON.parse(event.data);
		const { cmd, value } = data;
		switch (cmd) {
			case "marketplace_orders_update":
				if (value.item_type === itemType && value.item_id === itemId && value.currency === currency) {
					updateTradeOffers(value.data.tradeOffers);
				}
				break;
			case "pe_user_reward_info":
				if (!value.event_type || value.event_type === "default") {
					progressionEventRewardToast(value);
				}
				break;
			case "pe_user_task_update":
				if (!value.event_type || value.event_type === "default") {
					progressionEventTaskToast(value);
				}
				break;
			default:
				break;
		}
	};

	const getCaptchaStatus = async (fp) => {
		createSignalAndController("getCaptchaStatus");
		const query = new URLSearchParams({ fingerprint: fp });
		try {
			const res = await fetchWithToken(`/api/marketplace/captcha-status?${query.toString()}`, {
				method: "GET",
				signal: signals.getCaptchaStatus,
			});
			if (!res.success) {
				console.error(res.error);
				return null;
			}
			return res.data;
		} catch (e) {
			console.error(e);
			return null;
		}
	};

	const updateTradeOffers = (data) => {
		setTradeOffersData(unpackTradeOffers(data));
	};

	const itemInfo = async () => {
		createSignalAndController("itemInfo");
		try {
			const json = await fetchWithToken(`/api/marketplace/item-info?itemId=${itemId || match.params.id}&itemType=${itemType || match.params.type}&currency=${currency}`, {
				method: "GET",
				signal: signals.itemInfo,
			});
			if (!json.success) {
				return false;
			}
			setItem(json.data);
			updateTradeOffers(json.data.tradeOffers);
			setIsLoading(false);
		} catch (e) {
			console.error(e);
		}
	};

	const calculatePrice = async (value) => {
		const desiredQuantity = value || quantity;
		const price = calculatePriceHelper(tradeOffersData, desiredQuantity);
		setTotalPrice(Math.ceil(price));
		setIsEnoughBalance(balance[currentCurrencyConfig.code] >= price);
	};

	const buyItem = async () => {
		setIsCreatingOrderProcess(true);
		createSignalAndController("buyItem");
		try {
			const json = await fetchWithToken("/api/marketplace/purchase-item", {
				method: "POST",
				body: JSON.stringify({
					challenge,
					itemId: item._id,
					itemType: item.itemType,
					totalCount: quantity,
					currency,
					totalPrice,
				}),
				signal: signals.buyItem,
			});
			if (!json.success) {
				toast(renderToast(t("buy.failedPurchase"), errorNotice), TOAST_CONFIG);
				setIsCreatingOrderProcess(false);
				return setIsConfirmation(false);
			}
			const { event } = ELECTRICITY_EVENTS.PURCHASE;
			googleAnalyticsPush(event, {
				ecommerce: {
					currency,
					value: decimalAdjust(totalPrice / currentCurrencyConfig.toSmall, currentCurrencyConfig.precisionToBalance),
					tax: 0.0,
					affiliation: "Marketplace",
					transaction_id: `${item._id}${Date.now()}`,
					items: [
						{
							item_name: item.name.en,
							item_id: item._id,
							price: decimalAdjust(totalPrice / currentCurrencyConfig.toSmall, currentCurrencyConfig.precisionToBalance) / quantity,
							item_category: itemType === "mutation_component" ? "part" : itemType,
							quantity,
						},
					],
				},
			});
			setIsCreatingOrderProcess(false);
			setIsConfirmation(false);
			setIsBuyProcess(true);
		} catch (e) {
			console.error(e);
		}
	};

	const getMarketplaceConfig = async () => {
		createSignalAndController("getMarketplaceConfig");
		try {
			const json = await fetchWithToken(`/api/marketplace/config`, {
				method: "GET",
				signal: signals.getMarketplaceConfig,
			});
			if (!json.success) {
				return false;
			}
			setMarketplaceConfig(json.data);
		} catch (e) {
			console.error(e);
		}
	};

	const quantityHandler = (value) => {
		setQuantity(value);
		if (!value) {
			return setTotalPrice(0);
		}
		calculatePrice(value);
	};

	const setQuantityMax = (value) => {
		const quantityResult = calculateQuantityIsEnoughMoney(tradeOffersData, value, balance[currentCurrencyConfig.code]);
		quantityHandler(quantityResult);
	};

	const renderToast = (text, icon) => (
		<div className="content-with-image">
			<img src={icon} alt="error notification" />
			<span>{text}</span>
		</div>
	);

	const closeBuyProcessModalHandler = () => {
		setIsBuyProcess(false);
	};

	const refreshBalance = () => {
		wsReact.send(
			JSON.stringify({
				cmd: "balance_request",
			})
		);
	};

	const totalOrdersHandler = (count) => {
		setTotalOrders(count);
	};

	useEffect(async () => {
		if (totalOrders) {
			await calculatePrice();
		}
	}, [totalOrders]);

	const onBuyClickHandler = async () => {
		const { event, params } = ELECTRICITY_EVENTS.CLICK_BUY;
		const captcha = await getCaptchaStatus(fingerprint);
		if (captcha && captcha.is_captcha_required) {
			setChallenge(captcha.challenge);
			setCaptchaWidth(captcha.width);
			setCaptchaHeight(captcha.height);
			setCaptchaMaxDots(captcha.max_dots);
			setCaptchaModalIsOpen(true);
		} else {
			googleAnalyticsPush(event, params);
			setIsConfirmation(true);
		}
	};

	const onCaptchaSuccess = async () => {
		setCaptchaModalIsOpen(false);
		await buyItem();
	};

	const onCaptchaFail = (error) => {
		toast(renderToast(error.message, errorNotice), {
			position: "top-left",
			autoClose: 3000,
			hideProgressBar: true,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
		});
		setCaptchaModalIsOpen(false);
		setIsConfirmation(false);
	};

	return (
		<Fragment>
			<Captcha
				isOpen={captchaModalIsOpen && challenge}
				toggle={() => setCaptchaModalIsOpen(!captchaModalIsOpen)}
				width={captchaWidth}
				height={captchaHeight}
				maxDots={captchaMaxDots}
				challenge={challenge}
				onSuccess={onCaptchaSuccess}
				onFail={onCaptchaFail}
			/>
			{isMobile && (
				<Row noGutters={true} className="back-button">
					<Link to={`${getLanguagePrefix(language)}/marketplace/buy`} className="d-flex back-link">
						<span className="icon">
							<img src={backIcon} alt="back_angle" />
						</span>
						<span>{t("buy.backLoList")}</span>
					</Link>
				</Row>
			)}
			<div className="marketplace-buy-item-page">
				<RollerButton action={() => history.push(`${getLanguagePrefix(language)}/marketplace/buy`)} className="close-btn" size="small" icon={closeIcon} />
				{isLoading && (
					<div className="item-loader-layout">
						<img src={loaderImg} height={126} width={126} alt="Loading..." />
					</div>
				)}
				{!isLoading && (
					<Fragment>
						{item.itemType !== "mutation_component" && (
							<h4 className="main-item-title">
								{item.type === MINERS_TYPES.MERGE && <span style={{ color: RARITY_DATA_BY_LEVEL[item?.level || 0].color }}>{RARITY_DATA_BY_LEVEL[item?.level || 0].title} </span>}
								{item.name[language] || item.name.en}
							</h4>
						)}
						{item.itemType === "mutation_component" && (
							<h4 className="main-item-title">
								<span style={{ color: `#${item.rarityGroup?.baseHexColor || "ffffff"}` }}>{item.rarityGroup?.title[language] || item.rarityGroup?.title.en} </span>
								{item.name[language] || item.name.en}
							</h4>
						)}
						<Row noGutters={isMobile} className="item-main-wrapper">
							<ItemInfo item={item}>
								<div className="item-quantity-price-wrapper">
									<p className="input-label">{t("buy.quantity")}</p>
									<QuantityInput value={quantity} min={1} max={Math.min(marketplaceConfig.quantityLimit, totalOrders || 1)} handler={quantityHandler} />

									<div className="item-price-wrapper">
										<div className="input-price-wrapper">
											<p className="input-label">
												{t("buy.rltToPay")} |{" "}
												<a
													href="#"
													onClick={(e) => {
														e.preventDefault();
														setQuantityMax(Math.min(marketplaceConfig.quantityLimit, totalOrders || 1));
													}}
												>
													{t("sell.sellItemPage.quantityMax")}
												</a>
											</p>
											<p className={`item-price`}>{`${decimalAdjust(totalPrice / currentCurrencyConfig.toSmall, currentCurrencyConfig.precisionToBalance)} ${currency}`}</p>
										</div>
										<div className="item-info" id="item-info-tooltip">
											<img src={infoIcon} width={isMobile ? 24 : 20} height={isMobile ? 24 : 20} alt="info" />
										</div>
										<Tooltip
											innerClassName="item-info-tooltip-inner"
											placement={isMobile ? "bottom" : "right"}
											autohide={false}
											target="item-info-tooltip"
											isOpen={isTooltipOpen}
											toggle={() => setIsTooltipOpen(!isTooltipOpen)}
										>
											<p className="m-0">{t("buy.tooltipText")}</p>
										</Tooltip>
									</div>
								</div>
								<RollerButton icon={buyIcon} text={t("main.buy")} color="cyan" width={100} disabled={!totalOrders || !isEnoughBalance} action={onBuyClickHandler} />
							</ItemInfo>
							<OrdersPriceTable itemId={itemId} itemType={itemType} currency={currency} totalOrdersHandler={totalOrdersHandler} />
						</Row>
						<PriceChart itemType={itemType} itemId={itemId} currency={currency} />
						<BuyProcessModal
							isBuyProcess={isBuyProcess}
							closeBuyProcessHandler={closeBuyProcessModalHandler}
							item={item}
							quantity={quantity}
							totalPrice={totalPrice}
							currency={currency}
							refreshBalance={refreshBalance}
						/>
					</Fragment>
				)}
				<Modal isOpen={isConfirmation} toggle={() => setIsConfirmation(!isConfirmation)} centered className="confirmation-modal">
					<ModalBody className="confirmation-modal-body">
						<p className="modal-title">{t("buy.youSure")}</p>
						<p className="modal-text">{t("buy.allPurchase")}</p>
						<div className="buttons-wrapper">
							<RollerButton disabled={isCreatingOrderProcess} isLoading={isCreatingOrderProcess} text={t("main.buy")} width={47} color="cyan" action={buyItem} />
							<RollerButton text={t("main.cancel")} width={47} action={() => setIsConfirmation(false)} />
						</div>
					</ModalBody>
				</Modal>
			</div>
		</Fragment>
	);
};

BuyItemPage.propTypes = {
	wsReact: PropTypes.object.isRequired,
	wsNode: PropTypes.object.isRequired,
};

export default BuyItemPage;
