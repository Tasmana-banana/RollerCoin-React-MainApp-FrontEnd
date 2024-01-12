import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link, Route, Switch } from "react-router-dom";
import { Col, Row } from "reactstrap";
import { withTranslation } from "react-i18next";
import LazyLoad from "react-lazyload";
import decimalAdjust from "../../services/decimalAdjust";
import Deposit from "./Deposit";
import Withdraw from "./Withdraw";
import TransactionsList from "./TransactionsList";
import FormattedCurrencyOutput from "../SingleComponents/FormattedCurrencyOutput";
import InfoBlockWithIcon from "../SingleComponents/InfoBlockWithIcon";
import FadeAnimation from "../Animations/FadeAnimation";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import fetchWithToken from "../../services/fetchWithToken";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	balance: state.game.balance,
	isPremium: state.user.isPremium,
	selectedCurrency: state.wallet.selectedCurrency,
	pathName: state.router.location.pathname,
	language: state.game.language,
	wsNode: state.webSocket.wsNode,
	isMobile: state.game.isMobile,
});
class CurrencyOperationsClass extends Component {
	static propTypes = {
		pathName: PropTypes.string.isRequired,
		balance: PropTypes.object.isRequired,
		isPremium: PropTypes.bool.isRequired,
		updateTransactionsFlag: PropTypes.bool.isRequired,
		selectedCurrency: PropTypes.object.isRequired,
		wsReact: PropTypes.object.isRequired,
		wsNode: PropTypes.object.isRequired,
		history: PropTypes.object.isRequired,
		setUpdateHistorySuccess: PropTypes.func.isRequired,
		t: PropTypes.func.isRequired,
		language: PropTypes.string.isRequired,
		isMobile: PropTypes.string.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = { listData: [], listRefreshed: false };
		this.controllers = {};
		this.signals = {};
	}

	componentDidMount() {
		const { wsNode } = this.props;
		this.updateTransactionsList();
		if (wsNode && !wsNode.listenersMessage.walletList) {
			wsNode.setListenersMessage({ walletList: this.onWSNodeMessage });
		}
	}

	componentDidUpdate(prevProps) {
		if (this.props.pathName !== prevProps.pathName || JSON.stringify(prevProps.selectedCurrency) !== JSON.stringify(this.props.selectedCurrency)) {
			this.updateTransactionsList();
		}
		if (this.props.updateTransactionsFlag && !prevProps.updateTransactionsFlag) {
			this.updateTransactionsList();
			this.props.setUpdateHistorySuccess();
		}
	}

