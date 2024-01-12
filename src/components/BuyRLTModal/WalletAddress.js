import React, { Fragment } from "react";
import QRCode from "qrcode.react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import PropTypes from "prop-types";
import { Col, Row } from "reactstrap";
import decimalAdjust from "../../services/decimalAdjust";
import threeDigitDivisor from "../../services/threeDigitDivisor";

class WalletAddress extends React.Component {
	static propTypes = {
		isMobile: PropTypes.bool.isRequired,
		price: PropTypes.number.isRequired,
		address: PropTypes.string.isRequired,
		exchangeRateTime: PropTypes.string.isRequired,
		currency: PropTypes.object.isRequired,
		wsReact: PropTypes.object.isRequired,
		exchangeRate: PropTypes.number,
		priceInCurrency: PropTypes.number.isRequired,
		discount: PropTypes.number.isRequired,
		t: PropTypes.func.isRequired,
		minDeposits: PropTypes.array.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			isCopied: false,
			isLoading: false,
		};
		this.copiedTimeout = null;
	}

	componentWillUnmount() {
		clearTimeout(this.copiedTimeout);
	}

	setCopied = () => {
		clearTimeout(this.copiedTimeout);
		this.setState({ isCopied: true });
		this.copiedTimeout = setTimeout(() => this.setState({ isCopied: false }), 3000);
	};

	handleGenerateAddress = () => {
		const { wsReact, currency } = this.props;
		this.setState({ isLoading: true });
		wsReact.send(
			JSON.stringify({
				cmd: "generate_bitcoin_wallet_request",
				cmdval: currency.balanceKey,
			})
		);
	};

	render() {
		const { price, address, exchangeRateTime, currency, exchangeRate, priceInCurrency, discount, t, minDeposits } = this.props;
		const { isCopied, isLoading } = this.state;
		const exchangeDiscountRate = decimalAdjust(((100 - discount) * exchangeRate) / 100, currency.precision);
		const exchangeRateFormatted = decimalAdjust(exchangeRate, currency.precision);
		const priceInCurrencyFormatted = decimalAdjust(priceInCurrency, currency.precision);
		const currencyMinDeposit = minDeposits.find((item) => item.currency === currency.value);
		const multipliedNumberFormatter = decimalAdjust(priceInCurrencyFormatted * currency.wrappedMultiplier, currency.precision);

		return (
			<div className="wallet-address-wrapper">
				<h2 className="total-text">{t("replenishmentModal.totalAmount")}</h2>
				<h3 className="wallet-address-amount-payment">{price} RLT</h3>
				<p className="wallet-address-description">
					{t("replenishmentModal.toComplete")}
					<span className="description-select">
						{multipliedNumberFormatter} {currency.isWrapped ? currency.baseCurrency : currency.label}
					</span>
					{t("replenishmentModal.followingAddress")}
				</p>

				{!!currencyMinDeposit && !!currencyMinDeposit.value && (
					<Fragment>
						<p className="gold-title">
							ⓘ {t("replenishmentModal.minDepositTitle")}
							{currency.isWrapped && (
								<span>
									{threeDigitDivisor(currencyMinDeposit.value * currency.wrappedMultiplier, "space")} {currency.baseCurrency} (equals {currencyMinDeposit.value} {currency.name})
								</span>
							)}
							{!currency.isWrapped && (
								<span className="min-deposit-amount bold-text">
									{currencyMinDeposit.value} {currency.name}
								</span>
							)}
						</p>
						<p className="min-deposit-small-text">
							{t(`replenishmentModal.minDepositText`, {
								value: threeDigitDivisor(currency.wrappedMultiplier ? currency.wrappedMultiplier * currencyMinDeposit.value : currencyMinDeposit.value, "space"),
								network: currency.network,
								baseCurrency: currency.baseCurrency,
							})}
						</p>
					</Fragment>
				)}

				{address && (
					<div className="warning-container">
						<p className="gold-title">
							<span>ⓘ {t("replenishmentModal.warning.important")}</span>
							{currency.isWrapped && (
								<Fragment>
									<span className="text-bold">
										{"("}
										{threeDigitDivisor(currency.wrappedMultiplier, "space")} {currency.baseCurrency} = 1 {currency.name}
									</span>{" "}
									{t("replenishmentModal.warning.wrapped")}
									{")"}
								</Fragment>
							)}
						</p>

						<p className="warning-small-text">
							{currency.isWrapped && <span>{t("replenishmentModal.warning.weUse", { currency: currency.name })}</span>}
							<span>{t("replenishmentModal.warning.sendOnly")}</span>
							<span className="text-bold">{currency.baseCurrency ? currency.baseCurrency : currency.name}</span>
							<span>{t("replenishmentModal.warning.toAddress")}</span>
							<span>{t("replenishmentModal.warning.makeShure")}</span>
							<span className="text-bold">{currency.network}</span>.
						</p>
					</div>
				)}

				{address && (
					<div className="wallet-address-main">
						<Row noGutters={true}>
							<Col xs={8} sm={9}>
								<div className="wallet-address-info">
									<h3 className="info-header done">
										{currency.label} {t("replenishmentModal.walletAddress")}
									</h3>
									<p className="info-wallet">{address}</p>
									<div>
										<CopyToClipboard text={address} onCopy={this.setCopied}>
											<button type="button" className="tree-dimensional-button btn-cyan" disabled={isCopied}>
												<span className={`btn-text ${isCopied ? "btn-icon " : "btn-copy-icon"} text-wrapper flex-row w-100`}>
													{isCopied ? t("replenishmentModal.copied") : t("replenishmentModal.copy")}
												</span>
											</button>
										</CopyToClipboard>
									</div>
								</div>
							</Col>
							<Col xs={4} sm={3} className="d-flex justify-content-end">
								<div className="wallet-address-qrcode">
									<QRCode value={address} size={128} />
								</div>
							</Col>
						</Row>
					</div>
				)}
				{!address && (
					<div className="wallet-no-address">
						<p className="no-address-text">{t("replenishmentModal.waitingAddress")}</p>
						<p className="no-address-text">{t("replenishmentModal.waitingAddressGenerate")}</p>
						<button type="button" className="tree-dimensional-button btn-cyan generate-btn" disabled={isLoading} onClick={this.handleGenerateAddress}>
							<span className="with-horizontal-image">
								<img src="/static/img/icon/refresh.svg" alt="generate address" />
								<span className="btn-text">{t("replenishmentModal.generateAddress")}</span>
							</span>
						</button>
					</div>
				)}
				<div className="wallet-address-transaction-info">
					<p className="exchange-fixed-time">
						{t("replenishmentModal.exchangeRate")}
						<span className="time">{exchangeRateTime}</span>
					</p>
					<p className="fixed-rate">
						{t("replenishmentModal.fixedRate")}
						<span className="rate">1 RLT = </span>
						{discount !== 0 && <span className="rate-old">{exchangeRateFormatted}</span>}
						<span className={discount !== 0 ? "rate-new" : "rate"}>
							{discount !== 0 ? exchangeDiscountRate : exchangeRateFormatted} {currency.label}
						</span>
					</p>
				</div>
			</div>
		);
	}
}

export default WalletAddress;
