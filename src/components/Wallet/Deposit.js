import React, { Component, Fragment } from "react";
import { Helmet } from "react-helmet";
import LazyLoad from "react-lazyload";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { Row, Col } from "reactstrap";
import "react-datepicker/dist/react-datepicker.css";
import QRCode from "qrcode.react";
import PropTypes from "prop-types";
import { CopyToClipboard } from "react-copy-to-clipboard";
import FadeAnimation from "../Animations/FadeAnimation";
import convertCurrency from "../../services/convertCurrency";
import threeDigitDivisor from "../../services/threeDigitDivisor";

import warningImg from "../../assets/img/icon/warning_round.svg";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	isMobile: state.game.isMobile,
	address: state.wallet.address,
	minDeposits: state.wallet.minDeposits,
	selectedCurrency: state.wallet.selectedCurrency,
});

class DepositClass extends Component {
	static propTypes = {
		address: PropTypes.string.isRequired,
		isMobile: PropTypes.bool.isRequired,
		minDeposits: PropTypes.array.isRequired,
		selectedCurrency: PropTypes.object.isRequired,
		t: PropTypes.func.isRequired,
		wsReact: PropTypes.func.isRequired,
	};

	constructor(props) {
		super(props);
		this.copiedTimeout = 0;
		this.state = {
			copied: false,
			inputForConvert2: 0,
			inputForConvert1: 1000,
			isLoading: false,
		};
		this.createSignalAndController();
	}

	componentDidUpdate(prevProps) {
		const prevAddress = JSON.stringify(prevProps.address);
		const thisAddress = JSON.stringify(this.props.address);
		const { isLoading } = this.state;
		if (prevAddress !== thisAddress && isLoading) {
			this.setState({ isLoading: false });
		}
	}

	componentWillUnmount() {
		clearTimeout(this.copiedTimeout);
		if (this.controller) {
			this.controller.abort();
		}
	}

	setCopied = () => {
		clearTimeout(this.copiedTimeout);
		this.setState({
			copied: true,
		});
		this.copiedTimeout = setTimeout(() => {
			this.setState({
				copied: false,
			});
		}, 3000);
	};

	setInputForConvert = (value, inputName, currencyFrom, currencyTo) => {
		value = value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
		const setVal = {};
		setVal[inputName] = value;
		this.setState(setVal);
		const setInput = inputName === "inputForConvert1" ? "inputForConvert2" : "inputForConvert1";
		if (+value > 0) {
			this.createSignalAndController();
			convertCurrency(this.signal, currencyFrom, currencyTo, +value, this.setConvertedValue, setInput).catch((e) => console.error(e));
		} else {
			this.setConvertedValue(0, setInput);
		}
	};

	createSignalAndController = () => {
		if (this.controller) {
			this.controller.abort();
		}
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	};

	setConvertedValue = (inputName, value) => {
		const setVal = {};
		setVal[inputName] = (+value).toFixed(inputName === "inputForConvert2" ? 8 : this.props.selectedCurrency.precision);
		this.setState(setVal);
	};

	handleGenerateAddress = () => {
		const { selectedCurrency } = this.props;
		this.setState({ isLoading: true });
		this.props.wsReact.send(
			JSON.stringify({
				cmd: "generate_bitcoin_wallet_request",
				cmdval: selectedCurrency.balanceKey,
			})
		);
	};

