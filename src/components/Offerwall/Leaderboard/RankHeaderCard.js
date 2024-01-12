import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { history } from "../../../reducers";
import RankHeaderTimer from "./RankHeaderTimer";
import getCurrencyConfig from "../../../services/getCurrencyConfig";
import getLanguagePrefix from "../../../services/getLanguagePrefix";
import decimalAdjust from "../../../services/decimalAdjust";

import rankInfoIcon from "../../../assets/img/offerwall/leaderboard/rank_info.svg";

const RankHeaderCard = ({ contest, toggleModalPoolReward, activeTab, isWeeklyAndGrandActive = false }) => {
	const language = useSelector((state) => state.game.language);
	const { t } = useTranslation("Offerwall");
	const currencyConfig = getCurrencyConfig(contest.reward.currency);
	return (
		<div className="rank-header-container" onClick={() => history.push(`${getLanguagePrefix(language)}/taskwall/leaderboard/${activeTab}`)}>
			<div
				className="rank-header"
				style={{
					background: `url(${process.env.STATIC_URL}/static/img/offerwalls/contests/default/${contest.backgroundImg}) center center / cover no-repeat`,
				}}
				onClick={toggleModalPoolReward}
			>
				<img src={rankInfoIcon} width={32} height={32} alt="Rank info icon" className={`header-info-icon ${isWeeklyAndGrandActive ? "double-banner" : ""}`} />
				<div className={`weekly-reward-block`}>
					<RankHeaderTimer contest={contest} />
					<div className={`reward-data ${contest.description[language] ? "" : "with-padding"}`}>
						<img className="reward-icon" src={`/static/img/wallet/${currencyConfig.img}.svg?v=1.13`} width={48} height={48} alt="currency icon" />
						<span className="reward-amount">
							{decimalAdjust(contest.reward.amount / currencyConfig.toSmall, currencyConfig.precision)
								.toString()
								.replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
						</span>
					</div>
				</div>
				<div className="reward-title-block">
					<p className="reward-title">{contest.title[language] || contest.title.en}</p>
					<p className="reward-description">{contest.description[language]}</p>
				</div>
			</div>
			<div className="info-block">
				<button type="button" className="info-btn" onClick={() => toggleModalPoolReward()}>
					<span className="btn-text">{t("moreDetails")}</span>
				</button>
			</div>
		</div>
	);
};

RankHeaderCard.propTypes = {
	contest: PropTypes.object.isRequired,
	toggleModalPoolReward: PropTypes.func.isRequired,
	activeTab: PropTypes.string.isRequired,
	isWeeklyAndGrandActive: PropTypes.bool,
};
export default RankHeaderCard;
