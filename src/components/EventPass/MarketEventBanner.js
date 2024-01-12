import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import EventTimer from "../SingleComponents/EventTimer";

import "../../assets/scss/Game/MarketEventBanner.scss";

import rankInfoIcon from "../../assets/img/offerwall/leaderboard/rank_info.svg";

const MarketEventBanner = ({ dateEnd, seasonId, action }) => {
	const { t } = useTranslation("Game");
	const bannerBackgroundImage = `url("${process.env.STATIC_URL}/static/img/seasons/${seasonId}/main_banner.gif")`;
	return (
		<div className="event-banner-wrapper">
			<div className="event-timer-wrapper">
				<EventTimer toDate={dateEnd} minWidth={235} />
			</div>
			<div className="event-banner-container">
				<div className="event-banner" style={{ background: `${bannerBackgroundImage} center center / cover no-repeat` }} onClick={action}>
					<img src={rankInfoIcon} width={32} height={32} alt="Rank info icon" className="event-info-icon" />
				</div>
				<button type="button" className="info-btn" onClick={action}>
					<span className="btn-text">{t("market.moreDetails")}</span>
				</button>
			</div>
		</div>
	);
};

MarketEventBanner.propTypes = {
	dateEnd: PropTypes.string.isRequired,
	seasonId: PropTypes.string.isRequired,
	action: PropTypes.func.isRequired,
};

export default MarketEventBanner;
