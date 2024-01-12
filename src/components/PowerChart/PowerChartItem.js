import React, { Component } from "react";
import { Row, Col } from "reactstrap";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import Chart from "react-google-charts";
import moment from "moment";
import DatePicker from "react-datepicker";
import decimalAdjust from "../../services/decimalAdjust";
import createDateRangeArray from "../../services/createDateRangeArray";
import fetchWithToken from "../../services/fetchWithToken";
import "react-datepicker/dist/react-datepicker.css";

// Map Redux state to component props
const mapStateToProps = (state) => ({
	pathName: state.router.location.pathname,
	miningConfig: state.user.miningConfigUnauthorizedUser,
	rollerCurrencies: state.wallet.rollerCurrencies,
});

class PowerChartItemClass extends Component {
	static propTypes = {
		groupBy: PropTypes.string.isRequired,
		currency: PropTypes.string.isRequired,
		title: PropTypes.string.isRequired,
		pathName: PropTypes.string.isRequired,
		miningConfig: PropTypes.array.isRequired,
		rollerCurrencies: PropTypes.array.isRequired,
	};

	constructor(props) {
		super(props);
		this.state = {
			date: {
				from: new Date(moment().subtract(7, "days").toString()),
				to: new Date(),
			},
			chartData: [],
			isLoading: true,
		};
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevProps.currency !== this.props.currency || JSON.stringify(prevState.date) !== JSON.stringify(this.state.date)) {
			this.getChartItems();
		}
	}

	componentDidMount() {
		this.getChartItems();
	}

	componentWillUnmount() {
		if (this.controller) {
			this.controller.abort();
		}
	}

	getCurrentCurrencyConfig = () => {
		const { miningConfig, currency } = this.props;
		const currentCurrencyName = currency || "btc";
		const config = miningConfig.find((item) => currentCurrencyName === item.code);
		return config || { code: "", name: "", balanceKey: "" };
	};

	createSignalAndController = () => {
		if (this.controller) {
			this.controller.abort();
		}
		this.controller = new AbortController();
		this.signal = this.controller.signal;
	};

	getChartItems = async () => {
		this.createSignalAndController();
		const { groupBy } = this.props;
		const { date } = this.state;
		const currencyConfig = this.getCurrentCurrencyConfig();
		this.setState({ isLoading: true });
		try {
			const json = await fetchWithToken(
				`/api/mining/network-info-by-day?from=${moment(date.from).format("YYYY-MM-DD")}&to=${moment(date.to).format("YYYY-MM-DD")}&currency=${currencyConfig.balanceKey}&groupBy=${groupBy}`,
				{
					method: "GET",
					signal: this.signal,
				}
			);
			this.setState({ isLoading: false });
			if (!json.success) {
				return false;
			}
			this.setState({ chartData: [["date", "Value"], ...this.prepareData(json.data)], isLoading: false });
		} catch (e) {
			console.error(e);
		}
	};

	prepareData = (config) => {
		const { date } = this.state;
		const { groupBy, rollerCurrencies } = this.props;
		const currencyConfig = this.getCurrentCurrencyConfig();
		const configForCurrency = rollerCurrencies.find((item) => item.code === currencyConfig.code);
		if (!configForCurrency) {
			return null;
		}
		const datesRange = createDateRangeArray(new Date(date.from), new Date(date.to));
		return datesRange.map((range) => {
			const returnArr = [new Date(range.toString())];
			const itemInConfig = config.find((item) => moment(item.date).isSame(range, "day"));
			if (!itemInConfig) {
				returnArr.push(0);
				return returnArr;
			}
			switch (groupBy) {
				case "total_power": {
					returnArr.push(itemInConfig.value / 1000);
					break;
				}
				case "block_reward": {
					const value = decimalAdjust(itemInConfig.value / configForCurrency.toSmall / configForCurrency.divider, configForCurrency.precisionToBalance);
					returnArr.push(value);
					break;
				}
				case "duration": {
					const value = decimalAdjust(itemInConfig.value / 60, 2);
					returnArr.push(value);
					break;
				}
				case "reward_user_count": {
					returnArr.push(itemInConfig.value);
					break;
				}
				default: {
					returnArr.push(0);
				}
			}

			return returnArr;
		});
	};

	handleDateFrom = (date) => {
		this.setState({ date: { ...this.state.date, ...{ from: date } } });
	};

	handleDateTo = (date) => {
		this.setState({ date: { ...this.state.date, ...{ to: date } } });
	};

	render() {
		const { title } = this.props;
		const { chartData, isLoading } = this.state;
		return (
			<div className="chart-container">
				<Row>
					<Col xs={12} lg={6}>
						<h4 className="power-chart-title">{title}</h4>
					</Col>
					<Col xs={12} lg={6} className="datepicker-container">
						<Row>
							<Col xs="12" lg="6" className="datepicker-block">
								<div className="header-filter">
									<p>From</p>
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
									<p>To</p>
								</div>
								<div className="body-filter">
									<DatePicker
										selected={this.state.date.to}
										dateFormat="MMMM d, yyyy"
										onChange={this.handleDateTo}
										dropdownMode={"scroll"}
										minDate={this.state.date.from}
										maxDate={new Date()}
									/>
								</div>
							</Col>
						</Row>
					</Col>
				</Row>
				{!isLoading && (
					<Chart
						width={"100%"}
						height={"400px"}
						chartType="LineChart"
						columns={[
							{ type: "date" },
							{
								type: "number",
								label: "",
							},
						]}
						data={chartData}
						formatters={[
							{
								type: "DateFormat",
								column: 0,
								options: {
									pattern: "MMMM dd, YYYY",
								},
							},
							{
								type: "NumberFormat",
								column: 1,
								options: {
									pattern: "#.########",
								},
							},
						]}
						options={{
							curveType: "function",
							width: "100%",
							backgroundColor: "#2f3045",
							legend: { position: "none" },
							colors: ["#03e1e4"],
							lineDashStyle: [4, 4],
							pointSize: 5,
							interpolateNulls: true,
							pointShape: "circle",
							animation: {
								duration: 500,
								easing: "out",
							},
							hAxis: {
								textStyle: { color: "#FFF" },
								baselineColor: "#4a4865",
								gridlines: { color: "#4a4865" },
								minorGridlines: { count: 0 },
								format: "MMM dd",
								slantedText: true,
								slantedTextAngle: 35,
							},
							vAxis: {
								textStyle: { color: "#FFF" },
								gridlines: { color: "#6a668a" },
								maxAlternation: 10,
								minorGridlines: { count: 0 },
								baselineColor: "#fff",
								viewWindowMode: "explicit",
								viewWindow: {
									min: 0,
								},
							},
						}}
					/>
				)}
			</div>
		);
	}
}
const PowerChartItem = connect(mapStateToProps, null)(PowerChartItemClass);

export default withRouter(PowerChartItem);
