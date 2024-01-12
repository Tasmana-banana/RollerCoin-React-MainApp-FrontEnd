import React, { Component } from "react";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { Col, Form, FormGroup, Input, InputGroup, InputGroupAddon, InputGroupText, Label, Row } from "reactstrap";
import PropTypes from "prop-types";
import validator from "validator";
import Slider from "rc-slider";
import { toast } from "react-toastify";
import ReactPixel from "react-facebook-pixel";
import Select from "react-select";
import * as actionsGame from "../../actions/game";
import getTokensList from "../../services/getTokensList";
import LogFunc from "../../services/LogForRanges";
import decimalAdjust from "../../services/decimalAdjust";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import fetchWithToken from "../../services/fetchWithToken";
import convertCurrency from "../../services/convertCurrency";
import { ReactSelectOption, ReactSelectValue } from "./ReactSelectOption";
import getCurrencyConfig from "../../services/getCurrencyConfig";
import loadScript from "../../services/loadScript";
import FadeAnimation from "../Animations/FadeAnimation";

import "rc-slider/assets/index.css";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	balance: state.game.balance,
	rollerCurrencies: state.wallet.rollerCurrencies,
	crowdfundingTokensDiscounts: state.wallet.crowdfundingTokensDiscounts,
	replenishmentModalStats: state.game.replenishmentModalStats,
	language: state.game.language,
	minDeposits: state.wallet.minDeposits,
});

// Map Redux actions to component props
const mapDispatchToProps = (dispatch) => ({
	setReplenishmentModalStats: (state) => dispatch(actionsGame.setReplenishmentModalStats(state)),
});

const options = {
	autoConfig: true, // set pixel's autoConfig
	debug: false, // enable logs
};
ReactPixel.init(process.env.FACEBOOK_PIXEL_ID, {}, options);

class BuyTokenFormClass extends Component {
	static propTypes = {
		balance: PropTypes.object.isRequired,
		wsReact: PropTypes.object.isRequired,
		rollerCurrencies: PropTypes.array.isRequired,
		crowdfundingTokensDiscounts: PropTypes.object.isRequired,
		showContactForm: PropTypes.bool.isRequired,
		contactInformationExists: PropTypes.bool.isRequired,
		replenishmentModalStats: PropTypes.object.isRequired,
		setReplenishmentModalStats: PropTypes.func.isRequired,
		setShowContactForm: PropTypes.func.isRequired,
		setTransactionsList: PropTypes.func.isRequired,
		minDeposits: PropTypes.array.isRequired,
		t: PropTypes.func.isRequired,
		language: PropTypes.string.isRequired,
	};

	constructor(props) {
		super(props);
		this.optionsDefaultForSelect = this.props.rollerCurrencies
			.filter((item) => item.usedToBuyRLT)
			.map((currency) => ({
				value: currency.code,
				label: 1,
				discount: this.props.crowdfundingTokensDiscounts.find((obj) => obj.currency === currency.code)?.amount || 0,
				disabledDeposits: currency.disabledDeposits,
			}));
		this.state = {
			form: {
				privacy: false,
				amount: 0,
			},
			validate: {
				privacy: null,
				amount: null,
			},
			errorSave: null,
			errorsTypes: {
				amount: null,
			},
			optionsForSelect: this.optionsDefaultForSelect,
			selectedCurrency: this.optionsDefaultForSelect[0],

			exchangeRates: this.props.rollerCurrencies.filter((item) => item.usedToBuyRLT).reduce((acc, current) => ({ ...acc, [current.code]: 1 }), {}),
			newExchangeRates: 1,
			limitsForOperation: {
				min: +process.env.MINIMAL_PAYMENT_IN_RLT,
				max: +process.env.MAX_AMOUNT_FOR_ONE_USER,
			},
			hideTokenForm: false,
			isLoading: false,
		};
		this.requiredFields = ["privacy", "amount"];
		this.convertToCurrency = "usdt";
		this.sliderConfig = {
			minpos: 1,
			maxpos: 100,
			minval: +process.env.MINIMAL_PAYMENT_IN_RLT,
			maxval: +process.env.MAX_AMOUNT_FOR_ONE_USER,
			points: [1, 10, 1000, 5000, 10000],
		};
		this.logSlider = new LogFunc(this.sliderConfig);
		this.controller = new AbortController();
		this.signal = this.controller.signal;
		this.updateRatesInterval = 0;
		this.pixelScript = null;
	}

