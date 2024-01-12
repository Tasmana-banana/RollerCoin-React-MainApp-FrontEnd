import React, { Component, Fragment } from "react";
import { withRouter, Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Col, Row } from "reactstrap";
import { connect } from "react-redux";
import Statistics from "./Statistics";
import getLanguagePrefix from "../../services/getLanguagePrefix";

import "../../assets/scss/Referral/StatisticsByCurrency.scss";

const mapStateToProps = (state) => ({
	currencies: state.wallet.rollerCurrencies,
});

class StatisticsByCurrency extends Component {
	static propTypes = {
		location: PropTypes.object.isRequired,
		language: PropTypes.string.isRequired,
		currencies: PropTypes.array.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			activeCurrency: "",
		};
		const { language } = this.props;
		this.currencies = this.props.currencies
			.filter((filterItem) => filterItem.isCanBeMined && filterItem.isInReferralProgram)
			.map((item) => ({
				code: item.code,
				fullName: item.fullname,
				balanceKey: item.balanceKey,
				path:
					item.balanceKey === "SAT"
						? [`${getLanguagePrefix(language)}/referral/stats/${item.code}`, `${getLanguagePrefix(language)}/referral/stats`]
						: [`${getLanguagePrefix(language)}/referral/stats/${item.code}`],
			}));
	}

	componentDidMount() {
		const { location } = this.props;
		this.setState({ activeCurrency: this.getCurrencyFromPath(location.pathname) });
	}

	componentDidUpdate(prevProps) {
		const { location } = this.props;
		if (prevProps.location.pathname !== location.pathname) {
			this.setState({ activeCurrency: this.getCurrencyFromPath(location.pathname) });
		}
	}

	getCurrencyFromPath = (incomePath) => {
		const currentCurrency = this.currencies.find((item) => item.path.includes(incomePath));
		if (!currentCurrency) {
			return "";
		}
		return currentCurrency.balanceKey;
	};

	render() {
		const { activeCurrency } = this.state;
		return (
			<Fragment>
				<Row noGutters={true} className="statistics-by-currency">
					{this.currencies.map((item) => (
						<Col key={item.code} className={`nav-container ${activeCurrency === item.balanceKey ? "active" : ""}`}>
							<div className="nav-link-wrapper">
								<Link to={item.path[0]} className="statistics-nav-link">
									<img src={`/static/img/icon/currencies/${item.code}.svg?v=1.11`} width={24} height={24} alt={item.code} />
									<span className="currency-name">{item.code}</span>
								</Link>
							</div>
						</Col>
					))}
				</Row>
				<div className="statistics-tab-content">{activeCurrency && <Statistics currentCurrency={activeCurrency} />}</div>
			</Fragment>
		);
	}
}

export default connect(mapStateToProps, null)(withRouter(StatisticsByCurrency));
