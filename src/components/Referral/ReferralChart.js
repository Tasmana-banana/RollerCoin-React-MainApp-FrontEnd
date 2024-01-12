import React from "react";
import PropTypes from "prop-types";
import { Chart } from "react-google-charts";
import ChartLoader from "../SingleComponents/ChartLoader";

const ReferralChart = ({ data }) => {
	const isMobile = window.screen.width < 992;
	const registrationsRangeArray = data.slice(1).map((item) => item[2]);
	const registrations = { min: Math.min(...registrationsRangeArray), max: Math.max(...registrationsRangeArray) || 1 };
	const earnedRangeArray = data.slice(1).map((item) => item[1]);
	const earnedMax = Math.max(...earnedRangeArray) || 1;
	return (
		<div className="chart-container">
			{!!data.length && (
				<Chart
					width={"100%"}
					height={"400px"}
					chartType="LineChart"
					loader={<div>Loading</div>}
					data={data}
					columns={[
						{ type: "date" },
						{
							type: "number",
							label: "",
						},
						{
							type: "number",
							label: "",
						},
					]}
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
						width: "100%",
						backgroundColor: {
							fill: "transparent",
						},
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
						series: {
							0: { color: "#2BD600", targetAxisIndex: 0 },
							1: { color: "#03e1e4", targetAxisIndex: 1 },
						},
						chartArea: { right: 40, top: 15, width: isMobile ? "70%" : "80%", height: "75%" },
						hAxis: {
							textStyle: { color: "#FFF" },
							baselineColor: "#4a4865",
							gridlines: { color: "#4a4865" },
							minorGridlines: { count: 0 },
							format: "MMM dd",
							slantedText: true,
							slantedTextAngle: 35,
						},
						vAxes: {
							0: {
								title: "Profit",
								viewWindowMode: "explicit",
								viewWindow: {
									min: 0,
									max: earnedMax,
								},
							},
							1: {
								title: "Users",
								gridlines: { color: "transparent" },
								ticks: [registrations.min, registrations.max],
								viewWindowMode: "explicit",
								viewWindow: {
									min: 0,
									max: registrations.max,
								},
							},
						},
						vAxis: {
							textStyle: { color: "#FFF" },
							maxAlternation: 10,
							gridlines: { color: "#4a4865" },
							minorGridlines: { count: 0 },
							baselineColor: "#fff",
						},
					}}
				/>
			)}
			{!data.length && <ChartLoader />}
		</div>
	);
};
ReferralChart.propTypes = {
	data: PropTypes.object.isRequired,
};
export default ReferralChart;
