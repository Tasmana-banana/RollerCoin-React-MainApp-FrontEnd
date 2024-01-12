import React, { Fragment, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Modal, ModalBody, Input, FormGroup, Label } from "reactstrap";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import LazyLoad from "react-lazyload";
import { toast } from "react-toastify";
import { MINERS_TYPES, RARITY_DATA_BY_LEVEL } from "../../../constants/Storage";
import decimalAdjust from "../../../services/decimalAdjust";
import fetchWithToken from "../../../services/fetchWithToken";
import convertCurrency from "../../../services/convertCurrency";
import getCurrencyConfig from "../helpers/getCurrencyConfig";

import Captcha from "../../Captcha/Captcha";
import RollerButton from "../../SingleComponents/RollerButton";

import successNotice from "../../../assets/img/icon/success_notice.svg";
import errorNotice from "../../../assets/img/icon/error_notice.svg";
import miniLoader from "../../../assets/img/button-loader.gif";

import "../../../assets/scss/Marketplace/MyOrdersDeleteModal.scss";
import "../../../assets/scss/Marketplace/MyOrdersEditModal.scss";

const renderToast = (text, icon) => (
	<div className="content-with-image">
		<img src={icon} alt="market notification" />
		<span>{text}</span>
	</div>
);

const CLEAR_EXCHANGE_RATE_CACHE_INTERVAL = 1000 * 60 * 5; // 5 minutes

