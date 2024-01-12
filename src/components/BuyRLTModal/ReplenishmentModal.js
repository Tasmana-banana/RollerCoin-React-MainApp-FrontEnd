import React, { Component, Fragment } from "react";
import { Modal, ModalBody } from "reactstrap";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import { toast } from "react-toastify";
import * as actionsWallet from "../../actions/wallet";
import * as actionsGame from "../../actions/game";
import NotEnoughRLT from "./NotEnoughRLT";
import PaymentReceived from "./PaymentReceived";
import InvoiceCanceled from "./InvoiceCanceled";
import PaymentConfirmed from "./PaymentConfirmed";
import WalletAddress from "./WalletAddress";
import fetchWithToken from "../../services/fetchWithToken";
import getCurrencyConfig from "../../services/getCurrencyConfig";
import fixUSDTokensKey from "../../services/fixUSDTokensKey";
import decimalAdjust from "../../services/decimalAdjust";

import "../../assets/scss/Game/ReplenishmentModal.scss";
import closeIcon from "../../assets/img/header/close_menu.svg";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	rollerCurrencies: state.wallet.rollerCurrencies,
	crowdfundingTokensDiscounts: state.wallet.crowdfundingTokensDiscounts,
	balance: state.game.balance,
	currentMiningCurrency: state.user.currentMiningCurrency,
	replenishmentModalStats: state.game.replenishmentModalStats,
	wsNode: state.webSocket.wsNode,
	address: state.wallet.address,
	isMobile: state.game.isMobile,
	minDeposits: state.wallet.minDeposits,
});

// Map Redux actions to component props
const mapDispatchToProps = (dispatch) => ({
	setAddress: (state) => dispatch(actionsWallet.setAddress(state)),
	setReplenishmentModalStats: (state) => dispatch(actionsGame.setReplenishmentModalStats(state)),
});

class ReplenishmentModal extends Component {
	static propTypes = {
		rollerCurrencies: PropTypes.object.isRequired,
		crowdfundingTokensDiscounts: PropTypes.object.isRequired,
		isMobile: PropTypes.bool.isRequired,
		address: PropTypes.object.isRequired,
		wsReact: PropTypes.object.isRequired,
		wsNode: PropTypes.object.isRequired,
		minDeposits: PropTypes.array.isRequired,
		setAddress: PropTypes.func.isRequired,
		t: PropTypes.func.isRequired,
		replenishmentModalStats: PropTypes.object.isRequired,
		setReplenishmentModalStats: PropTypes.func.isRequired,
	};

	static renderToast = (text, icon) => (
		<div className="content-with-image">
			<img src={`/static/img/icon/${icon}.svg`} alt={icon} />
			<span>{text}</span>
		</div>
	);

	constructor(props) {
		super(props);
		this.optionsDefaultForSelect = this.props.rollerCurrencies
			.filter((item) => item.usedToBuyRLT && !item.disabledDeposits)
			.map((currency) => ({
				icon: currency.img,
				name: currency.name,
				network: currency.network,
				value: currency.code,
				label: currency.name,
				balanceKey: currency.balanceKey,
				precision: currency.precision,
				discount: this.props.crowdfundingTokensDiscounts.find((obj) => obj.currency === currency.code)?.amount || 0,
				isWrapped: currency.isWrapped,
				wrappedMultiplier: currency.wrappedMultiplier,
				baseCurrency: currency.baseCurrency,
			}));
		this.stepOfBuyRLT = {
			selectCurrency: "SELECT_CURRENCY",
			getWalletAddress: "GET_WALLET_ADDRESS",
			pendingTransaction: "PENDING_TRANSACTION",
			errorTransaction: "ERROR_TRANSACTION",
			successTransaction: "SUCCESS_TRANSACTION",
		};
		this.state = {
			isLoading: false,
			currentStep: this.stepOfBuyRLT.selectCurrency,
			selectedCurrency: this.optionsDefaultForSelect[0],
			optionsForSelect: this.optionsDefaultForSelect,
			amountToBuy: 0,
			exchange: 0,
			formattedExchangeRateTime: "00:00",
			exchangeRateTime: null,
			exchangeRate: 0,
			priceInCurrency: 0,
			discount: 0,
		};
		this.exchangeRateTimer = null;
		this.controllers = {};
		this.signals = {};
		this.toastConfig = {
			position: "top-left",
			autoClose: 3000,
			hideProgressBar: true,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
		};
	}

