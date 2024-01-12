import React, { Component } from "react";
import moment from "moment";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import queryString from "query-string";
import IncomeTablePagination from "./IncomeTablePagination";
import fetchWithToken from "../../../services/fetchWithToken";
import decimalAdjust from "../../../services/decimalAdjust";
import scientificToDecimal from "../../../services/scientificToDecimal";

import "../../../assets/scss/Profile/IncomeStatsTable.scss";

import loaderImg from "../../../assets/img/loader_sandglass.gif";

class IncomeStatsTable extends Component {
	static propTypes = {
		currency: PropTypes.object.isRequired,
		queryData: PropTypes.object.isRequired,
		t: PropTypes.func.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			total: 0,
			skip: 0,
			limit: 5,
			items: [],
			currentPage: 1,
			isLoading: false,
		};
		this.controllers = {};
		this.signals = {};
	}

	componentDidMount() {
		const { currentPage } = this.state;
		this.getIncomeTableStats(currentPage);
	}

	componentDidUpdate(prevProps) {
		const { currency, queryData } = this.props;
		const isDataChanged = (prevProps.queryData.from !== queryData.from || prevProps.queryData.to !== queryData.to) && queryData.from && queryData.to;
		const isCurrencyChanged = prevProps.currency.balanceKey !== currency.balanceKey && currency.balanceKey;
		if (isDataChanged || isCurrencyChanged) {
			this.getIncomeTableStats(1);
		}
	}

	componentWillUnmount() {
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

	getIncomeTableStats = async (page) => {
		const { currency, queryData } = this.props;
		if (!queryData.from || !queryData.to) {
			return false;
		}
		const { limit } = this.state;
		const query = {
			limit,
			skip: page * limit - limit,
			currency: currency.balanceKey,
			from: moment(queryData.from).format("YYYY-MM-DD"),
			to: moment(queryData.to).format("YYYY-MM-DD"),
		};
		this.setState({ isLoading: true });
		try {
			this.createSignalAndController("getIncomeTableStats");
			const json = await fetchWithToken(`/api/profile/income-table-stats?${queryString.stringify(query)}`, {
				method: "GET",
				signal: this.signals.getIncomeTableStats,
			});
			if (!json.success) {
				return this.setState({ isLoading: false });
			}
			this.setState({
				total: json.data.total,
				skip: json.data.skip,
				limit: json.data.limit,
				items: json.data.items,
				currentPage: page,
				isLoading: false,
			});
		} catch (e) {
			console.error(e);
			this.setState({ isLoading: false });
		}
	};

	changePage = (page) => {
		const { currentPage } = this.state;
		if (page === currentPage) {
			return false;
		}
		this.getIncomeTableStats(page);
	};

	render() {
		const { items, total, limit, currentPage, isLoading } = this.state;
		const { currency } = this.props;
		const pages = Math.ceil(total / limit);
		const { t } = this.props;

		return (
			<div className="income-stats-table mt-3 mb-0">
				{isLoading && (
					<div className="table-loader">
						<div>
							<img src={loaderImg} height={63} width={63} alt="Loading..." />
						</div>
					</div>
				)}
				{!!items.length && !isLoading && (
					<div className="table-stats-wrapper">
						<table className="table-stats">
							<thead className="table-header">
								<tr>
									<th>{t("incomeStats.date")}</th>
									<th>{t("incomeStats.byReferral")}</th>
									<th>{t("incomeStats.beOfferWalls")}</th>
									<th>{t("incomeStats.byMining")}</th>
									<th className="total">{t("total")}</th>
								</tr>
							</thead>
							<tbody className="table-body">
								{items.map((stats) => (
									<tr key={stats.date}>
										<td>{stats.date}</td>
										<td>{`${scientificToDecimal(decimalAdjust(stats.referral_income / currency.toSmall / currency.divider, currency.precision))} ${currency.label}`}</td>
										<td>{`${scientificToDecimal(decimalAdjust(stats.offerwalls_income / currency.toSmall / currency.divider, currency.precision))} ${currency.label}`}</td>
										<td>{`${scientificToDecimal(decimalAdjust(stats.mining_income / currency.toSmall / currency.divider, currency.precision))} ${currency.label}`}</td>
										<td className="total">{`${scientificToDecimal(decimalAdjust(stats.total_income / currency.toSmall / currency.divider, currency.precision))} ${
											currency.label
										}`}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
				<div className="table-pagination-wrapper">
					<ul className="income-pagination">
						<IncomeTablePagination pages={pages} isLoading={isLoading} now={currentPage} onChangePage={this.changePage} />
					</ul>
				</div>
			</div>
		);
	}
}

export default withTranslation("Profile")(IncomeStatsTable);