	componentDidMount() {
		this.setField("500", "amount");
		this.updateRates();
		this.updateRatesInterval = setInterval(this.updateRates, 60000);
	}

	componentWillUnmount() {
		clearInterval(this.updateRatesInterval);
		if (this.controller) {
			this.controller.abort();
		}
		if (this.pixelScript) {
			this.pixelScript.remove();
		}
	}

	componentDidUpdate(prevProps, prevStates) {
		if (this.state.form.amount !== prevStates.form.amount) {
			this.setState({ selectedCurrency: { ...this.state.selectedCurrency, ...{ label: this.needToPayAtCurrency(this.state.selectedCurrency.value) } } });
		}
		if (prevStates.selectedCurrency.value !== this.state.selectedCurrency.value) {
			this.setField(this.state.form.amount.toString(), "amount");
		}
		if (prevStates.limitsForOperation.max !== this.state.limitsForOperation.max) {
			this.validateRequestInput(this.state.form.amount, "amount");
		}
		if (JSON.stringify(Object.values(this.state.exchangeRates)) !== JSON.stringify(Object.values(prevStates.exchangeRates)) || prevStates.form.amount !== this.state.form.amount) {
			this.setState({
				selectedCurrency: { ...this.state.selectedCurrency, ...{ label: this.needToPayAtCurrency(this.state.selectedCurrency.value) } },
				optionsForSelect: this.state.optionsForSelect.map((obj) => ({ ...obj, ...{ label: this.needToPayAtCurrency(obj.value), discount: obj.discount } })),
			});
		}
		if (!this.props.showContactForm && prevProps.showContactForm) {
			this.submitRequestForm();
		}
		if (Object.keys(this.state.exchangeRates).length !== Object.keys(prevStates.exchangeRates).length) {
			this.updateRates();
		}
	}

	updateRates = async () => {
		const { rollerCurrencies } = this.props;
		const currenciesToExchange = Object.keys(this.state.exchangeRates).filter((code) => {
			const matchCurrency = rollerCurrencies.find((currency) => currency.code === code);
			return matchCurrency && matchCurrency.needExchangeRate;
		});
		await Promise.all(currenciesToExchange.map((code) => convertCurrency(this.signal, `${code}`, this.convertToCurrency, 1, this.setExchangeRate, code)));
	};

	setMaxAmountValue = () => {
		this.setField(`${this.getMaxAmountByBalance()}`, "amount");
	};

	setField = (value, field) => {
		if (value !== "" && field === "amount") {
			value = value.slice(0, 6);
			value = validator.toInt(value) || 0;
		}
		if (Object.keys(this.state.validate).includes(field)) {
			this.validateRequestInput(value, field);
		}
		this.setState({
			form: { ...this.state.form, ...{ [field]: value } },
		});
	};

	validateRequestInput = (value, field) => {
		switch (field) {
			case "amount":
				this.setState({
					validate: {
						...this.state.validate,
						...{
							amount: validator.isInt(value.toString(), {
								min: this.state.limitsForOperation.min,
								max: this.state.limitsForOperation.max,
							}),
						},
					},
				});
				if (value.length === 0) {
					return this.setState({
						errorsTypes: {
							...this.state.errorsTypes,
							...{
								amount: "required",
							},
						},
					});
				}
				if (+value < this.state.limitsForOperation.min) {
					return this.setState({
						errorsTypes: {
							...this.state.errorsTypes,
							...{
								amount: "min_number",
							},
						},
					});
				}
				if (+value > this.state.limitsForOperation.max) {
					return this.setState({
						errorsTypes: {
							...this.state.errorsTypes,
							...{
								amount: "max_number",
							},
						},
					});
				}
				this.setState({
					errorsTypes: {
						...this.state.errorsTypes,
						...{
							amount: null,
						},
					},
				});
				break;
			case "privacy":
				this.setState({
					validate: { ...this.state.validate, ...{ privacy: value } },
				});
				break;
			default:
				break;
		}
	};

