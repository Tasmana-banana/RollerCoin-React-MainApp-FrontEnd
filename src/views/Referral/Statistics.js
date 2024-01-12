import React, { Component } from "react";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Row, Col, Nav, NavItem, NavLink } from "reactstrap";
import { connect } from "react-redux";
import DatePicker from "react-datepicker";
import Select from "react-select";
import moment from "moment";
import { withTranslation } from "react-i18next";
import { TableIncome, CopyLinkComponent } from "../../components/Referral";
import ReferralChart from "../../components/Referral/ReferralChart";
import FadeAnimation from "../../components/Animations/FadeAnimation";
import createDateRangeArray from "../../services/createDateRangeArray";
import decimalAdjust from "../../services/decimalAdjust";
import scientificToDecimal from "../../services/scientificToDecimal";
import getLanguagePrefix from "../../services/getLanguagePrefix";
import fetchWithToken from "../../services/fetchWithToken";

import "react-datepicker/dist/react-datepicker.css";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	language: state.game.language,
	rollerCurrencies: PropTypes.object.isRequired,
	currencies: state.wallet.rollerCurrencies,
});

class Statistics extends Component {
	static propTypes = {
		currentCurrency: PropTypes.string.isRequired,
		isBountyProgram: PropTypes.bool.isRequired,
		language: PropTypes.string.isRequired,
		currencies: PropTypes.array.isRequired,
		t: PropTypes.func.isRequired,
	};

	static defaultProps = {
		isBountyProgram: false,
	};

	constructor(props) {
		super(props);
		this.initialState = {
			date: {
				from: new Date(moment().subtract(1, "week").toString()),
				to: new Date(),
			},
			queryData: {
				from: "",
				to: "",
				referral_link: "",
			},
			chartData: [],
			tableData: [],
			activeTab: "",
			referralLinks: [{ value: "*", label: "All" }],
			selectedLink: { value: "*", label: "All" },
			rewards: {
				total: 0,
				today: 0,
			},
			registrations: {
				total: 0,
				today: 0,
			},
		};
		this.state = { ...this.initialState };
		this.controllers = {};
		this.signals = {};
	}

	componentDidMount() {
		this.setActiveTab("week");
		this.getReferralLinks();
		this.getCountAndRewards();
	}

	getCurrencyFromBalanceKey = () => {
		const { currentCurrency } = this.props;
		const currentCurrencyConfig = this.props.currencies.find((item) => item.balanceKey === currentCurrency);
		if (!currentCurrencyConfig) {
			return "";
		}
		return currentCurrencyConfig.code;
	};

	componentDidUpdate(prevProps, prevState) {
		if (JSON.stringify(prevState.queryData) !== JSON.stringify(this.state.queryData)) {
			this.getNewStatsData();
		}
		if (this.props.currentCurrency !== prevProps.currentCurrency) {
			// reset state if currency changed
			this.setState({
				...this.initialState,
				referralLinks: [...this.state.referralLinks],
				activeTab: "week",
				queryData: {
					to: moment().toString(),
					from: moment().subtract(1, "week").toString(),
				},
			});
			this.getCountAndRewards();
		}
	}

	createSignalAndController = (id) => {
		if (this.controllers[id]) {
			this.controllers[id].abort();
		}
		this.controllers[id] = new AbortController();
		this.signals[id] = this.controllers[id].signal;
	};

	componentWillUnmount() {
		Object.keys(this.controllers).forEach((key) => {
			if (this.controllers[key]) {
				this.controllers[key].abort();
			}
		});
	}

	setActiveTab = (tab) => {
		if (this.state.activeTab === tab) {
			return null;
		}
		this.setState({
			activeTab: tab,
		});
		const period = {
			from: this.state.date.from,
			to: this.state.date.to,
		};
		switch (tab) {
			case "month":
				period.to = moment().toString();
				period.from = moment().subtract(1, "months").toString();
				break;
			case "week":
				period.to = moment().toString();
				period.from = moment().subtract(1, "week").toString();
				break;
			default:
				break;
		}
		this.setState({ queryData: { ...this.state.queryData, ...period } });
	};

	handleDateChange = (date, name) => {
		this.setState({ date: { ...this.state.date, ...{ [name]: date } }, queryData: { ...this.state.queryData, ...{ [name]: date } } });
	};

