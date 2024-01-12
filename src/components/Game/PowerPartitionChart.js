import React, { Component } from "react";
import PropTypes from "prop-types";
import { Chart } from "react-google-charts";

class PowerPartitionChart extends Component {
	static propTypes = {
		miningConfig: PropTypes.array.isRequired,
	};

	getChartConfig = () => {
		const initialBars = ["Currency", "Value"];
		const { miningConfig } = this.props;
		const bars = miningConfig.map((item) => [item.fullName, item.percent]);
		const colors = miningConfig.map((item) => item.color);
		return { bars: [initialBars, ...bars], colors };
	};

	render() {
		const chartConfig = this.getChartConfig();
		return (
			<Chart
				width={"100%"}
				chartType="PieChart"
				loader={<div>Loading Chart</div>}
				data={chartConfig.bars}
				className="partition-chart"
				options={{
					legend: "none",
					pieSliceText: "label",
					pieSliceBorderColor: "#6a668a",
					backgroundColor: "transparent",
					chartArea: { left: 15, top: 15, width: "90%", height: "85%" },
					colors: chartConfig.colors,
				}}
			/>
		);
	}
}

export default PowerPartitionChart;