	componentDidMount() {
		const { replenishmentModalStats, wsReact, minDeposits, wsNode } = this.props;
		const RLTConfig = getCurrencyConfig("RLT");
		const adjustedPrice = decimalAdjust(replenishmentModalStats.price / RLTConfig.toSmall, RLTConfig.precision);
		const amountToBuy = Math.max(+adjustedPrice, 1);
		const availableCurrencyForPayment = minDeposits.filter(({ currency, value }) => ["usdt", "busd"].includes(currency) && value > amountToBuy).map(({ currency }) => currency);
		const filteredOptions = this.optionsDefaultForSelect.filter(({ value }) => !availableCurrencyForPayment.includes(value));
		this.setState({ optionsForSelect: filteredOptions, amountToBuy });

		if (replenishmentModalStats.skipPaymentMethod) {
			const selectedCurrency = this.optionsDefaultForSelect.find(({ value }) => value === replenishmentModalStats.currency);
			this.setState({
				amountToBuy,
				currentStep: this.stepOfBuyRLT.getWalletAddress,
				selectedCurrency,
			});
		}
		wsReact.setListenersMessage({ generate_wallet: this.onWSMessage });
		if (wsNode && !wsNode.listenersMessage.delayed_purchase) {
			wsNode.setListenersMessage({ delayed_purchase: this.onWSNodeMessage });
		}
	}

	componentDidUpdate = async (prevProps, prevState) => {
		const { amountToBuy, exchangeRateTime } = this.state;
		const { replenishmentModalStats } = this.props;
		if (prevState.exchangeRateTime !== exchangeRateTime && exchangeRateTime) {
			clearInterval(this.exchangeRateTimer);
			this.exchangeRateTimer = setInterval(this.updateTime, 1000);
		}
		if (prevState.amountToBuy !== amountToBuy && amountToBuy && replenishmentModalStats.skipPaymentMethod) {
			await this.getData();
		}
	};

	componentWillUnmount() {
		const { wsReact, wsNode } = this.props;
		if (this.exchangeRateTimer) {
			clearInterval(this.exchangeRateTimer);
		}
		wsReact.removeListenersMessage("generate_wallet");
		if (wsNode) {
			wsNode.removeListenersMessage("delayed_purchase");
		}
		Object.keys(this.controllers).forEach((key) => {
			if (this.controllers[key]) {
				this.controllers[key].abort();
			}
		});
	}

	createSignalAndController = (id) => {
		if (this.controllers[id]) {
			this.controllers[id].abort();
		}
		this.controllers[id] = new AbortController();
		this.signals[id] = this.controllers[id].signal;
	};

	getTimeRemaining = (endTime) => {
		const t = Date.parse(endTime) - Date.now();
		const seconds = Math.floor((t / 1000) % 60);
		const minutes = Math.floor((t / 1000 / 60) % 60);
		return { total: t, minutes, seconds };
	};

	updateTime = () => {
		const { exchangeRateTime } = this.state;
		const t = this.getTimeRemaining(exchangeRateTime);
		const minutes = `0${t.minutes}`.slice(-2);
		const second = `0${t.seconds}`.slice(-2);
		this.setState({ formattedExchangeRateTime: `${minutes}:${second}` });
		if (t.total <= 0) {
			toast(this.constructor.renderToast("Time expired", "error_notice"), this.toastConfig);
			this.setState({ formattedExchangeRateTime: "00:00" });
			return clearInterval(this.exchangeRateTimer);
		}
	};

	setSelectedCurrency = (selected) => this.setState({ selectedCurrency: selected });

	onWSNodeMessage = (event) => {
		const data = JSON.parse(event.data);
		const { cmd, value } = data;
		switch (cmd) {
			case "delayed_purchase_token_updated":
				this.handlePurchaseUpdate(value);
				break;
			default:
				break;
		}
	};

	onWSMessage = (event) => {
		const data = JSON.parse(event.data);
		const { cmd, cmdval } = data;
		switch (cmd) {
			case "generate_bitcoin_wallet_response":
				this.handleAddress(cmdval);
				break;
			default:
				break;
		}
	};

