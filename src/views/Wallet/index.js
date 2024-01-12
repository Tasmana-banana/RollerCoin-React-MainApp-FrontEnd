import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { Link, Route, Switch } from "react-router-dom";
import { Row, Col, Container, UncontrolledTooltip } from "reactstrap";
import LazyLoad from "react-lazyload";
import { WithdrawalModal, CurrencyOperations } from "../../components/Wallet";
import FormattedCurrencyOutput from "../../components/SingleComponents/FormattedCurrencyOutput";
import TwoFactorModal from "../../components/SingleComponents/TwoFactor/TwoFactorModal";
import TutorialModal from "../../components/Tutorial/TutorialModal";
import * as actions from "../../actions/wallet";
import Token from "./Token";
import fixUSDTokensKey from "../../services/fixUSDTokensKey";
import decimalAdjust from "../../services/decimalAdjust";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import fetchWithToken from "../../services/fetchWithToken";
import { POST_TYPE_AUTH } from "../../constants/SingleComponents";

import progressionEventRewardToast from "../../services/progressionEventRewardToast";
import progressionEventMultiplierToast from "../../services/progressionEventMultiplierToast";

import "../../assets/scss/Wallet/main.scss";
import "../../assets/scss/ProgressionEvent/ProgressionEventRewardToast.scss";
import "../../assets/scss/ProgressionEvent/ProgressionEventMultiplierToast.scss";

import checkListImg from "../../assets/img/offerwall/checklist.svg";
import infoTooltipImg from "../../assets/img/storage/info_icon_round.svg";

const TYPES_TAG = ["new", "hot"];

