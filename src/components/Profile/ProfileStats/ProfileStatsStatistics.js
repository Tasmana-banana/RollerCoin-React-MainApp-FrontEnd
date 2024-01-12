import React, { useEffect, useState } from "react";
import moment from "moment";
import DatePicker from "react-datepicker";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import fetchWithToken from "../../../services/fetchWithToken";
import Chart from "../Chart";

import "../../../assets/scss/Profile/ProfileStatsStatistics.scss";
import "react-datepicker/dist/react-datepicker.css";

const INITIAL_DATE = {
	from: new Date(moment().subtract(10, "days").toString()),
	to: new Date(moment().subtract(1, "day").toString()),
};

const ProfileStatsStatistics = ({ filter = "", uid = "", hideControl = false }) => {
	const [activeDashboard, setActiveDashboard] = useState(filter);
	const [activeDateFilter, setActiveDateFilter] = useState("");
	const [date, setDate] = useState(INITIAL_DATE);
	const [requestUrls, setRequestUrls] = useState({ games: "", power: "", rank: "" });
	const [chartGamesData, setChartGamesData] = useState([]);
	const [chartPowerData, setChartPowerData] = useState([]);
	const [chartRankData, setChartRankData] = useState([]);
	const controllers = {};
	const signals = {};
	const { t } = useTranslation("Profile");

	useEffect(() => {
		setActiveDateFilter("custom");
		return () => {
			Object.keys(controllers).forEach((key) => {
				if (controllers[key]) {
					controllers[key].abort();
				}
			});
		};
	}, []);

	useEffect(async () => {
		await getStatsByFilterProp();
	}, [date, activeDashboard]);

	const getStatsByFilterProp = async () => {
		if (activeDashboard === "games") {
			await getNewStatsGames();
		}
		if (activeDashboard === "power") {
			await getNewStatsPower();
		}
		if (activeDashboard === "rank") {
			await getNewStatsRank();
		}
	};

	const createSignalAndController = (id) => {
		if (controllers[id]) {
			controllers[id].abort();
		}
		controllers[id] = new AbortController();
		signals[id] = controllers[id].signal;
	};

	const getNewStatsGames = async () => {
		const requestUrl = `/api/profile/games-played-stats${uid ? `/${uid}` : ""}?from=${moment(date.from).format("YYYY-MM-DD")}&to=${moment(date.to).format("YYYY-MM-DD")}${uid ? `/${uid}` : ""}`;
		if (requestUrls.games === requestUrl) {
			return null;
		}
		try {
			createSignalAndController("getNewStatsGames");
			const json = await fetchWithToken(requestUrl, {
				method: "GET",
				signal: signals.getNewStatsGames,
			});
			if (!json.success) {
				return false;
			}
			setRequestUrls({ ...requestUrls, games: requestUrl });
			setChartGamesData(json.data);
		} catch (e) {
			console.error(e);
		}
	};

	const getNewStatsPower = async () => {
		const requestUrl = `/api/profile/power-and-rank-stats${uid ? `/${uid}` : ""}?type=power&from=${moment(date.from).format("YYYY-MM-DD")}&to=${moment(date.to).format("YYYY-MM-DD")}`;
		if (requestUrls.power === requestUrl) {
			return null;
		}
		try {
			createSignalAndController("getNewStatsPower");
			const json = await fetchWithToken(requestUrl, {
				method: "GET",
				signal: signals.getNewStatsPower,
			});
			if (!json.success) {
				return false;
			}
			setRequestUrls({ ...requestUrls, power: requestUrl });
			setChartPowerData(json.data);
		} catch (e) {
			console.error(e);
		}
	};

	const getNewStatsRank = async () => {
		const requestUrl = `/api/profile/power-and-rank-stats${uid ? `/${uid}` : ""}?type=rank&from=${moment(date.from).format("YYYY-MM-DD")}&to=${moment(date.to).format("YYYY-MM-DD")}`;
		if (requestUrls.rank === requestUrl) {
			return null;
		}
		try {
			createSignalAndController("getNewStatsRank");
			const json = await fetchWithToken(requestUrl, {
				method: "GET",
				signal: signals.getNewStatsRank,
			});
			if (!json.success) {
				return false;
			}
			setRequestUrls({ ...requestUrls, rank: requestUrl });
			setChartRankData(json.data);
		} catch (e) {
			console.error(e);
		}
	};

	const setActiveTab = (tab) => {
		if (activeDateFilter === tab) {
			return null;
		}
		setActiveDateFilter(tab);
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
		setDate({ from: new Date(period.from.toString()), to: new Date(period.to.toString()) });
	};

	const handleDateFrom = (newDate) => {
		setDate({ ...date, from: newDate });
	};

	const handleDateTo = (newDate) => {
		setDate({ ...date, to: newDate });
	};

	const activeDashboardHandler = (dashboard) => {
		setActiveDashboard(dashboard);
	};

	return (
		<div className="profile-statistics-container">
			<div className="profile-section-header">
				<p className="profile-section-title">{t("statistics")}</p>
			</div>
			<div className="navigation-block">
				<div className="profile-stats-nav-buttons main-buttons">
					<button className={`profile-stats-nav-link ${activeDashboard === "games" ? "active" : ""}`} onClick={() => activeDashboardHandler("games")}>
						{t("numberOfGamesPlayed")}
					</button>
					<button className={`profile-stats-nav-link ${activeDashboard === "power" ? "active" : ""}`} onClick={() => activeDashboardHandler("power")}>
						{t("playerPower")}
					</button>
					<button className={`profile-stats-nav-link last ${activeDashboard === "rank" ? "active" : ""}`} onClick={() => activeDashboardHandler("rank")}>
						{t("playerRank")}
					</button>
				</div>
			</div>
			<div className="profile-statistics-wrapper">
				{!hideControl && (
					<div className="navigation-block date-filter">
						<div className="profile-stats-nav-buttons date-filter-buttons">
							<button className={`profile-stats-nav-link ${activeDateFilter === "week" ? "active" : ""}`} onClick={() => setActiveTab("week")}>
								{t("week")}
							</button>
							<button className={`profile-stats-nav-link ${activeDateFilter === "month" ? "active" : ""}`} onClick={() => setActiveTab("month")}>
								{t("month")}
							</button>
							<button className={`profile-stats-nav-link last ${activeDateFilter === "custom" ? "active" : ""}`} onClick={() => setActiveTab("custom")}>
								{t("custom")}
							</button>
						</div>
						<div className="datepicker-container">
							<div className="datepicker-block">
								<div className="header-filter">
									<p>{t("from")}</p>
								</div>
								<div className={`body-filter ${activeDateFilter === "week" || activeDateFilter === "month" ? "disabled" : ""}`}>
									<DatePicker
										selected={date.from}
										dateFormat="MMMM d, yyyy"
										onChange={handleDateFrom}
										dropdownMode={"scroll"}
										minDate={new Date(moment().subtract(3, "month").toString())}
										maxDate={date.to}
										disabled={activeDateFilter === "week" || activeDateFilter === "month"}
									/>
								</div>
							</div>
							<div className="datepicker-block">
								<div className="header-filter">
									<p>{t("to")}</p>
								</div>
								<div className={`body-filter ${activeDateFilter === "week" || activeDateFilter === "month" ? "disabled" : ""}`}>
									<DatePicker
										selected={date.to}
										dateFormat="MMMM d, yyyy"
										onChange={handleDateTo}
										dropdownMode={"scroll"}
										minDate={date.from}
										maxDate={new Date(moment().subtract(1, "days").toString())}
										disabled={activeDateFilter === "week" || activeDateFilter === "month"}
									/>
								</div>
							</div>
						</div>
					</div>
				)}
				{activeDashboard === "games" && <Chart data={chartGamesData} title={t("numberOfGamesPlayed")} lineConfig={{ pointBorderColor: "#2bd600", borderColor: "#2bd600" }} />}
				{activeDashboard === "power" && <Chart data={chartPowerData} title={t("playerPower")} />}
				{activeDashboard === "rank" && <Chart data={chartRankData} title={t("playerRank")} />}
			</div>
		</div>
	);
};

ProfileStatsStatistics.propTypes = {
	uid: PropTypes.string,
	hideControl: PropTypes.bool,
	filter: PropTypes.string,
};

export default ProfileStatsStatistics;