	handleSelectChange = (selected) => {
		this.setState({ selectedLink: selected, queryData: { ...this.state.queryData, ...{ referral_link: selected.value } } });
	};

	getReferralLinks = async () => {
		this.createSignalAndController("links");
		try {
			const json = await fetchWithToken("/api/referral/referral-links", {
				method: "GET",
				signal: this.signals.links,
			});
			if (!json.success) {
				return false;
			}
			this.setState({
				referralLinks: [...this.state.referralLinks, ...json.data.map((link) => ({ value: link, label: link }))],
			});
		} catch (e) {
			console.error(e);
		}
	};

	getCountAndRewards = async () => {
		const { currentCurrency } = this.props;
		this.createSignalAndController("reward");
		try {
			const json = await fetchWithToken(`/api/referral/count-and-reward?currency=${currentCurrency}`, {
				method: "GET",
				signal: this.signals.reward,
			});
			if (!json.success) {
				return false;
			}
			this.setState({
				rewards: {
					total: this.prepareCurrencyValue(json.data.reward.total),
					today: this.prepareCurrencyValue(json.data.reward.today),
				},
				registrations: {
					total: json.data.users.total,
					today: json.data.users.today,
				},
			});
		} catch (e) {
			console.error(e);
		}
	};

	getNewStatsData = async () => {
		const { currentCurrency } = this.props;
		const { queryData } = this.state;
		this.createSignalAndController("stats");
		try {
			const json = await fetchWithToken(
				`/api/referral/stats-data?from=${moment(queryData.from).format("YYYY-MM-DD")}&to=${moment(queryData.to).format("YYYY-MM-DD")}&referral_link_id=${
					this.state.queryData.referral_link || "*"
				}&currency=${currentCurrency}`,
				{
					method: "GET",
					signal: this.signals.stats,
				}
			);
			if (!json.success) {
				return false;
			}
			const initialData = [{ type: "date", label: "Day" }, "Referral profit", "Referral users"];
			this.setState({
				chartData: [initialData, ...this.prepareChartData(queryData.from, queryData.to, json.data)],
				tableData: this.prepareTableData(json.data),
			});
		} catch (e) {
			console.error(e);
		}
	};

	prepareTableData = (data) => {
		const tableData = data.map((item) => ({
			...item,
			mining: this.prepareCurrencyValue(item.mining),
			purchases: this.prepareCurrencyValue(item.purchases),
			total_reward: this.prepareCurrencyValue(item.total_reward),
		}));
		return tableData.sort((obj1, obj2) => new Date(obj2.date) - new Date(obj1.date));
	};

	prepareCurrencyValue = (value) => {
		const { currentCurrency } = this.props;
		const currencyConfig = this.props.currencies.find((item) => item.balanceKey === currentCurrency);
		return decimalAdjust(value / currencyConfig.toSmall, currencyConfig.precision);
	};

	prepareChartData = (from, to, data) => {
		const datesRange = createDateRangeArray(new Date(from), new Date(to));
		return datesRange.map((range) => {
			const returnArr = [new Date(range.toString())];
			const itemInData = data.find((dataItem) => moment(dataItem.date).isSame(range, "day"));
			if (!itemInData) {
				returnArr.push(0, 0);
				return returnArr;
			}
			returnArr.push(this.prepareCurrencyValue(itemInData.total_reward), itemInData.registrations);
			return returnArr;
		});
	};

