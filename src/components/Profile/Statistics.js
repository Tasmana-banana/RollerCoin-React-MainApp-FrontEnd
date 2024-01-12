import React, { Component } from "react";
import moment from "moment";
import DatePicker from "react-datepicker";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import { Row, Col, Nav, NavItem, NavLink } from "reactstrap";
import fetchWithToken from "../../services/fetchWithToken";
import Chart from "./Chart";

import "../../assets/scss/Profile/IncomeStatsChart.scss";
import "react-datepicker/dist/react-datepicker.css";

class Statistics extends Component {
	constructor(props) {
		super(props);
		this.state = {
			activeTab: "",
			date: {
				from: new Date(moment().subtract(10, "days").toString()),
				to: new Date(moment().subtract(1, "day").toString()),
			},
			queryData: {
				from: "",
				to: "",
			},
			chartGamesData: [],
			chartPowerData: [],
			chartRankData: [],
		};
		this.controllers = {};
		this.signals = {};
	}

	componentDidMount() {
		this.setActiveTab("custom");
	}

	componentDidUpdate(prevProps, prevState) {
		if (JSON.stringify(prevState.queryData) !== JSON.stringify(this.state.queryData) || prevProps.filter !== this.props.filter) {
			this.getStatsByFilterProp();
		}
	}

	getStatsByFilterProp = async () => {
		if (!this.props.filter || this.props.filter === "games") {
			await this.getNewStatsGames();
		}
		if (!this.props.filter || this.props.filter === "power") {
			await this.getNewStatsPower();
		}
		if (!this.props.filter || this.props.filter === "rank") {
			await this.getNewStatsRank();
		}
	};

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

	getNewStatsGames = async () => {
		try {
			this.createSignalAndController("getNewStatsGames");
			const json = await fetchWithToken(
				`/api/profile/games-played-stats${this.props.uid ? `/${this.props.uid}` : ""}?from=${moment(this.state.queryData.from).format("YYYY-MM-DD")}&to=${moment(
					this.state.queryData.to
				).format("YYYY-MM-DD")}${this.props.uid ? `/${this.props.uid}` : ""}`,
				{
					method: "GET",
					signal: this.signals.getNewStatsGames,
				}
			);
			if (!json.success) {
				return false;
			}
			this.setState({ chartGamesData: json.data });
		} catch (e) {
			console.error(e);
		}
	};

	getNewStatsPower = async () => {
		try {
			this.createSignalAndController("getNewStatsPower");
			const json = await fetchWithToken(
				`/api/profile/power-and-rank-stats${this.props.uid ? `/${this.props.uid}` : ""}?type=power&from=${moment(this.state.queryData.from).format("YYYY-MM-DD")}&to=${moment(
					this.state.queryData.to
				).format("YYYY-MM-DD")}`,
				{
					method: "GET",
					signal: this.signals.getNewStatsPower,
				}
			);
			if (!json.success) {
				return false;
			}
			this.setState({ chartPowerData: json.data });
		} catch (e) {
			console.error(e);
		}
	};

	getNewStatsRank = async () => {
		try {
			this.createSignalAndController("getNewStatsRank");
			const json = await fetchWithToken(
				`/api/profile/power-and-rank-stats${this.props.uid ? `/${this.props.uid}` : ""}?type=rank&from=${moment(this.state.queryData.from).format("YYYY-MM-DD")}&to=${moment(
					this.state.queryData.to
				).format("YYYY-MM-DD")}`,
				{
					method: "GET",
					signal: this.signals.getNewStatsRank,
				}
			);
			if (!json.success) {
				return false;
			}
			this.setState({ chartRankData: json.data });
		} catch (e) {
			console.error(e);
		}
	};

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
		this.setState({ queryData: { ...this.state.queryData, ...period } });
	};

	handleDateFrom = (date) => {
		this.setState({ date: { ...this.state.date, ...{ from: date } }, queryData: { ...this.state.queryData, ...{ from: date } } });
	};

	handleDateTo = (date) => {
		this.setState({ date: { ...this.state.date, ...{ to: date } }, queryData: { ...this.state.queryData, ...{ to: date } } });
	};

	render() {
		const { hideControl, filter, t } = this.props;
		const { activeTab } = this.state;
		return (
			<div className="stats-chart-container">
				{!hideControl && (
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
				)}
				<div className="body-chart-block">
					{!hideControl && (
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
													selected={this.state.date.from}
													dateFormat="MMMM d, yyyy"
													onChange={this.handleDateFrom}
													dropdownMode={"scroll"}
													minDate={new Date(moment().subtract(3, "month").toString())}
													maxDate={this.state.date.to}
												/>
											</div>
										</Col>
										<Col xs="12" lg="6" className="datepicker-block">
											<div className="header-filter">
												<p>{t("to")}</p>
											</div>
											<div className="body-filter">
												<DatePicker
													selected={this.state.date.to}
													dateFormat="MMMM d, yyyy"
													onChange={this.handleDateTo}
													dropdownMode={"scroll"}
													minDate={this.state.date.from}
													maxDate={new Date(moment().subtract(1, "days").toString())}
												/>
											</div>
										</Col>
									</Row>
								</Col>
							)}
						</Row>
					)}
					{(!filter || filter === "games") && (
						<Chart data={this.state.chartGamesData} title={t("numberOfGamesPlayed")} lineConfig={{ pointBorderColor: "#2bd600", borderColor: "#2bd600" }} />
					)}
					{!filter && <div className="wrapper-line" />}
					{(!filter || filter === "power") && <Chart data={this.state.chartPowerData} title={t("playerPower")} />}
					{!filter && <div className="wrapper-line" />}
					{(!filter || filter === "rank") && <Chart data={this.state.chartRankData} title={t("playerRank")} />}
				</div>
			</div>
		);
	}
}

Statistics.propTypes = {
	uid: PropTypes.string.isRequired,
	hideControl: PropTypes.bool.isRequired,
	filter: PropTypes.string.isRequired,
	t: PropTypes.func.isRequired,
};
Statistics.defaultProps = {
	uid: "",
	hideControl: false,
	filter: "",
};

export default withTranslation("Profile")(Statistics);