	componentWillUnmount() {
		const { wsNode } = this.props;
		if (wsNode) {
			wsNode.removeListenersMessage("walletList");
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

	onWSNodeMessage = (event) => {
		const data = JSON.parse(event.data);
		const { cmd, value } = data;
		switch (cmd) {
			case "deposits_updated":
				if (this.props.pathName.includes(value.currency)) {
					this.updateTransactionsList(false);
				}
				break;
			default:
				break;
		}
	};

	updateTransactionsList = (hideWhenRefresh = true) => {
		if (hideWhenRefresh) {
			this.setState({ listRefreshed: false });
		}
		const requestArray = [];
		const getDeposits = async () => {
			const { selectedCurrency } = this.props;
			try {
				this.createSignalAndController("deposits");
				const json = await fetchWithToken(`/api/wallet/deposits?currency=${selectedCurrency.balanceKey}`, {
					method: "GET",
					signal: this.signals.deposits,
				});
				if (json.success) {
					return json.data;
				}
			} catch (e) {
				return [];
			}
		};
		const getWithdrawals = async () => {
			const { selectedCurrency } = this.props;
			try {
				this.createSignalAndController("withdrawals");
				const json = await fetchWithToken(`/api/wallet/withdrawals?currency=${selectedCurrency.balanceKey}`, {
					method: "GET",
					signal: this.signals.withdrawals,
				});
				if (json.success) {
					return json.data;
				}
			} catch (e) {
				return [];
			}
		};

		if (this.props.pathName.endsWith("deposit")) {
			requestArray.push(getDeposits);
		}
		if (this.props.pathName.endsWith("withdraw")) {
			requestArray.push(getWithdrawals);
		}
		if (this.props.pathName.endsWith("history")) {
			requestArray.push(getDeposits);
			requestArray.push(getWithdrawals);
		}
		if (requestArray.length) {
			Promise.all(requestArray.map((func) => func())).then((result) =>
				this.setState({ listRefreshed: true, listData: result.reduce((acc, cur) => [...acc, ...cur], []).sort((obj1, obj2) => new Date(obj2.created) - new Date(obj1.created)) })
			);
		}
	};

	render() {
		const { balance, selectedCurrency, pathName, wsReact, isPremium, t, language, isMobile } = this.props;
		const currencyBalance = decimalAdjust(balance[selectedCurrency.code] / selectedCurrency.toSmall, selectedCurrency.precisionToBalance).toFixed(selectedCurrency.precisionToBalance);
		const { disabledWithdraw, withdrawForPremiumUsers, disabledDeposits } = selectedCurrency;
		const isWithdrawEnabled = (!disabledWithdraw && !withdrawForPremiumUsers) || (!disabledWithdraw && withdrawForPremiumUsers && isPremium);
		let pages = ["history"];
		if (isWithdrawEnabled) {
			pages = ["withdraw", ...pages];
		}
		if (!disabledDeposits) {
			pages = ["deposit", ...pages];
		}
		return Object.keys(selectedCurrency).length > 0 ? (
			<div className="currency-operations">
				{<InfoBlockWithIcon tName="Wallet" message="withdrawInfoTooltipMessage" obj="infoHints" showButtons={isMobile} />}
				<Row className="route-content" noGutters={true}>
					<Col xs="12" lg={{ size: 10, offset: 1 }}>
						<FadeAnimation>
							<div className="information-container text-center">
								<p className="bold-text info-line">
									{t("total")} {`${selectedCurrency.fullname} ${selectedCurrency.protocol}`.trim()} {t("balance")}
								</p>
								<div className="balance-line d-flex align-items-center info-line justify-content-center">
									<div className="icon">
										<LazyLoad offset={100}>
											<img src={`/static/img/wallet/${selectedCurrency.img}.svg?v=1.13`} alt={selectedCurrency.name} width={23} height={23} />
										</LazyLoad>
									</div>
									<div className="balance-text">
										<FormattedCurrencyOutput amount={currencyBalance} precision={selectedCurrency.precision} precisionToBalance={selectedCurrency.precisionToBalance} />
									</div>
								</div>
							</div>
							<div className="buttons-block d-flex justify-content-center">
								{pages.map((page, index) => (
									<Link
										to={`${getLanguagePrefix(language)}/wallet/${selectedCurrency.code}/${page}`}
										key={index}
										className={`tree-dimensional-button btn-default ${pathName.endsWith(page) ? "active" : ""}`}
									>
										<span className="with-horizontal-image flex-column flex-lg-row">
											<img src={`/static/img/wallet/${page}.svg?v=1.13`} alt={page} />
											<span className="btn-text">{t(page)}</span>
										</span>
									</Link>
								))}
							</div>
						</FadeAnimation>
						<div className="content-block">
							<Switch>
								<Route exact path={`${getLanguagePrefix(language)}/wallet/${selectedCurrency.code}/deposit`} render={() => <Deposit wsReact={wsReact} />} />
								<Route path={`${getLanguagePrefix(language)}/wallet/${selectedCurrency.code}/withdraw`} render={() => <Withdraw wsReact={wsReact} />} />
							</Switch>
						</div>
					</Col>
				</Row>
				{this.state.listRefreshed && <TransactionsList data={this.state.listData} />}
			</div>
		) : (
			""
		);
	}
}
const CurrencyOperations = withTranslation("Wallet")(connect(mapStateToProps, null)(CurrencyOperationsClass));

export default CurrencyOperations;