	render() {
		const currencyName = this.getCurrencyFromBalanceKey();
		const { currentCurrency, isBountyProgram, language, t, currencies } = this.props;
		return (
			<FadeAnimation>
				<Row noGutters={true} className="statistics-container">
					<Helmet>
						<title>{`Referral | RollerCoin.com | ${isBountyProgram ? "Bounty Program" : "Statistics"}`}</title>
					</Helmet>
					{!isBountyProgram && (
						<Col xs="12" lg="3" className="left-block">
							<div className="total-income-container">
								<p className="income-text">{t("main.total")}:</p>
								<p className="users-line">
									<img src="/static/img/referral/group_stats.svg" alt="group_stats" />
									<span className="count-users">{this.state.registrations.total}</span>
									<span className="small-text-stats">Users</span>
								</p>
								<p className="income-number">
									{scientificToDecimal(this.state.rewards.total)}
									<span className="small-text-stats">{currencyName}</span>
								</p>
							</div>
							<div className="total-income-container">
								<p className="income-text">{t("main.yesterday")}:</p>
								<p className="users-line">
									<img src="/static/img/referral/group_stats.svg" alt="group_stats" />
									<span className="count-users">{this.state.registrations.today}</span>
									<span className="small-text-stats">Users</span>
								</p>
								<p className="income-number today-income">
									{scientificToDecimal(this.state.rewards.today)}
									<span className="small-text-stats">{currencyName}</span>
								</p>
							</div>
							<div className="note-text">
								<p className="header-text">
									<span className="icon">
										<img src="/static/img/referral/stats_info.svg" alt="stats_info" />
									</span>
									<span className="text">{t("main.information")}</span>
								</p>
								<p className="body-text">
									{t("main.infoDescription")}
									<Link to={`${getLanguagePrefix(language)}/referral/info`}>{t("main.readHere")}</Link>
								</p>
							</div>
						</Col>
					)}
					<Col xs="12" lg={`${isBountyProgram ? "12" : "9"}`} className="right-block">
						<div className="statistics-right-block-container">
							{!isBountyProgram && <CopyLinkComponent />}
							<div className="navigation-block">
								<p className="navigation-title">{t("main.statistics")}:</p>
								<Nav pills className="nav-pills vertical-pills">
									<NavItem>
										<NavLink className={`${this.state.activeTab === "week" ? "active" : ""}`} onClick={() => this.setActiveTab("week")}>
											{t("main.week")}
										</NavLink>
									</NavItem>
									<NavItem>
										<NavLink className={`${this.state.activeTab === "month" ? "active" : ""}`} onClick={() => this.setActiveTab("month")}>
											{t("main.month")}
										</NavLink>
									</NavItem>
									<NavItem>
										<NavLink className={`${this.state.activeTab === "custom" ? "active" : ""}`} onClick={() => this.setActiveTab("custom")}>
											{t("main.customPeriod")}
										</NavLink>
									</NavItem>
								</Nav>
							</div>
							<div className="body-right-block dark-gray-bg">
								<Row className="filter-stats" noGutters={true}>
									<Col xs="12" className="mobile-filter-header">
										<p>Filter</p>
									</Col>
									{this.state.referralLinks.length > 2 && (
										<Col xs="12" lg="5" className="select-referral-link">
											<div className="header-filter">
												<p>Referral Link</p>
											</div>
											<div className="body-filter">
												<Select
													className="rollercoin-select-container"
													classNamePrefix="rollercoin-select"
													value={this.state.selectedLink}
													onChange={this.handleSelectChange}
													options={this.state.referralLinks}
													isClearable={false}
													isSearchable={false}
												/>
											</div>
										</Col>
									)}
									{this.state.activeTab === "custom" && (
										<Col xs="12" lg="7" className="datepicker-container">
											<Row noGutters={true}>
												<Col xs="12" lg="6" className="datepicker-block">
													<div className="header-filter">
														<p>From</p>
													</div>
													<div className="body-filter">
														<DatePicker
															selected={this.state.date.from}
															dateFormat="MMMM d, yyyy"
															onChange={(date) => this.handleDateChange(date, "from")}
															dropdownMode={"scroll"}
															minDate={new Date(moment().subtract(1, "years").toString())}
															maxDate={this.state.date.to}
														/>
													</div>
												</Col>
												<Col xs="12" lg="6" className="datepicker-block">
													<div className="header-filter">
														<p>To</p>
													</div>
													<div className="body-filter">
														<DatePicker
															selected={this.state.date.to}
															dateFormat="MMMM d, yyyy"
															onChange={(date) => this.handleDateChange(date, "to")}
															dropdownMode={"scroll"}
															minDate={this.state.date.from}
															maxDate={new Date()}
														/>
													</div>
												</Col>
											</Row>
										</Col>
									)}
								</Row>
								<ReferralChart data={this.state.chartData} />
							</div>
						</div>
						<TableIncome data={this.state.tableData} currentCurrency={currentCurrency} />
					</Col>
				</Row>
			</FadeAnimation>
		);
	}
}
export default withTranslation("Referral")(connect(mapStateToProps, null)(Statistics));