	setExchangeRate = (currency, rate) => {
		const currencyData = this.props.rollerCurrencies.find((obj) => obj.code === currency);
		this.setState({
			exchangeRates: { ...this.state.exchangeRates, [currency]: (+rate * 1000000) / currencyData.toSmall },
		});
	};

	getMaxAmountByBalance = () => {
		const selectedCurrencyData = this.props.rollerCurrencies.find((obj) => obj.code === this.state.selectedCurrency.value);
		const balanceAtCurrencyToSAT = Math.floor(this.props.balance[selectedCurrencyData.code] * this.state.exchangeRates[selectedCurrencyData.code]);
		return Math.floor((balanceAtCurrencyToSAT || 0) / (+process.env.EXHANGE_RATE * this.getDiscountFactor(selectedCurrencyData.code)));
	};

	getDiscountFactor = (currency) => {
		let discountFactor = 1;
		const discountConfig = this.props.crowdfundingTokensDiscounts.find((obj) => obj.currency === currency.toLowerCase());
		if (discountConfig && discountConfig.amount) {
			discountFactor = (100 - discountConfig.amount) / 100;
		}
		return discountFactor;
	};

	needToPayAtCurrency = (currency) => {
		const currencyData = this.props.rollerCurrencies.find((obj) => obj.code === currency);
		const needToPayAtSAT = Math.ceil(this.state.form.amount * process.env.EXHANGE_RATE * this.getDiscountFactor(currency));
		const needToPayAtCurrency = Math.ceil(needToPayAtSAT / this.state.exchangeRates[currencyData.code]);
		return decimalAdjust(needToPayAtCurrency / currencyData.toSmall, currencyData.precision);
	};

	submitRequestForm = async (e = null) => {
		const { t, rollerCurrencies } = this.props;
		if (e) {
			e.preventDefault();
			if (!this.props.contactInformationExists) {
				return this.props.setShowContactForm(true);
			}
		}

		if (this.state.form.amount > this.getMaxAmountByBalance()) {
			return this.openReplenishmentModal();
		}

		const rltConfig = rollerCurrencies.find((item) => item.code === "rlt");
		const responseBody = { privacy: this.state.form.privacy, amount: this.state.form.amount * rltConfig.toSmall, currency: this.state.selectedCurrency.value };
		this.setState({ isLoading: true });

		try {
			this.createSignalAndController();
			const json = await fetchWithToken("/api/crowdfunding/buy-token", {
				method: "POST",
				signal: this.signal,
				body: JSON.stringify(responseBody),
			});
			if (!json.success) {
				toast(this.constructor.renderToast(json.error, "error_notice"), {
					position: "top-left",
					autoClose: 3000,
					hideProgressBar: true,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
				});
				return this.setState({
					errorSave: json.error,
					isLoading: false,
				});
			}
			toast(this.constructor.renderToast(t("tokens.success"), "success_notice"), {
				position: "top-left",
				autoClose: 3000,
				hideProgressBar: true,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
			});
			this.props.wsReact.send(
				JSON.stringify({
					cmd: "balance_request",
				})
			);
			ReactPixel.trackCustom("PurchaseToken", {
				value: this.state.form.amount,
				currency: "RLT",
			});
			ReactPixel.trackCustom("Purchase", {
				value: this.state.form.amount,
				currency: "RLT",
			});
			this.pixelScript = loadScript(process.env.PIXEL_CONVERSION_BUY_TOKEN_URL, true, null, [], true);
			await getTokensList(this.signal, this.props.setTransactionsList);
			this.setField(`${process.env.MINIMAL_PAYMENT_IN_RLT}`, "amount");
			this.setField(false, "privacy");
			return this.setState({
				successSaved: true,
				isLoading: false,
			});
		} catch (error) {
			console.error(error);
		}
	};

	static renderToast(text, icon) {
		return (
			<div className="content-with-image">
				<img src={`/static/img/icon/${icon}.svg`} alt={icon} />
				<span>{text}</span>
			</div>
		);
	}

	calcPos = (pos) => {
		const val = this.logSlider.value(pos);
		const stepsToVal = {
			0: 1,
			200: 10,
			500: 20,
			1000: 200,
			5000: 1000,
			10000: 1500,
			50000: 2000,
		};
		const keys = Object.keys(stepsToVal).reverse();
		for (let i = 0; i < keys.length; i += 1) {
			const key = keys[i];
			if (val >= key) {
				return Math.round(val / stepsToVal[key]) * stepsToVal[key];
			}
		}
		return Math.round(val);
	};

