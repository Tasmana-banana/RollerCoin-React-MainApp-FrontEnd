import React, { Component } from "react";
import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";

export default class Chart extends Component {
	static propTypes = {
		data: PropTypes.object.isRequired,
		title: PropTypes.string.isRequired,
		lineConfig: PropTypes.object,
	};

	constructor(props) {
		super(props);
		this.chartAxisConfig = {
			gridLines: {
				color: "#595467",
			},
			ticks: {
				precision: 0,
				min: 0,
				fontColor: "#ffffff",
				fontSize: 14,
				fontFamily: "Roboto",
			},
			display: true,
		};
		this.state = {
			chartConfig: {
				labels: [],
				datasets: [
					{
						label: "",
						yAxisID: "y-axis-0",
						borderColor: props.lineConfig ? props.lineConfig.borderColor || "#03e1e4" : "#03e1e4",
						pointBorderColor: props.lineConfig ? props.lineConfig.pointBorderColor || "rgba(75,192,192,1)" : "rgba(75,192,192,1)",
						pointBackgroundColor: "#fff",
						pointHoverBackgroundColor: "rgba(75,192,192,1)",
						lineTension: 0.1,
						backgroundColor: "rgba(0,0,0,0)",
						pointHoverBorderColor: "rgba(220,220,220,1)",
						borderCapStyle: "round",
						borderDash: [2, 3],
						borderWidth: 2,
						borderJoinStyle: "miter",
						pointBorderWidth: 5,
						pointHoverRadius: 5,
						pointHoverBorderWidth: 2,
						pointRadius: 1,
						pointHitRadius: 10,
						data: [],
					},
				],
			},
		};
	}

	setChartConfig() {
		this.setState({
			chartConfig: {
				labels: this.props.data.map((obj) => obj.date),
				datasets: [
					{
						...this.state.chartConfig.datasets[0],
						...{
							data: this.props.data.map((obj) => ({ x: obj.date, y: obj.value })),
						},
						...{ label: this.props.title },
					},
				],
			},
		});
	}

	componentDidMount() {
		this.setChartConfig();
	}

	componentDidUpdate(prevProps) {
		if (JSON.stringify(prevProps.data) !== JSON.stringify(this.props.data)) {
			this.setChartConfig();
		}
	}

	render() {
		return (
			<div className="chart-container">
				<div className="chart-title">{this.props.title}</div>
				<Line
					data={this.state.chartConfig}
					options={{
						responsive: true,
						legend: {
							display: false,
						},
						title: {
							display: false,
							fontSize: 14,
							fontFamily: "Roboto",
							fontColor: "#ffffff",
							text: this.props.title,
						},
						scales: {
							xAxes: [
								{
									gridLines: {
										color: "#595467",
										borderDash: [4, 4],
									},
									type: "time",
									time: {
										displayFormats: {
											day: "MMM DD, YYYY",
											week: "MMM DD, YYYY",
											month: "MMM DD, YYYY",
											quarter: "MMM DD",
											year: "MMM DD",
										},
										minUnit: "day",
										tooltipFormat: "MMMM DD, YYYY",
									},
									ticks: {
										fontColor: "#ffffff",
										fontSize: 11,
										fontFamily: "Roboto",
										maxRotation: 0,
										minRotation: 0,
										autoSkip: true,
										autoSkipPadding: 20,
										padding: 20,
									},
									display: true,
								},
							],
							yAxes: [
								{
									...{
										scaleLabel: {
											display: false,
										},
									},
									...this.chartAxisConfig,
								},
							],
						},
						tooltips: {
							custom(tooltip) {
								if (!tooltip) {
									return;
								}
								tooltip.displayColors = false;
							},
						},
					}}
				/>
			</div>
		);
	}
}
