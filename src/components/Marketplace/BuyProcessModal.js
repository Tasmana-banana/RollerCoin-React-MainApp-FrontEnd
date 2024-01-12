import React, { Fragment, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Modal, ModalBody } from "reactstrap";
import RollerButton from "../SingleComponents/RollerButton";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import getCurrencyConfig from "./helpers/getCurrencyConfig";
import decimalAdjust from "../../services/decimalAdjust";
import googleAnalyticsPush from "../../services/googleAnalyticsPush";
import { MINERS_TYPES, RARITY_DATA_BY_LEVEL } from "../../constants/Storage";
import { ITEM_TYPE } from "../../constants/Marketplace";
import { ELECTRICITY_EVENTS } from "../../constants/SingleComponents";

import "../../assets/scss/Marketplace/BuyProcessModal.scss";

import closeIcon from "../../assets/img/header/close_menu.svg";
import buyIcon from "../../assets/img/icon/buy_icon.svg";
import storageIcon from "../../assets/img/icon/storage_icon.svg";
import marketplaceIcon from "../../assets/img/icon/marketplace_icon.svg";
import miniLoader from "../../assets/img/button-loader.gif";
import successIcon from "../../assets/img/marketplace/success_icon.svg";
import errorIcon from "../../assets/img/marketplace/error_icon.svg";
import MinerRatingStar from "../SingleComponents/MinerRatingStar";

const STATUSES = {
	0: "pending",
	2: "error",
	3: "success",
	12: "success",
};