	handlePurchaseUpdate = (value) => {
		const { wsReact } = this.props;
		const { wait_for_confirmations_date_to: expireTime, status_code: statusCode } = JSON.parse(value);
		switch (statusCode) {
			case 1:
				clearInterval(this.exchangeRateTimer);
				this.setState({ formattedExchangeRateTime: "00:00", exchangeRateTime: expireTime, currentStep: this.stepOfBuyRLT.pendingTransaction });
				break;
			case 2:
				clearInterval(this.exchangeRateTimer);
				this.setState({ currentStep: this.stepOfBuyRLT.errorTransaction });
				break;
			case 4:
				clearInterval(this.exchangeRateTimer);
				wsReact.send(JSON.stringify({ cmd: "balance_request" }));
				this.setState({ currentStep: this.stepOfBuyRLT.successTransaction });
				break;
			default:
				break;
		}
	};

	handleAddress = (data) => this.props.setAddress(fixUSDTokensKey(data));

	getData = async () => {
		const { amountToBuy, selectedCurrency } = this.state;
		this.createSignalAndController("buyRLT");
		const RLTConfig = getCurrencyConfig("RLT");
		this.setState({ isLoading: true });
		try {
			const response = await fetchWithToken("/api/crowdfunding/delayed-purchase-token", {
				method: "POST",
				body: JSON.stringify({
					amount: Math.ceil(amountToBuy * RLTConfig.toSmall),
					currency: selectedCurrency.value,
				}),
				signal: this.signals.buyRLT,
			});
			if (!response.success) {
				toast(this.constructor.renderToast(response.error, "error_notice"), this.toastConfig);
				return this.setState({ isLoading: false });
			}
			this.setState({
				isLoading: false,
				currentStep: this.stepOfBuyRLT.getWalletAddress,
				exchangeRate: decimalAdjust(response.data.exchange_rate),
				priceInCurrency: response.data.required_deposit_amount,
				exchangeRateTime: response.data.wait_for_transactions_date_to,
				discount: response.data.discount,
			});
		} catch (e) {
			console.error(e);
		}
	};

	closeModal = () => {
		const { setReplenishmentModalStats } = this.props;
		setReplenishmentModalStats({
			isOpen: false,
			itemName: "",
			quantity: 1,
			price: 0,
			currency: "RLT",
			skipPaymentMethod: false,
			exchangeRate: 1,
		});
	};

	render() {
		const { selectedCurrency, currentStep, optionsForSelect, amountToBuy, formattedExchangeRateTime, isLoading, exchangeRate, priceInCurrency, discount } = this.state;
		const { replenishmentModalStats, isMobile, wsReact, address, t, minDeposits } = this.props;
		return (
			<Modal isOpen={replenishmentModalStats.isOpen} toggle={this.closeModal} centered={true} className="replenishment-modal">
				<ModalBody className="replenishment-modal-wrapper">
					<button className="btn-default modal-close-btn" onClick={this.closeModal}>
						<span className="close-btn-img-wrapper">
							<img className="close-btn-img" src={closeIcon} width={12} height={12} alt="close_modal" />
						</span>
					</button>
					{currentStep === this.stepOfBuyRLT.selectCurrency && (
						<Fragment>
							<NotEnoughRLT
								itemName={replenishmentModalStats.itemName}
								quantity={replenishmentModalStats.quantity}
								price={amountToBuy}
								setSelectedCurrency={this.setSelectedCurrency}
								selectedCurrency={selectedCurrency}
								optionsForSelect={optionsForSelect}
								setStep={this.getData}
								isLoading={isLoading}
								t={t}
							/>
						</Fragment>
					)}
					{currentStep === this.stepOfBuyRLT.getWalletAddress && (
						<WalletAddress
							isMobile={isMobile}
							price={amountToBuy}
							address={address[selectedCurrency.value]}
							wsReact={wsReact}
							exchangeRateTime={formattedExchangeRateTime}
							currency={selectedCurrency}
							exchangeRate={exchangeRate}
							priceInCurrency={priceInCurrency}
							discount={discount}
							t={t}
							minDeposits={minDeposits}
						/>
					)}
					{currentStep === this.stepOfBuyRLT.pendingTransaction && (
						<PaymentReceived price={amountToBuy} exchangeRateTime={formattedExchangeRateTime} currency={selectedCurrency.label} t={t} />
					)}
					{currentStep === this.stepOfBuyRLT.successTransaction && <PaymentConfirmed price={amountToBuy} close={this.closeModal} t={t} />}
					{currentStep === this.stepOfBuyRLT.errorTransaction && <InvoiceCanceled price={amountToBuy} t={t} />}
				</ModalBody>
			</Modal>
		);
	}
}

export default withTranslation("Layout")(connect(mapStateToProps, mapDispatchToProps)(ReplenishmentModal));
