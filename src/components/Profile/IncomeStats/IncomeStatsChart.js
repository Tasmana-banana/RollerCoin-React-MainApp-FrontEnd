import React, { Component } from "react";
import moment from "moment";
import DatePicker from "react-datepicker";
import PropTypes from "prop-types";
import queryString from "query-string";
import { withTranslation } from "react-i18next";
import { Row, Col, Nav, NavItem, NavLink } from "reactstrap";
import fetchWithToken from "../../../services/fetchWithToken";
import Chart from "../Chart";

import "../../../assets/scss/Profile/IncomeStatsChart.scss";
import "react-datepicker/dist/react-datepicker.css";

class IncomeStatsChart extends Component {
	static propTypes = {
		queryData: PropTypes.object.isRequired,
		setDateQuery: PropTypes.func.isRequired,
		currency: PropTypes.object.isRequired,
		t: PropTypes.func.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			activeTab: "",
			date: {
				from: new Date(moment().subtract(10, "days").toString()),
				to: new Date(moment().subtract(1, "day").toString()),
			},
			chartIncomeData: [],
		};
		this.controllers = {};
		this.signals = {};
	}

	componentDidMount() {
		this.setActiveTab("custom");
	}

	componentDidUpdate(prevProps) {
		const { currency, queryData } = this.props;
		const isDataChanged = (prevProps.queryData.from !== queryData.from || prevProps.queryData.to !== queryData.to) && queryData.from && queryData.to;
		const isCurrencyChanged = prevProps.currency.balanceKey !== currency.balanceKey && currency.balanceKey;
		if (isDataChanged || isCurrencyChanged) {
			this.getNewStatsIncome();
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

	getNewStatsIncome = async () => {
		const { currency, queryData } = this.props;
		const query = {
			from: moment(queryData.from).format("YYYY-MM-DD"),
			to: moment(queryData.to).format("YYYY-MM-DD"),
			currency: currency.balanceKey,
		};
		try {
			this.createSignalAndController("getNewStatsIncome");
			const json = await fetchWithToken(`/api/profile/income-stats?${queryString.stringify(query)}`, {
				method: "GET",
				signal: this.signals.getNewStatsIncome,
			});
			if (!json.success) {
				return false;
			}
			this.setState({ chartIncomeData: json.data });
		} catch (e) {
			console.error(e);
		}
	};

	setActiveTab = (tab) => {
		const { activeTab, date } = this.state;
		const { queryData, setDateQuery } = this.props;
		if (activeTab === tab) {
			return null;
		}
		this.setState({
			activeTab: tab,
		});
		const period = {
			from: date.from,
			to: date.to,
		};
		switch (tab) {
			case "week":
				period.to = moment().subtract(1, "day");
				period.from = moment().subtract(1, "week");
				break;
			case "month":
				period.to = moment().subtract(1, "day");
				period.from = moment().subtract(1, "months");
				break;
			default:
				break;
		}
		setDateQuery({ ...queryData, ...period });
	};

	handleDateFrom = (date) => {
		const { queryData, setDateQuery } = this.props;
		this.setState({ date: { ...this.state.date, ...{ from: date } } });
		setDateQuery({ ...queryData, ...{ from: date } });
	};

	handleDateTo = (date) => {
		const { queryData, setDateQuery } = this.props;
		this.setState({ date: { ...this.state.date, ...{ to: date } } });
		setDateQuery({ ...queryData, ...{ to: date } });
	};

	render() {
		const { t, currency } = this.props;
		const { activeTab, chartIncomeData, date } = this.state;
		return (
			<div className="stats-chart-container">
				<div className="navigation-block">
					<Row noGutters={true}>
						<Col xs={12} md={3}>
							<p className="stats-title">{t("statistics")}:</p>
						</Col>
						<Col xs={12} md={9}>
							<Nav pills className="nav-pills vertical-pills profile-stats-nav-pills">
								<NavItem>
									<NavLink className={`${activeTab === "custom" ? "active" : ""}`} onClick={() => this.setActiveTab("custom")}>
										{t("custom")}
									</NavLink>
								</NavItem>
								<NavItem>
									<NavLink className={`${activeTab === "month" ? "active" : ""}`} onClick={() => this.setActiveTab("month")}>
										{t("month")}
									</NavLink>
								</NavItem>
								<NavItem>
									<NavLink className={`${activeTab === "week" ? "active" : ""}`} onClick={() => this.setActiveTab("week")}>
										{t("week")}
									</NavLink>
								</NavItem>
							</Nav>
						</Col>
					</Row>
				</div>
				<div className="body-chart-block">
					<Row className="filter-stats" noGutters={true}>
						<Col xs="12" className="mobile-filter-header">
							<p>Filter</p>
						</Col>
						{activeTab === "custom" && (
							<Col xs="12" lg="7" className="datepicker-container">
								<Row noGutters={true}>
									<Col xs="12" lg="6" className="datepicker-block">
										<div className="header-filter">
											<p>{t("from")}</p>
										</div>
										<div className="body-filter">
											<DatePicker
												selected={date.from}
												dateFormat="MMMM d, yyyy"
												onChange={this.handleDateFrom}
												dropdownMode={"scroll"}
												minDate={new Date(moment().subtract(3, "months").toString())}
												maxDate={date.to}
											/>
										</div>
									</Col>
									<Col xs="12" lg="6" className="datepicker-block">
										<div className="header-filter">
											<p>{t("to")}</p>
										</div>
										<div className="body-filter">
											<DatePicker
												selected={date.to}
												dateFormat="MMMM d, yyyy"
												onChange={this.handleDateTo}
												dropdownMode={"scroll"}
												minDate={date.from}
												maxDate={new Date(moment().subtract(1, "day").toString())}
											/>
										</div>
									</Col>
								</Row>
							</Col>
						)}
					</Row>
					<Chart data={chartIncomeData} title={`${t("playerIncome")} (${currency.label})`} />
				</div>
			</div>
		);
	}
}

export default withTranslation("Profile")(IncomeStatsChart);
