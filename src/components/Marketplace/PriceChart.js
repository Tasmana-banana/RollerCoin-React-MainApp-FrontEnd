import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Nav, NavItem, NavLink } from "reactstrap";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Line } from "react-chartjs-2";
import getCurrencyConfig from "./helpers/getCurrencyConfig";
import decimalAdjust from "../../services/decimalAdjust";
import fetchWithToken from "../../services/fetchWithToken";

import "../../assets/scss/Marketplace/PriceChart.scss";

dayjs.extend(utc);

const defaultChartData = {
	labels: [],
	datasets: [
		{
			label: "",
			yAxisID: "y-axis-0",
			borderColor: "#03e1e4",
			pointBorderColor: "#03e1e4",
			pointBackgroundColor: "#03e1e4",
			pointHoverBackgroundColor: "rgba(75,192,192,1)",
			lineTension: 0.1,
			backgroundColor: "rgba(0,0,0,0)",
			pointHoverBorderColor: "rgba(220,220,220,1)",
			borderCapStyle: "round",
			borderDash: [1, 6],
			borderWidth: 0,
			borderJoinStyle: "miter",
			pointBorderWidth: 0,
			pointHoverRadius: 6,
			pointHoverBorderWidth: 0,
			pointRadius: 4,
			pointHitRadius: 10,
			data: [],
		},
	],
};

const PriceChart = ({ itemType, itemId, currency }) => {
	const isMobile = useSelector((state) => state.game.isMobile);
	const { t } = useTranslation("Marketplace");
	const [chartData, setChartData] = useState(defaultChartData);
	const [chartPeriod, setChartPeriod] = useState(7);
	const RLTConfig = getCurrencyConfig("RLT");

	let controller = new AbortController();
	let signals = controller.signal;

	const createSignalAndController = () => {
		if (controller) {
			controller.abort();
		}
		controller = new AbortController();
		signals = controller.signal;
	};

	useEffect(async () => {
		await pricesMedian();
		return () => {
			if (controller) {
				controller.abort();
			}
		};
	}, []);

	const pricesMedian = async (period) => {
		const fromDate = dayjs
			.utc()
			.subtract(period || chartPeriod, "day")
			.startOf("day")
			.format();
		const toDate = dayjs.utc().format();
		createSignalAndController();
		try {
			const json = await fetchWithToken(`/api/marketplace/sale-median-prices?itemType=${itemType}&itemId=${itemId}&currency=${currency}&fromDate=${fromDate}&toDate=${toDate}`, {
				method: "GET",
				signal: signals,
			});
			if (!json.success) {
				return false;
			}
			setChartData({
				labels: json.data.map((obj) => obj.date),
				datasets: [
					{
						...defaultChartData.datasets[0],
						data: json.data.map((obj) => ({ x: obj.date, y: decimalAdjust(obj.value / RLTConfig.toSmall, RLTConfig.precision) })),
					},
				],
			});
		} catch (e) {
			console.error(e);
		}
	};

	const chartPeriodHandler = async (period) => {
		setChartPeriod(period);
		await pricesMedian(period);
	};

	return (
		<div className="marketplace-price-chart">
			{isMobile && <p className="marketplace-navigation-title">{t("main.medianSellPrice")}:</p>}
			<div className="marketplace-navigation-block">
				{!isMobile && <p className="marketplace-navigation-title">{t("main.medianSellPrice")}:</p>}
				<Nav pills className="marketplace-nav-pills">
					<NavItem>
						<NavLink className={`${chartPeriod === 7 ? "active" : ""}`} onClick={() => chartPeriodHandler(7)}>
							{t("main.7days")}
						</NavLink>
					</NavItem>
					<NavItem>
						<NavLink className={`${chartPeriod === 30 ? "active" : ""}`} onClick={() => chartPeriodHandler(30)}>
							{t("main.30days")}
						</NavLink>
					</NavItem>
					<NavItem>
						<NavLink className={`${chartPeriod === 60 ? "active" : ""}`} onClick={() => chartPeriodHandler(60)}>
							{t("main.60days")}
						</NavLink>
					</NavItem>
				</Nav>
			</div>
			<div className="chart-container">
				<Line
					height={isMobile ? 200 : 100}
					data={chartData}
					options={{
						responsive: true,
						legend: {
							display: false,
						},
						title: {
							display: false,
							fontSize: 20,
							fontFamily: "Roboto",
							fontColor: "#ffffff",
							text: "",
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
											day: "MMM DD",
											week: "MMM DD",
											month: "MMM DD",
											quarter: "MMM DD",
											year: "MMM DD",
										},
										minUnit: "day",
										tooltipFormat: "MMMM DD, YYYY",
									},
									ticks: {
										fontColor: "#ffffff",
										fontSize: 16,
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
									gridLines: {
										color: "#595467",
									},
									ticks: {
										callback: (label) => `${label} RLT`,
										precision: 3,
										min: 0,
										fontColor: "#ffffff",
										fontSize: 16,
										fontFamily: "Roboto",
									},
									display: true,
									scaleLabel: {
										display: false,
									},
								},
							],
						},
						tooltips: {
							custom(tooltip) {
								if (!tooltip) {
									return;
								}
								tooltip.displayColors = false;
								if (tooltip.body) {
									tooltip.body[0].lines = [`${tooltip.body[0].lines[0]} RLT`];
								}
							},
						},
					}}
				/>
			</div>
		</div>
	);
};

PriceChart.propTypes = {
	itemType: PropTypes.string.isRequired,
	itemId: PropTypes.string.isRequired,
	currency: PropTypes.string.isRequired,
};

export default PriceChart;
