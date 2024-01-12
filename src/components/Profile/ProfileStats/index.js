import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import ProfileStatsStatistics from "./ProfileStatsStatistics";
import ProfileStatsRankTable from "./ProfileRankTable";
import PowerTable from "./PowerTable";
import GameTable from "./GameTable";
import FAQComponent from "../../FAQ/FAQComponent";
import fetchWithToken from "../../../services/fetchWithToken";

import "../../../assets/scss/Profile/ProfileStats.scss";

const INITIAL_POWER_DATA = {
	games: "0",
	miners: "0",
	total: "0",
	bonus: "0",
};

const INITIAL_GAME_PLAYED = {
	lost: "0",
	won: "0",
	total: "0",
};

const ProfileStats = ({ getCurrentRouteName }) => {
	const userID = useSelector((state) => state.user.uid);
	const [powerData, setPowerData] = useState(INITIAL_POWER_DATA);
	const [gamePlayed, setGamePlayed] = useState(INITIAL_GAME_PLAYED);
	const { t } = useTranslation("Profile");
	const controllers = {};
	const signals = {};

	useEffect(() => {
		Promise.all([getUserPowerData(), getPlayedGamesData()]);
		return () => {
			Object.keys(controllers).forEach((key) => {
				if (controllers[key]) {
					controllers[key].abort();
				}
			});
		};
	}, []);

	const createSignalAndController = (id) => {
		if (controllers[id]) {
			controllers[id].abort();
		}
		controllers[id] = new AbortController();
		signals[id] = controllers[id].signal;
	};

	const getPlayedGamesData = async () => {
		createSignalAndController("getPlayedData");
		try {
			const json = await fetchWithToken("/api/profile/games-played-count", {
				method: "GET",
				signal: signals.getPlayedData,
			});
			if (!json.success) {
				return false;
			}
			setGamePlayed(json.data);
		} catch (e) {
			console.error(e);
		}
	};

	const getUserPowerData = async () => {
		createSignalAndController("getPower");
		try {
			const json = await fetchWithToken("/api/profile/user-power-data", {
				method: "GET",
				signal: signals.getPower,
			});
			if (!json.success) {
				return false;
			}
			setPowerData(json.data);
		} catch (e) {
			console.error(e);
		}
	};

	return (
		<div className="profile-stats-page">
			<div className="profile-section-header">
				<p className="profile-section-title">{getCurrentRouteName()}</p>
				<p className="profile-section-description">{t("infoHints.profileStatsInfoMessage")}</p>
			</div>
			<Row className="profile-stats-wrapper" noGutters={false}>
				<Col xs="12" md="6">
					<div className="table-wrapper">
						<div className="table-responsive">
							<PowerTable data={powerData} />
						</div>
					</div>
				</Col>
				<Col xs="12" md="6">
					<div className="table-wrapper">
						<div className="table-responsive">
							<GameTable content={gamePlayed} />
						</div>
					</div>
				</Col>
			</Row>
			<Row className="profile-stats-wrapper" noGutters={true}>
				<Col xs="12">
					<Row noGutters={false}>
						<Col xs="12">
							<ProfileStatsStatistics filter="games" />
						</Col>
					</Row>
					<Row noGutters={false}>
						<Col xs="12">
							<ProfileStatsRankTable uid={userID} />
						</Col>
					</Row>
					<Row noGutters={false}>
						<Col xs="12">
							<FAQComponent title={t("profileFaqTitle")} keys={["howChangeEmail", "whyCantLogin", "whereCanFindStatistic", "howConnectNFT"]} />
						</Col>
					</Row>
				</Col>
			</Row>
		</div>
	);
};

ProfileStats.propTypes = {
	getCurrentRouteName: PropTypes.func.isRequired,
};

export default ProfileStats;