	findMarks = () => {
		const points = [1, 10, 1000, 5000, 10000, 50000];
		return points.reduce((acc, point) => {
			const returnVal = {};
			returnVal[this.logSlider.position(point)] = point;
			return { ...acc, ...returnVal };
		}, {});
	};

	setSelectedCurrency = (selected) => {
		this.setState({
			selectedCurrency: selected,
		});
	};

	createSignalAndController = () => {
		if (this.controller) {
			this.controller.abort();
		}
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	};

	getOldPriceForDiscount = () => {
		const { selectedCurrency } = this.state;
		const currencyData = this.props.rollerCurrencies.find((obj) => obj.code === selectedCurrency.value);
		const needToPayAtSAT = Math.ceil(this.state.form.amount * process.env.EXHANGE_RATE);
		const needToPayAtCurrency = Math.ceil(needToPayAtSAT / this.state.exchangeRates[currencyData.code]);
		return decimalAdjust(needToPayAtCurrency / currencyData.toSmall, currencyData.precision);
	};

	openReplenishmentModal = () => {
		const { replenishmentModalStats, setReplenishmentModalStats } = this.props;
		const { form, selectedCurrency, newExchangeRates } = this.state;
		const RLTConfig = getCurrencyConfig("RLT");
		setReplenishmentModalStats({
			...replenishmentModalStats,
			isOpen: true,
			skipPaymentMethod: true,
			price: form.amount * RLTConfig.toSmall,
			currency: selectedCurrency.value,
			exchangeRate: newExchangeRates,
			itemName: "",
			quantity: 1,
		});
	};

	isMinCurrencyAmount = (currencyCode) => {
		const { selectedCurrency, form } = this.state;
		const discountData = this.props.crowdfundingTokensDiscounts.find((obj) => obj.currency === selectedCurrency.value.toLowerCase());
		const discountPercent = discountData?.amount || 0;
		const minDeposit = this.props.minDeposits.find((item) => item.currency === currencyCode);
		const amountWithDiscount = Math.floor(form.amount * (1 - discountPercent / 100)) || 1;
		return amountWithDiscount > this.getMaxAmountByBalance() && amountWithDiscount < minDeposit.value;
	};

