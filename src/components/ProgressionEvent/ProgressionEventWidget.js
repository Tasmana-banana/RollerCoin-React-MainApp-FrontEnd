import React, { Fragment } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { Progress } from "reactstrap";
import { MINERS_TYPES, RARITY_DATA_BY_LEVEL } from "../../constants/Storage";

import "../../assets/scss/ProgressionEvent/ProgressionEventWidget.scss";

const ProgressionEventWidget = ({ toggleModal, eventID, imgVer, startUserXp, currentLevelXp, userStats, reward, isCompleted, indented = false, isBannerLine = false }) => {
	const isMobile = useSelector((state) => state.game.isMobile);
	const { t } = useTranslation("ProgressionEvent");
	const backgroundURL = `${process.env.STATIC_URL}/static/img/pe/${eventID}/progression-event-widget-bg.png?v=${imgVer}`;

	return (
		<div className={`progression-event-widget ${isBannerLine ? "big" : ""}`}>
			<div
				className={`progression-event-widget-container ${indented ? "indented" : ""}`}
				style={isMobile ? {} : { backgroundImage: `url(${backgroundURL})` }}
				onClick={isMobile ? toggleModal : null}
			>
				{!isMobile && !isBannerLine && (
					<img
						className="progression-event-logo"
						src={`${process.env.STATIC_URL}/static/img/pe/${eventID}/progression-event-logo.png?v=${imgVer}`}
						width={180}
						height={56}
						alt="progression event logo"
					/>
				)}
				<div className="progression-icon-round-wrapper">
					<img className="progression-icon-round-img" src={`${process.env.STATIC_URL}/static/img/pe/${eventID}/progression-event-icon.png?v=${imgVer}`} width={48} height={48} alt="logo" />
					{!isCompleted && (
						<div className="progression-multiplier-wrapper">
							<p className="progression-multiplier-value">X{userStats.user_multiplier / 100}</p>
						</div>
					)}
				</div>
				<div className="progression-progress-block">
					<Progress value={isCompleted ? 100 : (startUserXp / currentLevelXp) * 100} className="progression-progress-bar" />
					<p className={`progression-progress-text ${isCompleted ? "complete" : ""}`}>{`${
						!isCompleted ? `${startUserXp}/${currentLevelXp} ${!isMobile ? t("points") : ""}` : t("gotAll")
					}`}</p>
				</div>
				<div className={`progression-reward-wrapper ${isCompleted ? "complete" : ""}`}>
					{reward && (
						<Fragment>
							{reward.type === "miner" && reward.item.type === MINERS_TYPES.MERGE && (
								<img
									className={`level-img-size-${reward.item.width || 2}`}
									src={`/static/img${RARITY_DATA_BY_LEVEL[reward.item.level].icon}`}
									width={isBannerLine ? 16 : 12}
									height={isBannerLine ? 12 : 9}
									alt={reward.item.level}
								/>
							)}
							<img className="progression-reward-img" src={reward.img} style={reward.style ? reward.style : {}} alt="current reward" />
							<p className="progression-reward-description">{reward.info}</p>
						</Fragment>
					)}
				</div>
			</div>
			<div className="progression-info-block">
				<button type="button" className="info-btn" onClick={isMobile ? null : toggleModal}>
					<span className="btn-text">{t("moreDetails")}</span>
				</button>
			</div>
		</div>
	);
};

ProgressionEventWidget.propTypes = {
	toggleModal: PropTypes.func.isRequired,
	eventID: PropTypes.string.isRequired,
	imgVer: PropTypes.string.isRequired,
	startUserXp: PropTypes.number.isRequired,
	currentLevelXp: PropTypes.number.isRequired,
	userStats: PropTypes.object.isRequired,
	reward: PropTypes.object.isRequired,
	isCompleted: PropTypes.bool.isRequired,
	indented: PropTypes.bool,
	isBannerLine: PropTypes.bool,
};

export default ProgressionEventWidget;
