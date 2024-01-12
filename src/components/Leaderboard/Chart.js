import React, { Component } from "react";
import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";

export default class Chart extends Component {
	constructor(props) {
		super(props);
		this.dates = (() => {
			const dates = [];
			for (let i = 0; i < 7; i += 1) {
				const now = new Date();
				const pastDate = now.getTime() - i * 24 * 60 * 60 * 1000;
				dates.push(new Date(pastDate));
			}
			return dates;
		})();
		this.state = {
			color: "#03e1e4",
		};
	}

	static min(input) {
		if (toString.call(input) !== "[object Array]") {
			return false;
		}
		return Math.min.apply(null, input);
	}

	componentDidMount() {
		if (this.props.data[this.props.data.length - 1] !== this.props.data[this.props.data.length - 2]) {
			this.setState({
				color: this.props.data[this.props.data.length - 1] < this.props.data[this.props.data.length - 2] ? "#ff000b" : "#33d520",
			});
		}
	}

	componentDidUpdate(prevProps) {
		if (JSON.stringify(prevProps.data) !== JSON.stringify(this.props.data)) {
			if (this.props.data[this.props.data.length - 1] !== this.props.data[this.props.data.length - 2]) {
				this.setState({
					color: this.props.data[this.props.data.length - 1] < this.props.data[this.props.data.length - 2] ? "#ff000b" : "#33d520",
				});
			} else {
				this.setState({
					color: "#03e1e4",
				});
			}
		}
	}

	render() {
		return (
			<Line
				data={{
					labels: this.dates,
					datasets: [
						{
							lineTension: 0.2,
							backgroundColor: "rgba(0,0,0,0)",
							pointHoverBorderColor: this.state.color,
							borderCapStyle: "round",
							borderDash: [3, 3],
							borderWidth: 2,
							borderJoinStyle: "miter",
							pointBorderWidth: 0,
							pointHoverRadius: 2,
							pointHoverBorderWidth: 0,
							pointRadius: 2,
							pointHitRadius: 2,
							borderColor: this.state.color,
							pointBorderColor: this.state.color,
							pointBackgroundColor: this.state.color,
							pointHoverBackgroundColor: this.state.color,
							data: this.dates.map((date, i) => ({
								x: date,
								y: this.props.data[this.props.data.length - (i + 1)] || 0,
							})),
						},
					],
				}}
				options={{
					responsive: true,
					maintainAspectRatio: false,
					legend: {
						display: false,
					},
					layout: {
						padding: {
							left: 3,
							right: 3,
							top: 3,
							bottom: 8,
						},
					},
					scales: {
						xAxes: [
							{
								type: "time",
								display: false,
							},
						],
						yAxes: [
							{
								ticks: {
									precision: 0,
									min: this.constructor.min(this.props.data),
								},
								display: false,
							},
						],
					},
					tooltips: {
						enabled: false,
					},
				}}
			/>
		);
	}
}
Chart.propTypes = {
	data: PropTypes.array.isRequired,
};