// Map Redux state to component props
const mapStateToProps = (state) => ({
	pathName: state.router.location.pathname,
	balance: state.game.balance,
	selectedCurrency: state.wallet.selectedCurrency,
	rollerCurrencies: state.wallet.rollerCurrencies,
	crowdfundingTokensDiscounts: state.wallet.crowdfundingTokensDiscounts,
	isMobile: state.game.isMobile,
	language: state.game.language,
	isOfferwallsActive: state.user.isOfferwallsActive,
	wsNode: state.webSocket.wsNode,
	userInfo: state.user,
	isViewedTutorial: state.user.userViewedTutorial,
});
// Map Redux actions to component props
const mapDispatchToProps = (dispatch) => ({
	setSelectedCurrency: (state) => dispatch(actions.setSelectedCurrency(state)),
	setAddress: (state) => dispatch(actions.setAddress(state)),
	setShowWithdrawalModal: (state) => dispatch(actions.setShowWithdrawalModal(state)),
	setMinDeposits: (state) => dispatch(actions.setMinDeposits(state)),
	setRedDotNotify: (state) => dispatch(actions.setRedDotNotify(state)),
});
class WalletClass extends Component {
	static propTypes = {
		pathName: PropTypes.string.isRequired,
		balance: PropTypes.object.isRequired,
		history: PropTypes.object.isRequired,
		wsReact: PropTypes.object.isRequired,
		wsNode: PropTypes.object.isRequired,
		rollerCurrencies: PropTypes.array.isRequired,
		crowdfundingTokensDiscounts: PropTypes.object.isRequired,
		selectedCurrency: PropTypes.object.isRequired,
		setSelectedCurrency: PropTypes.func.isRequired,
		setAddress: PropTypes.func.isRequired,
		setShowWithdrawalModal: PropTypes.func.isRequired,
		setMinDeposits: PropTypes.func.isRequired,
		isOfferwallsActive: PropTypes.bool.isRequired,
		isMobile: PropTypes.bool.isRequired,
		t: PropTypes.func.isRequired,
		language: PropTypes.string.isRequired,
		userInfo: PropTypes.object.isRequired,
		isViewedTutorial: PropTypes.object.isRequired,
		setRedDotNotify: PropTypes.func.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			withdrawResponse: {
				messageCode: "",
				success: true,
			},
			body2FA: {
				withdrawal_id: "",
				code_id: "",
			},
			withoutMail: false,
			updateHistory: false,
			isShow2FAModal: false,
		};
		this.controllers = {};
		this.signals = {};
	}

	componentDidMount() {
		const { wsNode } = this.props;
		if (wsNode && !wsNode.listenersMessage.wallet) {
			wsNode.setListenersMessage({ wallet: this.onWSNodeMessage });
		}
		if (this.props.pathName.endsWith("/wallet")) {
			this.setTokenToSelectedCurrency();
		}
		this.props.wsReact.setListenersMessage({ wallet: this.onWSMessage });
		this.props.wsReact.setListenersOpen({ wallet: this.socketOpen });
		this.getMinDepositsAmount();
		this.setCurrencyOptionsToLocalStorage();
	}

	componentDidUpdate(prevProps) {
		if (prevProps.pathName !== this.props.pathName && this.props.pathName.endsWith("/wallet")) {
			this.setTokenToSelectedCurrency();
		}
	}

	componentWillUnmount() {
		const { wsNode } = this.props;
		if (wsNode) {
			wsNode.removeListenersMessage("wallet");
		}
		this.props.wsReact.removeListenersMessage("wallet");
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

	setTokenToSelectedCurrency = () => {
		const { setSelectedCurrency, rollerCurrencies } = this.props;
		setSelectedCurrency(rollerCurrencies.find((currency) => currency.code === "rlt"));
	};

	setCurrencyOptionsToLocalStorage = () => {
		const { crowdfundingTokensDiscounts, rollerCurrencies, setRedDotNotify } = this.props;
		setRedDotNotify(false);

		const currenciesOptions = [];
		rollerCurrencies.forEach((currency) => {
			const obj = {
				currency: currency.code,
				tag: currency?.tag || "",
				discount: 0,
			};
			currenciesOptions.push(obj);
		});

		crowdfundingTokensDiscounts.forEach((currency) => {
			const currentCurrency = currenciesOptions.find((item) => item.currency === currency.currency);
			if (currentCurrency) {
				currentCurrency.discount = currency.amount;
			}
		});
		localStorage.setItem("currency_options", JSON.stringify(currenciesOptions));
	};

	socketOpen = () => {
		const commandsWallet = ["balance_request"];
		commandsWallet.forEach((command) => {
			this.props.wsReact.send(
				JSON.stringify({
					cmd: command,
				})
			);
		});
	};

	onWSMessage = (event) => {
		const data = JSON.parse(event.data);
		const command = data.cmd;
		const value = data.cmdval;
		switch (command) {
			case "withdrawal_create_response":
				this.handleCreateResponse(value);
				break;
			case "generate_bitcoin_wallet_response":
				this.handleAddress(value);
				break;
			default:
				break;
		}
	};

	onWSNodeMessage = (event) => {
		const data = JSON.parse(event.data);
		const { cmd, value } = data;
		switch (cmd) {
			case "pe_user_reward_info":
				if (!value.event_type || value.event_type === "default") {
					progressionEventRewardToast(value);
				}
				break;
			case "pe_user_multiplier_update":
				if (!value.event_type || value.event_type === "default") {
					progressionEventMultiplierToast(value);
				}
				break;
			default:
				break;
		}
	};

	handleCreateResponse = (data) => {
		if (data.success) {
			this.sendConfirmWithdrawalCode(data.details.withdrawal_id);
			const commandsWallet = ["balance_request"];
			commandsWallet.forEach((command) => {
				this.props.wsReact.send(
					JSON.stringify({
						cmd: command,
					})
				);
			});
		} else {
			this.setState({
				withdrawResponse: {
					messageCode: data.error.code,
					success: data.success,
				},
			});
		}
		this.props.setShowWithdrawalModal(true);
	};

	sendConfirmWithdrawalCode = async (withrawalId) => {
		this.createSignalAndController("sendConfirmWithdrawalCode");
		try {
			const json = await fetchWithToken("/api/auth/send-confirm-withdrawal-code", {
				method: "POST",
				body: JSON.stringify({ withdrawal_id: withrawalId }),
				signal: this.signals.sendConfirmWithdrawalCode,
			});
			let code = "";
			let success = false;
			if (!json.success) {
				return false;
			}

			this.setState({
				isShow2FAModal: !json.data.without_mail,
				withoutMail: json.data.without_mail,
				body2FA: {
					code_id: json.data.confirm_code_id,
					withdrawal_id: json.data.withdrawal_id,
				},
			});
			this.setState({
				withdrawResponse: {
					messageCode: code,
					success,
				},
				updateHistory: true,
			});
		} catch (e) {
			console.error(e);
		}
	};

	getMinDepositsAmount = async () => {
		try {
			this.createSignalAndController("getMinDepositsAmount");
			const json = await fetchWithToken("/api/wallet/get-min-deposits", {
				method: "GET",
				signal: this.signals.getMinDepositsAmount,
			});
			if (!json.success) {
				return false;
			}
			this.props.setMinDeposits(json.data);
		} catch (e) {
			console.error(e);
		}
	};

	handleAddress = (data) => this.props.setAddress(fixUSDTokensKey(data));

	changeRouteAndSelectCurrency = (currencyCode) => {
		const { language, setSelectedCurrency, rollerCurrencies, history } = this.props;
		const foundCurrency = rollerCurrencies.find((currency) => currency.code === currencyCode);
		if (foundCurrency.disabledWithdraw && foundCurrency.disabledDeposits && foundCurrency.code !== "rlt") {
			return true;
		}
		const { disabledWithdraw, disabledDeposits } = foundCurrency;
		let pages = ["history"];
		if (!disabledWithdraw) {
			pages = ["withdraw", ...pages];
		}
		if (!disabledDeposits) {
			pages = ["deposit", ...pages];
		}
		setSelectedCurrency(foundCurrency);
		if (currencyCode === "rlt") {
			history.push(`${getLanguagePrefix(language)}/wallet/token`);
		} else {
			history.push(`${getLanguagePrefix(language)}/wallet/${currencyCode}/${pages[0]}`);
		}
	};

	renderCurrenciesTabs = () => {
		const { balance, selectedCurrency, pathName, rollerCurrencies, isMobile, crowdfundingTokensDiscounts, t } = this.props;
		const currenciesWithRLTDiscount = crowdfundingTokensDiscounts
			.filter((token) => token.amount > 0)
			.map((token) => ({
				...token,
				name: rollerCurrencies.find((currency) => currency.code === token.currency).name,
			}));
		return rollerCurrencies.map((currency, i) => {
			const currencyBalance = decimalAdjust(balance[currency.code] / currency.toSmall, currency.precisionToBalance).toFixed(currency.precisionToBalance);
			const currencyTagClass = TYPES_TAG.includes(currency.tag) ? currency.tag : "default";
			return (
				<Fragment key={i}>
					<div
						className={`${
							(!pathName.endsWith("/wallet") && currency.code === selectedCurrency.code) || (pathName.endsWith("/wallet") && currency.code === selectedCurrency.code && !isMobile)
								? "active"
								: ""
						} transparent-wallet-pill d-flex justify-content-between align-items-center ${currency.code === "rlt" ? "rollertoken-accentuated" : ""} ${
							currency.disabledWithdraw && currency.disabledDeposits && currency.code !== "rlt" ? "not-available" : ""
						}`}
						onClick={() => this.changeRouteAndSelectCurrency(currency.code)}
						key={i}
					>
						{currency.tag && (
							<div className={`currency-tag ${currencyTagClass}`}>
								<p className="currency-tag-text">{currency.tag.toUpperCase()}</p>
							</div>
						)}
						<div className="currency-title d-inline-flex align-items-center">
							<div className="icon">
								<LazyLoad offset={100}>
									<img src={`/static/img/wallet/${currency.img}.svg?v=1.13`} alt={currency.name} width={40} height={40} style={{ minWidth: "40px" }} />
								</LazyLoad>
							</div>
							<div className="title-text" style={{ marginRight: "5px" }}>
								<p className="bold-text">{`${currency.fullname} ${currency.protocol}`.trim()}</p>
								<p className="small-text">{currency.name}</p>
								{currency.code === "rlt" && currenciesWithRLTDiscount.length > 0 && (
									<span className="cyan-text bold-text">({currenciesWithRLTDiscount.map((item) => `${item.name} -${item.amount}%`).join(", ")})</span>
								)}
							</div>
						</div>
						<div className="additional-info text-right">
							<p className="small-text light-gray-text">{t("totalBalance")}</p>
							<div className="balance-text">
								<FormattedCurrencyOutput amount={currencyBalance} precision={currency.precision} precisionToBalance={currency.precisionToBalance} />
							</div>
						</div>
					</div>
					{currency.code === "rst" && <div className="rollertoken-divider" />}
				</Fragment>
			);
		});
	};

	getCurrentRouteName = () => {
		const { language, selectedCurrency, pathName, t } = this.props;
		const currencyRoutes = this.props.rollerCurrencies.map((currency) => `${getLanguagePrefix(language)}/wallet/${currency.code}`);
		if (currencyRoutes.find((path) => this.props.pathName.includes(path))) {
			return selectedCurrency.fullname;
		}
		if (pathName.includes("token")) {
			return t("tokenSale");
		}
		return "";
	};

	setUpdateHistorySuccess = () => {
		const { updateHistory } = this.state;
		this.setState({ updateHistory: !updateHistory });
	};

	toggle2FaModalHandler = () => {
		const { isShow2FAModal } = this.state;

		this.setState({
			isShow2FAModal: !isShow2FAModal,
		});
	};

	render() {
		const { history, rollerCurrencies, wsReact, pathName, isOfferwallsActive, isMobile, t, language, userInfo, isViewedTutorial } = this.props;
		const { isShow2FAModal, withoutMail, body2FA } = this.state;
		const currencyRoutes = rollerCurrencies.filter((currency) => currency.usedToBuyRLT).map((currency) => `${getLanguagePrefix(language)}/wallet/${currency.code}`);
		return (
			<Container>
				{withoutMail && <WithdrawalModal success={this.state.withdrawResponse.success} messageCode={this.state.withdrawResponse.messageCode} />}
				{!isViewedTutorial.wallet && <TutorialModal tutorialCategories={"wallet"} />}
				{isShow2FAModal && (
					<TwoFactorModal
						isShowModal={isShow2FAModal}
						type={POST_TYPE_AUTH.WITHDRAW}
						email={userInfo.email}
						body2FA={body2FA}
						closeModalHandler={this.toggle2FaModalHandler}
						setUpdateHistorySuccess={this.setUpdateHistorySuccess}
					/>
				)}
				<Row noGutters={true} className="wallet-container">
					<Col xs="12" className="info-tooltip-icon-container">
						<div className="info-icon-block" id="walletTitleTooltipId">
							<img className="info-icon" src={infoTooltipImg} alt="info img" width="24" height="24" />
						</div>
						<h1 className="wallet-title">{t("mainTitle")}</h1>
						<UncontrolledTooltip placement="right" autohide={true} target="walletTitleTooltipId">
							{t("infoHints.titleInfoTooltipText")}
						</UncontrolledTooltip>
					</Col>
					<Col xs="12" lg="4" className={`left-block`} hidden={isMobile && !pathName.endsWith("/wallet")}>
						{this.renderCurrenciesTabs()}
						{isOfferwallsActive && (
							<div className="offerwall-block">
								<Link to={`${getLanguagePrefix(language)}/taskwall`} className="tree-dimensional-button btn-gold w-100 offerwall-btn">
									<span className="with-horizontal-image flex-lg-row button-text-wrapper">
										<img src={checkListImg} alt="checklist" />
										<span className="btn-text confirm-text">{t("offerwall")}</span>
									</span>
								</Link>
							</div>
						)}
					</Col>
					<Col xs="12" lg="8" className="right-block">
						<div>
							{isMobile && !pathName.endsWith("/wallet") && (
								<Row noGutters={true} className="mobile-header">
									<Col xs={5}>
										<Link to={`${getLanguagePrefix(language)}/wallet`} className="d-flex back-link">
											<span className="icon">
												<img src="/static/img/wallet/back_angle.svg" alt="back_angle" />
											</span>
											<span>{t("back")}</span>
										</Link>
									</Col>
									<Col className="bold-text">
										<p className="page-name">{this.getCurrentRouteName()}</p>
									</Col>
								</Row>
							)}
							<Switch>
								{currencyRoutes.map((path, index) => {
									return (
										<Route
											exact={path === `${getLanguagePrefix(language)}/wallet`}
											path={path}
											key={index}
											render={() => (
												<CurrencyOperations
													wsReact={wsReact}
													updateTransactionsFlag={this.state.updateHistory}
													setUpdateHistorySuccess={this.setUpdateHistorySuccess}
													history={history}
												/>
											)}
										/>
									);
								})}
								<Route path={`${getLanguagePrefix(language)}/wallet/token`} render={() => <Token wsReact={wsReact} history={history} language={language} isMobile={isMobile} />} />
								{!isMobile && (
									<Route path={`${getLanguagePrefix(language)}/wallet`} render={() => <Token wsReact={wsReact} history={history} language={language} isMobile={isMobile} />} />
								)}
							</Switch>
						</div>
					</Col>
				</Row>
			</Container>
		);
	}
}
const Wallet = withTranslation("Wallet")(connect(mapStateToProps, mapDispatchToProps)(WalletClass));
export default Wallet;