const BuyProcessModal = ({ isBuyProcess, closeBuyProcessHandler, item, quantity, totalPrice, currency, refreshBalance }) => {
	const { t } = useTranslation("Marketplace");
	const history = useHistory();
	const wsNode = useSelector((state) => state.webSocket.wsNode);
	const language = useSelector((state) => state.game.language);
	const [currentQty, setCurrentQty] = useState(1);
	const [currentPrice, setCurrentPrice] = useState(0);
	const [confirmedQty, setConfirmedQty] = useState(1);
	const [confirmedPrice, setConfirmedPrice] = useState(0);
	const [statusFound, setStatusFound] = useState(STATUSES[0]);
	const [statusComplete, setStatusComplete] = useState(STATUSES[0]);
	const currentCurrencyConfig = getCurrencyConfig(currency);

	const isMergeMiner = item.itemType === ITEM_TYPE.MINER && [MINERS_TYPES.MERGE, MINERS_TYPES.OLD_MERGE].includes(item.type);

	const onWSNodeMessage = (event) => {
		const data = JSON.parse(event.data);
		const { cmd, value } = data;
		switch (cmd) {
			case "marketplace_orders_filled":
				if (item._id === value.item_id) {
					orderFilledHandler(value);
				}
				break;
			case "marketplace_orders_post_processed":
				if (item._id === value.item_id) {
					orderProcessedHandler(value);
				}
				break;
			default:
				break;
		}
	};

	const orderFilledHandler = (value) => {
		setConfirmedQty(value.count || 0);
		setConfirmedPrice(value.price || 0);
		setStatusFound(STATUSES[value.status]);
	};

	const orderProcessedHandler = (value) => {
		setStatusComplete(STATUSES[value.status]);
		if (value.status === 3) {
			refreshBalance();
		}
	};

	useEffect(() => {
		if (wsNode && !wsNode.listenersMessage.marketplacePurchase) {
			wsNode.setListenersMessage({ marketplacePurchase: onWSNodeMessage });
		}
		return () => {
			if (wsNode) {
				wsNode.removeListenersMessage("marketplacePurchase");
			}
		};
	}, [wsNode]);

	useEffect(() => {
		if (isBuyProcess) {
			const { event, params } = ELECTRICITY_EVENTS.SUCCESS_POPUP[item.itemType];
			googleAnalyticsPush(event, params);
			setCurrentQty(quantity);
			setCurrentPrice(totalPrice);
			setConfirmedQty(quantity);
			setConfirmedPrice(totalPrice);
		}
		if (!isBuyProcess) {
			setCurrentQty(1);
			setCurrentPrice(0);
			setConfirmedQty(1);
			setConfirmedPrice(0);
			setStatusFound(STATUSES[0]);
			setStatusComplete(STATUSES[0]);
		}
	}, [isBuyProcess]);
	const typeImgConfig = {
		miner: {
			img: `${process.env.STATIC_URL}/static/img/market/miners/${item.filename}.gif?v=${new Date(item.last_update).getTime() || 1}`,
			width: 126,
			height: 100,
		},
		rack: {
			img: `${process.env.STATIC_URL}/static/img/market/racks/${item._id}.png?v=1.0.3`,
			width: 126,
			height: 100,
		},
		mutation_component: {
			img: `${process.env.STATIC_URL}/static/img/storage/mutation_components/${item._id}.png?v=1.0.1`,
			width: 64,
			height: 64,
		},
		battery: {
			img: `${process.env.STATIC_URL}/static/img/market/batteries/${item._id}.png?v=1.0.3`,
			width: 124,
			height: 100,
		},
	};

	const closeModalHandler = () => {
		const { event, params } = ELECTRICITY_EVENTS.CLOSE_POPUP;
		googleAnalyticsPush(event, params);
		closeBuyProcessHandler();
	};

	const continueShoppingHandler = () => {
		const { event, params } = ELECTRICITY_EVENTS.CONTINUE_SHOPPING;
		googleAnalyticsPush(event, params);
		closeBuyProcessHandler();
	};

	const goToMarketplaceHandler = () => {
		const { event, params } = ELECTRICITY_EVENTS.GO_TO_MARKETPLACE;
		googleAnalyticsPush(event, params);
		history.push(`${getLanguagePrefix(language)}/marketplace/buy`);
	};
	const goToStorageHandler = () => {
		const { event, params } = ELECTRICITY_EVENTS.GO_TO_STORAGE;
		googleAnalyticsPush(event, params);
		history.push(`${getLanguagePrefix(language)}/storage/inventory`);
	};

	return (
		<Modal isOpen={isBuyProcess} toggle={closeModalHandler} centered className="buy-process-modal">
			<ModalBody className="buy-process-modal-body">
				<RollerButton className="close-btn" size="small" icon={closeIcon} action={closeModalHandler} />
				{statusComplete === "pending" && statusFound !== "error" && (
					<Fragment>
						<p className="modal-title">{t("buy.success")}</p>
						<p className="modal-text">{t("buy.placed")}</p>
					</Fragment>
				)}
				{(statusFound === "error" || statusComplete === "error") && (
					<Fragment>
						<p className="modal-title red">{t("buy.failed")}</p>
						<p className="modal-text mb-0">{t("buy.didntFind")}</p>
						<p className="modal-text">{t("buy.tryAgain")}</p>
					</Fragment>
				)}
				{statusComplete === "success" && (
					<Fragment>
						<p className="modal-title green">{t("buy.congrats")}</p>
						<p className="modal-text">{t("buy.purchaseSuccess")}</p>
					</Fragment>
				)}
				<div className="modal-order-wrapper">
					<div className="modal-item-img-wrapper">
						{!!item.level && item.type === MINERS_TYPES.MERGE && (
							<img
								className={`collection-product-level-img-size-${item.width || 2}`}
								src={`/static/img${RARITY_DATA_BY_LEVEL[item.level || 0].icon}`}
								width={22}
								height={16}
								alt={item.level}
							/>
						)}
						<img
							className={isMergeMiner && item.level ? "gold-shadow" : ""}
							width={typeImgConfig[item.itemType].width}
							height={typeImgConfig[item.itemType].height}
							src={typeImgConfig[item.itemType].img}
							alt="product"
						/>
						{!!item.level && item.type === MINERS_TYPES.OLD_MERGE && <MinerRatingStar itemSize={item.width || 2} className="collection-product-level-img-size" />}
					</div>
					<div className="item-info-wrapper">
						<p className="item-title">
							{!!item.level && item.type === MINERS_TYPES.MERGE && (
								<span style={{ color: RARITY_DATA_BY_LEVEL[item?.level || 0].color }}>{RARITY_DATA_BY_LEVEL[item?.level || 0].title} </span>
							)}
							{item.name[language]}
						</p>
						<p className="item-qty">
							{t("main.qty")}: <span className="item-qty-amount">{currentQty}</span>
						</p>
						<p className="item-price">
							{t("main.from")}:{" "}
							<span className="item-price-amount">
								{decimalAdjust(currentPrice / currentCurrencyConfig.toSmall, currentCurrencyConfig.precisionToBalance)} {currency}
							</span>
						</p>
					</div>
				</div>
				<div className="order-status-block">
					<p className="order-status-title">{t("buy.status")}</p>
					<div className="order-status-wrapper">
						<div className="order-status-step success">
							<div className="status-point success">
								<img className="status-point-icon" src={successIcon} width={8} height={8} alt="status" />
							</div>
							<p className="status-text">{t("buy.orderCreated")}</p>
						</div>
						<div className={`order-status-step ${statusFound}`}>
							<div className={`status-point ${statusFound}`}>
								{statusFound !== "pending" && <img src={statusFound === "success" ? successIcon : errorIcon} width={8} height={8} alt="status" />}
							</div>
							<p className="status-text">
								{t(`buy.${statusFound !== "error" ? "found" : "notFound"}`, {
									qty: confirmedQty,
									amount: `${decimalAdjust(confirmedPrice / currentCurrencyConfig.toSmall, currentCurrencyConfig.precisionToBalance)} ${currency}`,
								})}
							</p>
							{statusFound === "pending" && <img className="mini-loader" src={miniLoader} width={18} height={18} alt="loading" />}
						</div>
						<div className={`order-status-step ${statusComplete}`}>
							<div className={`status-point ${statusFound === "success" ? statusComplete : ""}`}>
								{statusFound === "success" && statusComplete !== "pending" && <img src={statusComplete === "success" ? successIcon : errorIcon} width={8} height={8} alt="status" />}
							</div>
							<p className="status-text">{t("buy.itemInStorage")}</p>
							{statusComplete === "pending" && statusFound === "success" && <img className="mini-loader" src={miniLoader} width={18} height={18} alt="loading" />}
						</div>
					</div>
				</div>
				<div className={`buttons-wrapper ${statusComplete ? "show" : ""}`}>
					<RollerButton className="mb-4" text={t("buy.continue")} icon={buyIcon} width={100} color="cyan" action={continueShoppingHandler} />
					<RollerButton className="mb-4" text={t("buy.goMarketplace")} icon={marketplaceIcon} width={100} action={goToMarketplaceHandler} />
					<RollerButton text={t("buy.goStorage")} icon={storageIcon} width={100} action={goToStorageHandler} />
				</div>
			</ModalBody>
		</Modal>
	);
};

BuyProcessModal.propTypes = {
	isBuyProcess: PropTypes.bool.isRequired,
	closeBuyProcessHandler: PropTypes.func.isRequired,
	item: PropTypes.object.isRequired,
	quantity: PropTypes.number.isRequired,
	totalPrice: PropTypes.number.isRequired,
	currency: PropTypes.string.isRequired,
	refreshBalance: PropTypes.func.isRequired,
};

export default BuyProcessModal;