	render() {
		const { form, validate, errorsTypes, errorSave, selectedCurrency, optionsForSelect, isLoading } = this.state;
		const { t, language } = this.props;
		const checkShowError = (field) => !validate[field] && validate[field] !== null;
		const codeToError = {
			required: t("tokens.required"),
			min_number: `${t("tokens.minimum")} ${this.state.limitsForOperation.min} RLT`,
		};
		const isDiscountExists = optionsForSelect.some((item) => !!item.discount);
		return (
			<FadeAnimation>
				<div hidden={this.props.showContactForm}>
					<div className="header-form text-center bold-text">
						<p>{t("tokens.howMany")}</p>
					</div>
					<Form onSubmit={this.submitRequestForm}>
						<Row noGutters={true}>
							<Col xs="12" lg="9" className="pdr-lg-10">
								<FormGroup className="fg-with-slider">
									<Label className="w-100">
										<Row noGutters={true} className="align-items-center justify-content-between flex-wrap">
											<Col xs={12} lg={12} className="mb-lg-3">
												<p>{t("tokens.chooseAmount")}</p>
											</Col>
										</Row>
									</Label>
									<Slider
										value={this.logSlider.position(form.amount)}
										step={1}
										min={this.sliderConfig.minpos}
										max={this.sliderConfig.maxpos}
										onChange={(x) => this.setField(`${this.calcPos(x)}`, "amount")}
										marks={this.findMarks()}
									/>
								</FormGroup>
							</Col>
							<Col xs="12" lg="3" className="pdl-lg-10">
								<FormGroup>
									<Label for="amount">
										{t("tokens.manually")} |{" "}
										<span className="cyan-text link-text" onClick={this.setMaxAmountValue}>
											{t("tokens.max")}
										</span>
									</Label>
									<InputGroup className="roller-input-group">
										<Input
											type="text"
											name="amount"
											id="amount"
											required
											value={form.amount}
											onChange={(e) => this.setField(e.target.value, e.target.id)}
											className={`roller-input-text ${checkShowError("amount") ? " has-error" : ""}`}
										/>
										<InputGroupAddon addonType="append">
											<InputGroupText>RLT</InputGroupText>
										</InputGroupAddon>
									</InputGroup>
								</FormGroup>
							</Col>
							<div className="validate-error-block">
								{checkShowError("amount") && !!errorsTypes.amount && <p className="w-100 text-right error-text danger-text">{codeToError[errorsTypes.amount]}</p>}
							</div>
							<Col xs="12" className="info-container">
								<Row noGutters={true} className="justify-content-end">
									{this.getOldPriceForDiscount() > selectedCurrency.label && isDiscountExists && (
										<Col xs={12} lg={8} className="token-discount-container">
											<Row className="token-discount-wrapper">
												<Col xs={4} lg={3}>
													<p className="token-discount-title">{t("tokens.amount")}</p>
													<p className="token-discount-item token-discount-rlt">{`${form.amount} RLT`}</p>
												</Col>
												<Col xs={4}>
													<p className="token-discount-title">{t("tokens.oldPrice")}</p>
													<p className="token-discount-item token-discount-old">{this.getOldPriceForDiscount()}</p>
												</Col>
												<Col xs={4} lg={5}>
													<p className="token-discount-title">{t("tokens.newPrice")}</p>
													<p className="token-discount-item token-discount-new">{selectedCurrency.label}</p>
												</Col>
											</Row>
										</Col>
									)}
									<Col xs="6" lg={{ size: 4 }} className="info-block">
										<p className="header-info-block mgb-8">{t("tokens.toPayIn")}</p>
										<Select
											className="rollercoin-select-container w-100"
											classNamePrefix="rollercoin-select"
											onChange={this.setSelectedCurrency}
											options={optionsForSelect}
											value={selectedCurrency}
											isClearable={false}
											isSearchable={false}
											components={{ Option: ReactSelectOption, ValueContainer: ReactSelectValue }}
										/>
									</Col>
								</Row>
							</Col>
							<div className="w-100 wrapper-line" />
							<Col xs="12" className="d-flex justify-content-center mgb-16">
								<FormGroup check>
									<Input
										type="checkbox"
										className="roller-checkbox"
										id="privacy"
										name="privacy"
										required
										checked={form.privacy}
										onChange={(e) => this.setField(e.target.checked, e.target.id)}
									/>
									<Label for="privacy" className="form-check-label small-text">
										<span className="text-danger">*</span> {t("tokens.accept")}{" "}
										<a href={`${getLanguagePrefix(language)}/terms`} target="_blank" rel="noopener noreferrer">
											{t("tokens.terms")}
										</a>
										,{" "}
										<a href={`${getLanguagePrefix(language)}/privacy`} target="_blank" rel="noopener noreferrer">
											{t("tokens.privacy")}
										</a>{" "}
										{t("tokens.and")}{" "}
										<a href={`${getLanguagePrefix(language)}/disclaimer`} target="_blank" rel="noopener noreferrer">
											{t("tokens.disclaimer")}
										</a>
										.
									</Label>
								</FormGroup>
							</Col>
							<Col xs="12" lg={{ size: 6, offset: 3 }}>
								<div className="btn-submit">
									<button
										type="submit"
										className="tree-dimensional-button btn-cyan w-100"
										disabled={
											!this.requiredFields.every((val) => validate[val]) === true ||
											isLoading ||
											this.isMinCurrencyAmount(selectedCurrency.value) ||
											(selectedCurrency.disabledDeposits && form.amount > this.getMaxAmountByBalance())
										}
									>
										<span className="with-horizontal-image">
											<img src="/static/img/wallet/buy_tokens.svg" alt="buy_tokens" />
											<span className="btn-text">{t("tokens.buyTokens")}</span>
										</span>
									</button>
								</div>
							</Col>
						</Row>
					</Form>
					{!!errorSave && <p className={"text-danger text-center"}>{errorSave}</p>}
				</div>
			</FadeAnimation>
		);
	}
}

const BuyTokenForm = withTranslation("Wallet")(connect(mapStateToProps, mapDispatchToProps)(BuyTokenFormClass));
export default BuyTokenForm;
