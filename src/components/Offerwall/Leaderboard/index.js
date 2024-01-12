import React, { Fragment, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { Container } from "reactstrap";
import { useRouteMatch } from "react-router-dom";
import CompetitionTabs from "./CompetitionTabs";
import LeaderboardContent from "./Leaderboard";
import FAQComponent from "../../FAQ/FAQComponent";
import getLanguagePrefix from "../../../services/getLanguagePrefix";
import fetchWithToken from "../../../services/fetchWithToken";
import { CONTEST_TYPE } from "../../../constants/Offerwall";

import "../../../assets/scss/Offerwall/Leadeboard.scss";

import loaderImg from "../../../assets/img/icon/hamster_loader.gif";
import weeklyIconActive from "../../../assets/img/offerwall/leaderboard/weekly_competition.svg";
import grandIconActive from "../../../assets/img/offerwall/leaderboard/grand_competition.svg";
import weeklyIcon from "../../../assets/img/offerwall/leaderboard/weekly_competition_active.svg";
import grandIcon from "../../../assets/img/offerwall/leaderboard/grand_competition_active.svg";

const LeaderBoard = ({ contests, sponsoredProviders }) => {
	const language = useSelector((state) => state.game.language);
	const [isLoading, setIsLoading] = useState(false);
	const [rankData, setRankData] = useState({
		items: [],
		currentUser: {},
	});
	const [tabsConfig, setTabsConfig] = useState({
		weekly: {
			title: "weekly competition",
			titleMobile: "weekly",
			icon: weeklyIcon,
			iconActive: weeklyIconActive,
			href: `${getLanguagePrefix(language)}/taskwall/leaderboard/${CONTEST_TYPE.WEEKLY}`,
		},
		grand: { title: "grand competition", titleMobile: "grand", icon: grandIcon, iconActive: grandIconActive, href: `${getLanguagePrefix(language)}/taskwall/leaderboard/${CONTEST_TYPE.GRAND}` },
	});
	const [activeTab, setActiveTab] = useState("");
	const match = useRouteMatch();
	const controllers = {};
	const signals = {};

	useEffect(() => {
		if (match.params.type) {
			return setActiveTab(match.params.type);
		}

		if (contests?.[CONTEST_TYPE.WEEKLY]?.isActive) {
			return setActiveTab(CONTEST_TYPE.WEEKLY);
		}

		return setActiveTab(CONTEST_TYPE.GRAND);
	}, []);

	useEffect(async () => {
		setRankData({ items: [], currentUser: {} });
		if (contests[activeTab]?.isActive) {
			await getContestRank(contests[activeTab].id, contests[activeTab].maxRewardPlaces);
		}
	}, [activeTab]);

	useEffect(() => {
		return () => {
			Object.keys(controllers).forEach((key) => {
				if (controllers[key]) {
					controllers[key].abort();
				}
			});
		};
	}, []);
	const getContestRank = async (contestId, limit) => {
		setIsLoading(true);
		try {
			createSignalAndController("getContestRank");
			const json = await fetchWithToken(`/api/offerwall/active-contest-rank?contest_id=${contestId}&limit=${limit}`, {
				method: "GET",
				signal: signals.getContestRank,
			});
			if (!json.success) {
				return console.error(json.error);
			}
			setRankData({ items: json.data.items, currentUser: json.data.currentUser });
		} catch (err) {
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};
	const createSignalAndController = (id) => {
		if (controllers[id]) {
			controllers[id].abort();
		}
		controllers[id] = new AbortController();
		signals[id] = controllers[id].signal;
	};

	const onSelectTab = (tab) => {
		setActiveTab(tab);
	};

	const isAllContestsActive = !!contests?.[CONTEST_TYPE.WEEKLY]?.isActive && !!contests?.[CONTEST_TYPE.GRAND]?.isActive;

	return (
		<Container className="leaderboard-wrapper">
			{isLoading && !activeTab && (
				<div className="preloader">
					<div>
						<img src={loaderImg} width={195} height={195} className="loader-img" alt="hamster loader" />
					</div>
				</div>
			)}
			{!!activeTab && (
				<Fragment>
					{isAllContestsActive && (
						<CompetitionTabs tabsConfig={tabsConfig} activeTab={activeTab} className={isAllContestsActive ? "" : "test"} onSelect={(tab) => onSelectTab(tab)}>
							<LeaderboardContent contests={contests} sponsoredProviders={sponsoredProviders} activeTab={activeTab} rankData={rankData} />
						</CompetitionTabs>
					)}
					{!isAllContestsActive && <LeaderboardContent contests={contests} sponsoredProviders={sponsoredProviders} activeTab={activeTab} rankData={rankData} />}
					<FAQComponent title="FAQ - Task Wall" keys={["taskWallLeaderboardRulesWeekly", "taskWallLeaderboardRulesGrand", "taskWallLeaderboardRulesRewards"]} />
				</Fragment>
			)}
		</Container>
	);
};

LeaderBoard.propTypes = {
	contests: PropTypes.object.isRequired,
	sponsoredProviders: PropTypes.array.isRequired,
};

export default LeaderBoard;
