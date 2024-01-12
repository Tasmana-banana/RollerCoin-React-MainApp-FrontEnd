import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import moment from "moment";
import LazyLoad from "react-lazyload";
import scientificToDecimal from "../../services/scientificToDecimal";
import decimalAdjust from "../../services/decimalAdjust";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	pathName: state.router.location.pathname,
	rollerCurrencies: state.wallet.rollerCurrencies,
});
class TransactionsListClass extends Component {
	static propTypes = {
		pathName: PropTypes.string.isRequired,
		data: PropTypes.array.isRequired,
		t: PropTypes.func.isRequired,
		rollerCurrencies: PropTypes.array.isRequired,
	};

	renderList = () => {
		const { t } = this.props;
		const typeOptions = {
			sent: {
				title: "withdraw",
				statusOptions: {
					0: { img: "wait", text: "pending", color: "yellow" },
					1: { img: "sent", text: "pending", color: "yellow" },
					2: { img: "cancel", text: "canceled", color: "danger" },
					3: { img: "sent", text: "sent", color: "green" },
					4: { img: "sent", text: "sent", color: "green" },
					5: { img: "wait", text: "waiting", color: "white" },
					6: { img: "wait", text: "waiting", color: "white" },
					7: { img: "wait", text: "waiting", color: "white" },
					8: { img: "replaced", text: "replaced", color: "danger" },
					9: { img: "wait", text: "waiting", color: "white" },
				},
			},
			received: {
				title: "deposit",
				statusOptions: {
					0: { img: "wait", text: "pending", color: "yellow" },
					1: { img: "wait", text: "pending", color: "yellow" },
					2: { img: "cancel", text: "canceled", color: "danger" },
					3: { img: "wait", text: "pending", color: "yellow" },
					4: { img: "received", text: "accrued", color: "green" },
				},
			},
			bought: {
				title: "bought",
				statusOptions: {
					0: { img: "received", text: "complete", color: "green" },
					1: { img: "received", text: "complete", color: "green" },
					2: { img: "cancel", text: "canceled", color: "danger" },
				},
			},
		};
		if (this.props.data.length) {
			const currentCurrencyConfig = this.props.rollerCurrencies.find((item) => item.code === this.props.data[0].currency);
			return this.props.data.map((item) => (
				<div key={item.id} className={`list-item justify-content-between flex-wrap${item.status_code === 0 && item.type !== "bought" ? " new-list-item" : ""}`}>
					<div className="list-line d-flex flex-wrap justify-content-between">
						<div className="block-title d-flex align-items-center">
							<div className="icon">
								<LazyLoad offset={100}>
									<img
										src={`/static/img/wallet/statuses/${typeOptions[item.type].statusOptions[item.status_code].img}.svg`}
										alt={typeOptions[item.type].statusOptions[item.status_code].img}
									/>
								</LazyLoad>
							</div>
							<p>{t(`transactions.${typeOptions[item.type].title}`)}</p>
						</div>
						<div className="block-amount amount-block d-flex align-items-center">
							<div className="icon">
								<LazyLoad offset={100}>
									<img src={`/static/img/wallet/${item.currency.toLocaleLowerCase()}.svg?v=1.13`} alt={item.currency} width={23} height={23} />
								</LazyLoad>
							</div>
							<p className={item.type === "sent" ? "text-danger" : "green-text"}>
								{scientificToDecimal(decimalAdjust(item.amount / currentCurrencyConfig.toSmall, currentCurrencyConfig.precisionToBalance))}
							</p>
							<p className="currency-text">{item.currency}</p>
						</div>
					</div>
					<div className="list-line d-flex flex-wrap justify-content-between">
						<p>
							<span className="light-gray-text">{t("transactions.status")} </span>
							<span className={`bold-text ${typeOptions[item.type].statusOptions[item.status_code].color}-text`}>
								{t(`transactions.${typeOptions[item.type].statusOptions[item.status_code].text}`)}
							</span>
						</p>
						<p className="light-gray-text">{moment(new Date(item.created)).format("HH:mm MMMM DD, YYYY")}</p>
					</div>
					{["sent", "received"].includes(item.type) && (
						<div className="list-line d-flex flex-wrap justify-content-between">
							<p>
								<span className="light-gray-text">{t("transactions.toWallet")} </span>
								<span className="address-line">{item.address}</span>
							</p>
							{!!item.txid && (
								<div>
									<p className="d-none d-lg-block">
										<span className="light-gray-text">{t("transactions.check")} </span>
										<a href={`${currentCurrencyConfig.checkUrl}${item.txid}`} target="_blank" rel="noopener noreferrer" className="txid-link">
											{currentCurrencyConfig.checkUrl}
											{item.txid}
										</a>
									</p>
									<p className="d-lg-none">
										<a href={`${currentCurrencyConfig.checkUrl}${item.txid}`} target="_blank" rel="noopener noreferrer">
											{t("transactions.check")}
										</a>
									</p>
								</div>
							)}
						</div>
					)}
					{!!item.message && (
						<div className="list-line d-flex flex-wrap justify-content-between">
							<p>
								<span className="light-gray-text">{t("transactions.comment")} </span>
								<span className="danger-text">{item.message}</span>
							</p>
						</div>
					)}
				</div>
			));
		}
		if (this.props.pathName.endsWith("history")) {
			return [
				<div className="container-empty-data" key={0}>
					<div className="text-center mgb-24">
						<LazyLoad offset={100}>
							<img src="/static/img/wallet/purseBig.svg" alt="purseBig" />
						</LazyLoad>
					</div>
					<div>
						<p className="sorry-text text-center mgb-8">
							<b>{t("transactions.sorry")}</b>
						</p>
					</div>
				</div>,
			];
		}
	};

	render() {
		return <div className="list-items">{this.renderList()}</div>;
	}
}

const TransactionsList = withTranslation("Wallet")(connect(mapStateToProps, null)(TransactionsListClass));

export default TransactionsList;
