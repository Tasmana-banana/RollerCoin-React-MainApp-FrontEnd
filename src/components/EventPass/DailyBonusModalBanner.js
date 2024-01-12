import React, { Fragment } from "react";
import LazyLoad from "react-lazyload";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import getLanguagePrefix from "../../services/getLanguagePrefix";

import clockIcon from "../../assets/img/icon/clock_icon.svg";

const mapStateToProps = (state) => ({
	isMobile: state.game.isMobile,
	language: state.game.language,
});

const DailyBonusModalBanner = ({ isMobile, language, seasonsId, imgVer, viewTime, toggleBonusModal, t }) => {
	const logoImgUrl = `${process.env.STATIC_URL}/static/img/seasons/${seasonsId}/logo.png?v=${imgVer}`;
	const backgroundImgUrl = `url("${process.env.STATIC_URL}/static/img/seasons/${seasonsId}/${isMobile ? "daily_bg_mobile" : "daily_bg_desktop"}.png?v=${imgVer}")`;
	return (
		<div className="daily-bonus-banner" style={{ backgroundImage: backgroundImgUrl }}>
			<LazyLoad className="daily-bonus-banner-logo" offset={100}>
				<img className="daily-bonus-logo-img w-100" src={logoImgUrl} width="260" height="80" alt="logo" />
			</LazyLoad>
			<div className="remaining-time">
				<div className="time-icon-wrapper">
					<div className="time-icon">
						<LazyLoad offset={100}>
							<img src={clockIcon} alt="timer" />
						</LazyLoad>
					</div>
				</div>
				<p className="time-text">
					{viewTime.days && `${viewTime.days}`} {viewTime.hours} {viewTime.minutes}
				</p>
			</div>
			{!isMobile && (
				<Fragment>
					<div className="best-rewards-image" />
					<Link to={`${getLanguagePrefix(language)}/game/market/season-pass`} onClick={toggleBonusModal} className="banner-btn tree-dimensional-button btn-gold">
						<span className="btn-text">{t("eventPass.start")}</span>
					</Link>
				</Fragment>
			)}
		</div>
	);
};

DailyBonusModalBanner.propTypes = {
	seasonsId: PropTypes.string.isRequired,
	imgVer: PropTypes.string.isRequired,
	viewTime: PropTypes.object.isRequired,
	toggleBonusModal: PropTypes.func.isRequired,
	t: PropTypes.func.isRequired,
	language: PropTypes.string.isRequired,
	isMobile: PropTypes.bool.isRequired,
};

export default withTranslation("Game")(connect(mapStateToProps, null)(DailyBonusModalBanner));
