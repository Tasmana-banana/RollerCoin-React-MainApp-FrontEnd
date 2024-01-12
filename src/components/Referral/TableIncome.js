import React, { Component } from "react";
import PropTypes from "prop-types";
import { Table } from "reactstrap";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import scientificToDecimal from "../../services/scientificToDecimal";

const mapStateToProps = (state) => ({
	currencies: state.wallet.rollerCurrencies,
});

class TableIncome extends Component {
	static propTypes = {
		data: PropTypes.array.isRequired,
		currentCurrency: PropTypes.string.isRequired,
		currencies: PropTypes.array.isRequired,
		t: PropTypes.func.isRequired,
	};

	getCurrencyNameFromBalanceKey = () => {
		const { currentCurrency } = this.props;
		const currency = this.props.currencies.find((item) => item.balanceKey === currentCurrency);
		if (!currency) {
			return "";
		}
		return currency.name;
	};

	createBody = () => {
		const currencyName = this.getCurrencyNameFromBalanceKey();
		return this.props.data.map((item, i) => (
			<tr key={i}>
				<td>
					<p>{item.date}</p>
				</td>
				<td>
					<p>{item.uniques}</p>
				</td>
				<td>
					<p>{item.hits}</p>
				</td>
				<td>
					<p>{item.registrations}</p>
				</td>
				<td>
					<p>
						{scientificToDecimal(item.mining)} <span className="satoshi-text">{currencyName}</span>
					</p>
				</td>
				<td>
					<p>
						{scientificToDecimal(item.purchases)} <span className="satoshi-text">{currencyName}</span>
					</p>
				</td>
				<td>
					<p>
						{scientificToDecimal(item.total_reward)} <span className="satoshi-text">{currencyName}</span>
					</p>
				</td>
			</tr>
		));
	};

	createFooter = () => {
		const { currentCurrency, t } = this.props;
		const currencyName = this.getCurrencyNameFromBalanceKey();
		const currencyConfig = this.props.currencies.find((item) => item.balanceKey === currentCurrency);
		const totalData = this.props.data.reduce(
			(acc, current) => ({
				uniques: acc.uniques + current.uniques,
				hits: acc.hits + current.hits,
				registrations: acc.registrations + current.registrations,
				mining: +(acc.mining + current.mining).toFixed(currencyConfig.precisionToBalance),
				purchase: +(acc.purchase + current.purchases).toFixed(currencyConfig.precisionToBalance),
				total: +(acc.total + current.total_reward).toFixed(currencyConfig.precisionToBalance),
			}),
			{
				uniques: 0,
				hits: 0,
				registrations: 0,
				mining: 0,
				purchase: 0,
				total: 0,
			}
		);
		return [
			<tr key={"total"}>
				<td>
					<p>
						<b>{t("main.total")}</b>
					</p>
				</td>
				<td>
					<p>{totalData.uniques}</p>
				</td>
				<td>
					<p>{totalData.hits}</p>
				</td>
				<td>
					<p>{totalData.registrations}</p>
				</td>
				<td>
					<p>
						{scientificToDecimal(totalData.mining)} <span className="satoshi-text">{currencyName}</span>
					</p>
				</td>
				<td>
					<p>
						{scientificToDecimal(totalData.purchase)} <span className="satoshi-text">{currencyName}</span>
					</p>
				</td>
				<td>
					<p>
						{scientificToDecimal(totalData.total)} <span className="satoshi-text">{currencyName}</span>
					</p>
				</td>
			</tr>,
		];
	};

	render() {
		const { t } = this.props;
		return (
			<div className="money-income-container table-responsive">
				<Table className="roller-table">
					<thead>
						<tr>
							<th colSpan="4" className="hidden-mobile">
								<p className="main-header-table">
									<img src="/static/img/referral/info_stats.svg" alt="info_stats" />
									<span>{t("main.info")}</span>
								</p>
							</th>
							<th colSpan="3" className="hidden-mobile">
								<p className="main-header-table">
									<img src="/static/img/referral/profit.svg" alt="profit" />
									<span>{t("main.profit")}</span>
								</p>
							</th>
						</tr>
						<tr>
							<th>
								<p>{t("main.date")}</p>
							</th>
							<th>
								<p>{t("main.unique")}</p>
							</th>
							<th>
								<p>{t("main.hits")}</p>
							</th>
							<th>
								<p>{t("main.regs")}</p>
							</th>
							<th>
								<p>{t("main.mining")}</p>
							</th>
							<th>
								<p>{t("main.purchase")}</p>
							</th>
							<th>
								<p>{t("main.total")}</p>
							</th>
						</tr>
					</thead>
					{this.props.data.length > 0 && <tbody>{this.createBody()}</tbody>}
					{this.props.data.length > 0 && <tfoot>{this.createFooter()}</tfoot>}
					{this.props.data.length === 0 && (
						<tbody>
							<tr>
								<td>
									<p>-</p>
								</td>
								<td>
									<p>-</p>
								</td>
								<td>
									<p>-</p>
								</td>
								<td>
									<p>-</p>
								</td>
								<td>
									<p>-</p>
								</td>
								<td>
									<p>-</p>
								</td>
								<td>
									<p>-</p>
								</td>
							</tr>
						</tbody>
					)}
				</Table>
			</div>
		);
	}
}

export default withTranslation("Referral")(connect(mapStateToProps, null)(TableIncome));