	render() {
		const { selectedCurrency, address, minDeposits, isMobile, t } = this.props;
		const { isLoading } = this.state;
		const currencyMinDeposit = minDeposits.find((item) => item.currency === selectedCurrency.code);

		return (
			<FadeAnimation>
				<div className="currency-operations-content deposit-block">
					<Helmet>
						<title>Your Wallet | RollerCoin.com | Deposit</title>
					</Helmet>
					<Row noGutters={true}>
						<Col xs="12" md="7" className="d-flex flex-column">
							{!isMobile && !!address[selectedCurrency.code] && (
								<div className={`network-warning-block d-flex ${!isMobile ? "order-3" : ""}`}>
									<div className="network-warning-message d-inline-flex order">
										<div className="pic-container">
											<LazyLoad offset={100}>
												<img src={warningImg} width={16} height={16} />
											</LazyLoad>
										</div>
										<div className="text-container">
											<p className="title">{t("depositPage.warning.important")}</p>
											{selectedCurrency.isWrapped && (
												<p>
													<span className="text-bold">
														{threeDigitDivisor(selectedCurrency.wrappedMultiplier, "space")} {selectedCurrency.baseCurrency} = 1 {selectedCurrency.name}
													</span>{" "}
													{t("depositPage.warning.wrapped", { currency: selectedCurrency.name })}
												</p>
											)}
											<p>
												<span>{t("depositPage.warning.sendOnly")}</span>
												<span className="text-bold">{selectedCurrency.baseCurrency ? selectedCurrency.baseCurrency : selectedCurrency.name}</span>
												<span>{t("depositPage.warning.toAddress")}</span>
											</p>
											<p>
												<span>{t("depositPage.warning.makeShure")}</span>
												<span className="text-bold">{selectedCurrency.network}</span>.
											</p>
										</div>
									</div>
								</div>
							)}
							{!!currencyMinDeposit && !!currencyMinDeposit.value && !!address[selectedCurrency.code] && (
								<div className="min-deposit-warning">
									<p className="min-deposit-title">
										{t("depositPage.minDepositTitle")} <br />
										{selectedCurrency.isWrapped && (
											<span className="min-deposit-amount bold-text">
												{threeDigitDivisor(currencyMinDeposit.value * selectedCurrency.wrappedMultiplier, "space")} {selectedCurrency.baseCurrency} (equals{" "}
												{currencyMinDeposit.value} {selectedCurrency.name})
											</span>
										)}
										{!selectedCurrency.isWrapped && (
											<span className="min-deposit-amount bold-text">
												{currencyMinDeposit.value} {selectedCurrency.name}
											</span>
										)}
									</p>
									<p className="small-text">
										{t(`depositPage.minDepositText`, {
											value: threeDigitDivisor(
												selectedCurrency.wrappedMultiplier ? selectedCurrency.wrappedMultiplier * currencyMinDeposit.value : currencyMinDeposit.value,
												"space"
											),
											network: selectedCurrency.network,
											baseCurrency: selectedCurrency.baseCurrency,
										})}
									</p>
								</div>
							)}
							{!!address[selectedCurrency.code] && (
								<Fragment>
									<p className="wallet-text bold-text">
										{t("depositPage.your")} {selectedCurrency.name} {t("depositPage.depAddress")}:
									</p>
									<p className="address-line">{address[selectedCurrency.code]}</p>
									<div className="copy-btn-block">
										<CopyToClipboard text={address[selectedCurrency.code]} onCopy={() => this.setCopied()}>
											<button type="button" className="tree-dimensional-button btn-cyan" disabled={this.state.copied}>
												<span>{this.state.copied ? t("depositPage.copied") : t("depositPage.copyAddress")}</span>
											</button>
										</CopyToClipboard>
									</div>
								</Fragment>
							)}
						</Col>
						{!address[selectedCurrency.code] && (
							<Col xs={12} className="text-center">
								<p>{t("depositPage.waitingAddress")}</p>
								<p className="pb-3">{t("depositPage.waitingAddressGenerate")}</p>
								<button type="button" className="tree-dimensional-button btn-cyan" disabled={isLoading} onClick={this.handleGenerateAddress}>
									<span className="with-horizontal-image">
										<img src="/static/img/icon/refresh.svg" alt="generate address" />
										<span className="btn-text">{t("depositPage.generateAddress")}</span>
									</span>
								</button>
							</Col>
						)}
						<Col xs="12" lg="5" className="qr-code d-flex">
							{!!address[selectedCurrency.code] && <QRCode value={address[selectedCurrency.code]} size={235} />}
						</Col>

						{isMobile && (
							<Col xs={12} className="d-flex flex-column">
								{!!address[selectedCurrency.code] && (
									<div className={`network-warning-block d-flex`}>
										<div className="network-warning-message d-inline-flex order">
											<div className="pic-container">
												<LazyLoad offset={100}>
													<img src={warningImg} width={16} height={16} />
												</LazyLoad>
											</div>
											<div className="text-container">
												<p className="title">{t("depositPage.warning.important")}</p>
												{selectedCurrency.isWrapped && (
													<p>
														<span className="text-bold">
															{threeDigitDivisor(selectedCurrency.wrappedMultiplier, "space")} {selectedCurrency.baseCurrency} = 1 {selectedCurrency.name}
														</span>{" "}
														{t("depositPage.warning.wrapped", { currency: selectedCurrency.name })}
													</p>
												)}
												<p>
													<span>{t("depositPage.warning.sendOnly")}</span>
													<span className="text-bold">{selectedCurrency.baseCurrency ? selectedCurrency.baseCurrency : selectedCurrency.name}</span>
													<span>{t("depositPage.warning.toAddress")}</span>
												</p>
												<p>
													<span>{t("depositPage.warning.makeShure")}</span>
													<span className="text-bold">{selectedCurrency.network}</span>.
												</p>
											</div>
										</div>
									</div>
								)}
							</Col>
						)}
					</Row>
				</div>
			</FadeAnimation>
		);
	}
}

const Deposit = withTranslation("Wallet")(connect(mapStateToProps, null)(DepositClass));
export default Deposit;
