import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { history } from "../../../reducers";
import RankHeader from "./RankHeader";
import TopList from "./TopList";
import RankTable from "./RankTable";
import getCurrencyConfig from "../../../services/getCurrencyConfig";

const LeaderboardContent = ({ contests, sponsoredProviders, activeTab, rankData }) => {
	const language = useSelector((state) => state.game.language);
	const currencyConfig = getCurrencyConfig(contests[activeTab]?.reward.currency || "RLT");
	return (
		<Fragment>
			{contests[activeTab]?.isActive && <RankHeader contests={contests} sponsoredProviders={sponsoredProviders} activeTab={activeTab} />}
			<div className="rank-content">
				<TopList leaderBoardUsers={rankData.items} poolReward={contests[activeTab]?.poolReward} history={history} currencyConfig={currencyConfig} />
				<div className="table-viewed-positions mgb-24">
					<div className="table-users light-gray-bg">
						<RankTable leaderBoardUsers={rankData} poolReward={contests[activeTab]?.poolReward} currencyConfig={currencyConfig} language={language} history={history} />
					</div>
				</div>
			</div>
		</Fragment>
	);
};

LeaderboardContent.propTypes = {
	contests: PropTypes.object.isRequired,
	sponsoredProviders: PropTypes.array.isRequired,
	activeTab: PropTypes.string.isRequired,
	rankData: PropTypes.object.isRequired,
};

export default LeaderboardContent;