const ModalEditOrder = ({ stateChanger, isEditModalOpen, closeEditModalHandler, editModalData, getMyOrders }) => {
	const { orderId, imgSrc, title, priceValue, quantity, currency, type, itemId, level } = editModalData;
	const currencyFromConfig = getCurrencyConfig(currency);
	const rltFromConfig = getCurrencyConfig("RLT");
	const { t } = useTranslation("Marketplace");
	const marketplaceConfig = useSelector((state) => state.marketplace.marketplaceConfig);
	const fingerprint = useSelector((state) => state.user.fingerprint);
	const [priceInput, setPriceInput] = useState(0);
	const [priceFocus, setPriceFocus] = useState(true);
	const [currencyInputSuffix, setCurrencyInputSuffix] = useState(" RLT");
	const [isExchangeLoading, setIsExchangeLoading] = useState(false);
	const [exchangeRates, setExchangeRates] = useState({ RLT: 1 });
	const [totalWithFeeExchanged, setTotalWithFeeExchanged] = useState("0");
	const [isLessMinLimit, setIsLessMinLimit] = useState(false);
	const [isInitialLoading, setIsInitialLoading] = useState(false);
	const [sellPriceLimits, setSellPriceLimits] = useState({ min: 0, max: Infinity });

	const [captchaModalIsOpen, setCaptchaModalIsOpen] = useState(false);
	const [challenge, setChallenge] = useState("");
	const [captchaWidth, setCaptchaWidth] = useState("300px");
	const [captchaHeight, setCaptchaHeight] = useState("300px");
	const [captchaMaxDots, setCaptchaMaxDots] = useState(5);

	const signals = {};
	const controllers = {};

	const createSignalAndController = (id) => {
		if (controllers[id]) {
			controllers[id].abort();
		}
		controllers[id] = new AbortController();
		signals[id] = controllers[id].signal;
	};

	useEffect(() => {
		setPriceInput(priceValue);
		const updateExchangeRateInterval = setInterval(() => setExchangeRates({}), CLEAR_EXCHANGE_RATE_CACHE_INTERVAL);
		return () => {
			if (updateExchangeRateInterval) {
				clearInterval(updateExchangeRateInterval);
			}
			Object.keys(controllers).forEach((key) => {
				if (controllers[key]) {
					controllers[key].abort();
				}
			});
		};
	}, []);

	useEffect(async () => {
		setIsInitialLoading(true);
		await Promise.all([updateExchangeRates(currency), getItemSellPriceLimits()]);
		setIsInitialLoading(false);
	}, []);

	useEffect(async () => {
		if (!Object.keys(exchangeRates).length) {
			await updateExchangeRates(currency);
		}
	}, [exchangeRates]);

	useEffect(() => {
		if (!exchangeRates[currency]) {
			return false;
		}
		calculatePriceAndFee();
	}, [priceInput, exchangeRates]);

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

	const calculatePriceAndFee = () => {
		const precision = currencyFromConfig.precisionToBalance || 2;
		const sum = priceInput * quantity;
		const totalExchanged = (sum / exchangeRates[currency]).toFixed(precision);

		setTotalWithFeeExchanged(totalExchanged);
	};

	const getExchangeRate = async (targetCurrency) => {
		createSignalAndController("getExchangeRate", targetCurrency);
		setIsExchangeLoading(true);
		try {
			let result = 0;
			await convertCurrency(signals.getExchangeRate, targetCurrency, "USDT", 1, (rate) => {
				result = rate;
			});
			return result;
		} finally {
			setIsExchangeLoading(false);
		}
	};

	const getItemSellPriceLimits = async () => {
		createSignalAndController("getItemSellPriceLimits");
		try {
			const json = await fetchWithToken(`/api/marketplace/seller/price-limits?currency=${currency}&itemType=${type}&itemId=${itemId}`, {
				method: "GET",
				signal: signals.getItemSellPriceLimits,
			});
			if (!json.success) {
				return false;
			}
			const min = json.data.min / currencyFromConfig.toSmall / currencyFromConfig.divider;
			const max = json.data.max / currencyFromConfig.toSmall / currencyFromConfig.divider;
			setSellPriceLimits({ min, max });
		} catch (e) {
			console.error(e);
		}
	};

	const updateExchangeRates = async (targetCurrency) => {
		if (exchangeRates[targetCurrency]) {
			return false;
		}
		if (!currencyFromConfig.needExchangeRate) {
			return setExchangeRates({ ...exchangeRates, [targetCurrency]: 1 });
		}
		const rate = await getExchangeRate(targetCurrency);
		setExchangeRates({ ...exchangeRates, [targetCurrency]: rate });
	};

	const submitHandler = async (perItemPrice) => {
		createSignalAndController("editSaleOrderPrice");
		stateChanger("isLoading", true);
		stateChanger("isEditModalOpen", false);
		try {
			const body = JSON.stringify({ challenge, orderId, perItemPrice });
			const json = await fetchWithToken(`/api/marketplace/seller/update-order-price`, {
				method: "POST",
				body,
				signal: signals.editSaleOrderPrice,
			});
			if (!json.success) {
				return toast(renderToast(json.error, errorNotice));
			}
			if (json.success) {
				await getMyOrders();
				toast(renderToast(t("orders.editModalSuccess"), successNotice));
			}
		} catch (e) {
			console.error(e);
		} finally {
			stateChanger("isLoading", false);
		}
	};

	const priceHandler = (value, action) => {
		if (Number.isNaN(+value) || value < 0) {
			return;
		}

		setIsLessMinLimit(value > 0 && value < sellPriceLimits.min);
		if (value > sellPriceLimits.max) {
			return setPriceInput(sellPriceLimits.max);
		}

		if (action) {
			setPriceInput(value);
			return priceCurrencySuffixHandler();
		}

		setPriceInput(value);
	};

	const priceCurrencySuffixHandler = () => {
		setPriceFocus(!priceFocus);
	};

	const onCaptchaSuccess = async () => {
		await submitHandler(Math.ceil(priceInput * rltFromConfig.toSmall));
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
	};

	const onEditSaveChange = async () => {
		const captcha = await getCaptchaStatus(fingerprint);
		if (captcha && captcha.is_captcha_required) {
			setChallenge(captcha.challenge);
			setCaptchaWidth(captcha.width);
			setCaptchaHeight(captcha.height);
			setCaptchaMaxDots(captcha.max_dots);
			setCaptchaModalIsOpen(true);
		} else {
			await submitHandler(Math.ceil(priceInput * rltFromConfig.toSmall));
		}
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
			<Modal isOpen={isEditModalOpen} toggle={closeEditModalHandler} centered={true} className="myorders-modal">
				<ModalBody className="myorders-modal-wrapper">
					<div className="title-block">
						<h2 className="title">{t("orders.editModalTitle")}</h2>
					</div>
					<div className="text-block">
						<p className="text">{t("orders.editModalText")}</p>
					</div>
					<div className="item-block">
						<div className="img-block">
							{!!level.level && level.type === MINERS_TYPES.MERGE && (
								<img
									className={`collection-product-level-img-size-${level.width || 2}`}
									src={`/static/img${RARITY_DATA_BY_LEVEL[level.level || 0].icon}`}
									width={22}
									height={16}
									alt={level.level}
								/>
							)}
							<LazyLoad offset={100} throttle={0}>
								<img src={imgSrc} alt={title} />
							</LazyLoad>
						</div>
						<div className="item-info-block">
							<h3 className="item-title">
								{!!level.level && level.type === MINERS_TYPES.MERGE && (
									<span style={{ color: RARITY_DATA_BY_LEVEL[level.level || 0].color }}>{RARITY_DATA_BY_LEVEL[level.level || 0].title} </span>
								)}
								{title}
							</h3>

							<FormGroup className="price-group">
								<Label className="price-label" for="priceValue">
									{t("orders.editModalLabel")}
								</Label>
								<Input
									className="price-input"
									pattern="[0-9.]+"
									value={priceFocus ? `${priceInput} ${currencyInputSuffix}` : priceInput}
									id="priceValue"
									disabled={isInitialLoading}
									onChange={(e) => priceHandler(e.target.value)}
									onBlur={priceInput < sellPriceLimits.min ? () => priceHandler(sellPriceLimits.min, true) : () => priceCurrencySuffixHandler()}
									onFocus={() => priceCurrencySuffixHandler()}
								/>
								{isLessMinLimit && <p className="price-calculate-wrapper-warning">min value is {sellPriceLimits.min}</p>}
							</FormGroup>
						</div>
					</div>

					<div className="details-block">
						<div className="recipe-item">
							<span className="item">{t("orders.editModalQuantity")}</span>
							<span className="count">{quantity}</span>
						</div>
						<div className="recipe-item">
							<span className="item">{t("orders.editModalFee")}</span>
							<span className="count">{decimalAdjust(+priceInput * (marketplaceConfig.systemFee / 100), currencyFromConfig.precision)} RLT</span>
						</div>
						<div className="recipe-item">
							<span className="item">{t("orders.editModalTotal")}</span>
							<span className="count">{decimalAdjust(+priceInput * (marketplaceConfig.systemFee / 100) + +priceInput, currencyFromConfig.precision)} RLT</span>
						</div>
						<div className="input-receive">
							<p className="receive-item">You Recieve</p>
							<p className="receive-value">
								{`≈ `}
								{isExchangeLoading && <img src={miniLoader} width={18} height={18} alt="loading" />}
								{!isExchangeLoading && `${totalWithFeeExchanged} ${currency}`}
							</p>
						</div>
					</div>

					<div className="button-block">
						<RollerButton text={t("orders.editModalBtnSave")} color="cyan" className="myorders-modal-button" action={onEditSaveChange} />
						<RollerButton text={t("orders.modalBtnCancel")} action={closeEditModalHandler} className="myorders-modal-button" />
					</div>
				</ModalBody>
			</Modal>
		</Fragment>
	);
};

ModalEditOrder.propTypes = {
	isEditModalOpen: PropTypes.bool,
	closeEditModalHandler: PropTypes.bool,
	editModalData: PropTypes.object.isRequired,
	stateChanger: PropTypes.func.isRequired,
	getMyOrders: PropTypes.func.isRequired,
};

export default ModalEditOrder;
