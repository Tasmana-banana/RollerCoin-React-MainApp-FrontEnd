import React, { useEffect, useState, useRef, useMemo, Fragment } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { Input } from "reactstrap";
import Captcha from "../Captcha/Captcha";
import RollerButton from "../SingleComponents/RollerButton";
import QuantityInput from "../SingleComponents/QuantityInput";
import ConfirmSellPriceModal from "./ConfirmSellPriceModal";
import SellCongratsModal from "./SellCongratsModal";
import { CurrencySelectOption, CurrencySelectValue } from "./CurrencySelectOptions";
import fetchWithToken from "../../services/fetchWithToken";
import convertCurrency from "../../services/convertCurrency";
import getCurrencyConfig from "./helpers/getCurrencyConfig";
import { ITEM_TYPE } from "../../constants/Marketplace";

import "../../assets/scss/Marketplace/SellItemPriceBlock.scss";

import sellIcon from "../../assets/img/marketplace/sell_button_icon.svg";
import miniLoader from "../../assets/img/button-loader.gif";

const CLEAR_EXCHANGE_RATE_CACHE_INTERVAL = 1000 * 60 * 5; // 5 minutes

const SellItemPriceBlock = ({ item, currencyFrom, refreshItemInfo }) => {
	const { t } = useTranslation("Marketplace");
	const fingerprint = useSelector((state) => state.user.fingerprint);
	const marketplaceConfig = useSelector((state) => state.marketplace.marketplaceConfig);
	const currencies = useSelector((state) => state.wallet.rollerCurrencies);
	const currencyFromConfig = useMemo(() => getCurrencyConfig(currencyFrom), [currencyFrom]);
	const [isExchangeLoading, setIsExchangeLoading] = useState(false);
	const [isPriceConfirmation, setIsPriceConfirmation] = useState(false);
	const [isSellInProgress, setIsSellInProgress] = useState(false);
	const [isSellCongratulation, setIsSellCongratulation] = useState(false);
	const [isLessMinLimit, setIsLessMinLimit] = useState(false);
	const [selectedExchangeCurrency, setSelectedExchangeCurrency] = useState({ value: "RLT", label: "RLT" });
	const [exchangeCurrency, setExchangeCurrency] = useState("RLT");
	const [exchangeCurrencyConfig, setExchangeCurrencyConfig] = useState(currencyFromConfig);
	const [exchangeRates, setExchangeRates] = useState({ RLT: 1 });
	const [quantity, setQuantity] = useState(1);
	const [perItemPrice, setPerItemPrice] = useState(0);
	const [totalWithFeeExchanged, setTotalWithFeeExchanged] = useState("0");
	const [feeAmount, setFeeAmount] = useState(0);
	const [quantifiedWithFee, setQuantifiedWithFee] = useState(0);
	const [quantifiedExchanged, setQuantifiedExchanged] = useState("0");

	const [captchaModalIsOpen, setCaptchaModalIsOpen] = useState(false);
	const [challenge, setChallenge] = useState("");
	const [captchaWidth, setCaptchaWidth] = useState("300px");
	const [captchaHeight, setCaptchaHeight] = useState("300px");
	const [captchaMaxDots, setCaptchaMaxDots] = useState(5);

	const priceDebounceRef = useRef(null);
	const wsNode = useSelector((state) => state.webSocket.wsNode);
	const isDisabledButton = useMemo(
		() => isLessMinLimit || perItemPrice <= 0 || isSellInProgress || item.quantity <= 0 || (item.itemType === ITEM_TYPE.MINER && item.is_can_be_sold_on_mp === false),
		[isLessMinLimit, perItemPrice, isSellInProgress, item.quantity, item.itemType, item.is_can_be_sold_on_mp]
	);

	const [priceMin, setPriceMin] = useState(item.priceMin / currencyFromConfig.toSmall / currencyFromConfig.divider);
	const [priceMax, setPriceMax] = useState(item.priceMax / currencyFromConfig.toSmall / currencyFromConfig.divider);

	const currentCurrencyOptions = currencies
		.filter((currency) => marketplaceConfig.exchangeCurrencies.includes(currency.code.toUpperCase()))
		.map((currency) => ({ value: currency.name, label: currency.name }));
	const signals = {};
	const controllers = {};

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

	useEffect(async () => {
		setPerItemPrice(priceMin);
		const updateExchangeRateInterval = setInterval(() => setExchangeRates({}), CLEAR_EXCHANGE_RATE_CACHE_INTERVAL);
		return () => {
			clearTimeout(priceDebounceRef.current);
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

	useEffect(() => {
		if (wsNode && !wsNode.listenersMessage.itemPriceLimitsUpdate) {
			wsNode.setListenersMessage({ itemPriceLimitsUpdate: onWSNodeMessage });
		}
		return () => {
			if (wsNode) {
				wsNode.removeListenersMessage("itemPriceLimitsUpdate");
			}
		};
	}, [wsNode]);

	const onWSNodeMessage = async (event) => {
		const data = JSON.parse(event.data);
		const { cmd, value } = data;
		switch (cmd) {
			case "marketplace_orders_update":
				if (item._id === value.item_id && item.itemType === value.item_type && item.currency === value.currency && !!value.data.allowedPriceMin && !!value.data.allowedPriceMax) {
					setPriceMin(value.data.allowedPriceMin / currencyFromConfig.toSmall / currencyFromConfig.divider);
					setPriceMax(value.data.allowedPriceMax / currencyFromConfig.toSmall / currencyFromConfig.divider);
				}
				break;
			default:
				break;
		}
	};

	useEffect(async () => {
		await updateExchangeRates(exchangeCurrency);
	}, [exchangeCurrency]);

	useEffect(async () => {
		if (!Object.keys(exchangeRates).length) {
			await updateExchangeRates(exchangeCurrency);
		}
	}, [exchangeRates]);

	useEffect(() => {
		if (!exchangeRates[exchangeCurrency]) {
			return false;
		}
		calculatePriceAndFee();
	}, [perItemPrice, quantity, exchangeCurrency, exchangeRates]);

	useEffect(() => {
		if (!perItemPrice) {
			return;
		}
		priceHandler(perItemPrice);
	}, [priceMin, priceMax]);

	useEffect(() => {
		setPriceMin(item.priceMin / currencyFromConfig.toSmall / currencyFromConfig.divider);
		setPriceMax(item.priceMax / currencyFromConfig.toSmall / currencyFromConfig.divider);
	}, [item]);

	const createSignalAndController = (id) => {
		if (controllers[id]) {
			controllers[id].abort();
		}
		controllers[id] = new AbortController();
		signals[id] = controllers[id].signal;
	};

	const getExchangeRate = async (currency) => {
		createSignalAndController("getExchangeRate", currency);
		setIsExchangeLoading(true);
		try {
			let result = 0;
			await convertCurrency(signals.getExchangeRate, currency, "USDT", 1, (rate) => {
				result = rate;
			});
			return result;
		} finally {
			setIsExchangeLoading(false);
		}
	};

	const sellItem = async () => {
		setIsPriceConfirmation(false);
		setIsSellInProgress(true);
		createSignalAndController("sellItem");
		try {
			const json = await fetchWithToken("/api/marketplace/sell-item", {
				method: "POST",
				body: JSON.stringify({
					challenge,
					itemId: item._id,
					itemType: item.itemType,
					totalCount: quantity,
					currency: currencyFrom,
					exchangeCurrency,
					perItemPrice: Math.floor(perItemPrice * currencyFromConfig.toSmall),
				}),
				signal: signals.sellItem,
			});
			if (json.success) {
				await refreshItemInfo();
				setIsSellCongratulation(true);
			} else {
				throw new Error(json.error);
			}
		} catch (e) {
			toast(renderToast(t("sell.sellItemPage.sellOrderPostError"), "error_notice"), {
				position: "top-left",
				autoClose: 3000,
				hideProgressBar: true,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
			});
		} finally {
			setIsSellInProgress(false);
		}
	};

	const renderToast = (text, icon) => (
		<div className="content-with-image">
			<img src={`/static/img/icon/${icon}.svg`} alt={icon} />
			<span>{text}</span>
		</div>
	);

	const calculatePriceAndFee = () => {
		const precision = exchangeCurrencyConfig.precisionToBalance || 2;
		const sum = perItemPrice * quantity;
		const fee = sum * (marketplaceConfig.systemFee / 100);
		const totalWithFee = sum + fee;
		const totalExchanged = (totalWithFee / exchangeRates[exchangeCurrency]).toFixed(precision);
		setTotalWithFeeExchanged(totalExchanged);
		setFeeAmount(fee.toFixed(precision));
		setQuantifiedWithFee(totalWithFee.toFixed(precision));
		const sumExchanged = (sum / exchangeRates[exchangeCurrency]).toFixed(precision);
		setQuantifiedExchanged(sumExchanged);
	};

	const updateExchangeRates = async (targetCurrency) => {
		if (exchangeRates[targetCurrency]) {
			return false;
		}
		if (targetCurrency === currencyFrom || !exchangeCurrencyConfig.needExchangeRate) {
			return setExchangeRates({ ...exchangeRates, [targetCurrency]: 1 });
		}
		const rate = await getExchangeRate(targetCurrency);
		setExchangeRates({ ...exchangeRates, [targetCurrency]: rate });
	};

	const priceHandler = (value) => {
		if (Number.isNaN(+value) || value < 0) {
			return;
		}
		setIsLessMinLimit(value > 0 && value < priceMin);
		if (value > priceMax) {
			return setPerItemPrice(priceMax);
		}
		setPerItemPrice(value);
	};

	const currencyHandler = async (selectedCurrency) => {
		setSelectedExchangeCurrency(selectedCurrency);
		setExchangeCurrency(selectedCurrency.value);
		setExchangeCurrencyConfig(getCurrencyConfig(selectedCurrency.value));
	};

	const onSellButtonClick = async () => {
		const captcha = await getCaptchaStatus(fingerprint);
		if (captcha && captcha.is_captcha_required) {
			setChallenge(captcha.challenge);
			setCaptchaWidth(captcha.width);
			setCaptchaHeight(captcha.height);
			setCaptchaMaxDots(captcha.max_dots);
			setCaptchaModalIsOpen(true);
		} else {
			setIsPriceConfirmation(true);
		}
	};

	const onCaptchaSuccess = async () => {
		setCaptchaModalIsOpen(false);
		setIsPriceConfirmation(true);
	};

	const onCaptchaFail = (error) => {
		toast(renderToast(error.message, "error_notice"), {
			position: "top-left",
			autoClose: 3000,
			hideProgressBar: true,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
		});
		setCaptchaModalIsOpen(false);
	};

	return (
		<Fragment>
			<Captcha
				isOpen={captchaModalIsOpen && challenge}
				toggle={() => setCaptchaModalIsOpen(!captchaModalIsOpen)}
				width={captchaWidth}
				height={captchaHeight}
				maxDots={captchaMaxDots}
				onSuccess={onCaptchaSuccess}
				onFail={onCaptchaFail}
				challenge={challenge}
			/>
			<div className="marketplace-sell-price-block">
				<ConfirmSellPriceModal
					isDisplayed={isPriceConfirmation}
					onPriceConfirmed={sellItem}
					onPriceCancelled={() => setIsPriceConfirmation(false)}
					item={item}
					data={{
						perItemPrice,
						quantity,
						currency: currencyFrom,
						exchangeCurrency,
						fee: feeAmount,
						buyerPays: quantifiedWithFee,
						youReceive: quantifiedExchanged,
					}}
				/>
				<SellCongratsModal isDisplayed={isSellCongratulation} onClose={() => setIsSellCongratulation(false)} />
				<div className="price-calculate-wrapper">
					<div className="input-block input-price-block">
						<div className="input-wrapper grow-size">
							<p className="input-label">{t("sell.sellItemPage.enterPricePerItem")}</p>
							<Input
								className="input input-price"
								pattern="[0-9.]+"
								value={perItemPrice}
								onClick={(e) => e.target.select()}
								onChange={(e) => priceHandler(e.target.value)}
								onBlur={perItemPrice < priceMin ? () => priceHandler(priceMin) : null}
							/>
							{isLessMinLimit && <p className="price-calculate-wrapper-warning">min value is {priceMin}</p>}
						</div>
						<div className="input-wrapper">
							<p className="input-label">
								{t("sell.sellItemPage.quantity")} |{" "}
								<a
									href="#"
									onClick={(e) => {
										e.preventDefault();
										setQuantity(Math.min(marketplaceConfig.quantityLimit, item.quantity));
									}}
								>
									{t("sell.sellItemPage.quantityMax")}
								</a>
							</p>
							<QuantityInput className="input-quantity" value={quantity} min={1} max={Math.min(item.quantity || 1, marketplaceConfig.quantityLimit)} handler={setQuantity} />
						</div>
					</div>
					<div className="input-block">
						<div className="input-wrapper">
							<p className="input-label">{t("sell.sellItemPage.chooseCurrency")}</p>
							<Select
								isDisabled={!marketplaceConfig.isExchangeAvailable}
								className="currency-select-container"
								classNamePrefix="currency-select"
								onChange={currencyHandler}
								options={currentCurrencyOptions}
								value={selectedExchangeCurrency}
								isClearable={false}
								isSearchable={false}
								components={{ Option: CurrencySelectOption, ValueContainer: CurrencySelectValue }}
							/>
						</div>
						<div className="input-wrapper grow-size">
							<p className="input-label">{t("sell.sellItemPage.expectedPay")}</p>
							<p className="input expected-pay">
								{`≈ `}
								{isExchangeLoading && <img src={miniLoader} width={18} height={18} alt="loading" />}
								{!isExchangeLoading && `${totalWithFeeExchanged} ${exchangeCurrency}`}
							</p>
						</div>
					</div>
					<RollerButton
						disabled={isDisabledButton}
						isLoading={isSellInProgress}
						className="sell-button"
						icon={sellIcon}
						text={t("main.sell")}
						color="cyan"
						width={100}
						action={onSellButtonClick}
					/>
				</div>
			</div>
		</Fragment>
	);
};

SellItemPriceBlock.propTypes = {
	item: PropTypes.object.isRequired,
	currencyFrom: PropTypes.string.isRequired,
	refreshItemInfo: PropTypes.func.isRequired,
};

export default SellItemPriceBlock;
