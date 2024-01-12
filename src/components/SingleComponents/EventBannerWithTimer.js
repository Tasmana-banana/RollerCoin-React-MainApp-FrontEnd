import React from "react";
import PropTypes from "prop-types";
import EventTimer from "./EventTimer";

import "../../assets/scss/SingleComponents/EventBannerWithTimer.scss";

const EventBannerWithTimer = ({ endTime, isShowSeconds, timerText, imageName }) => (
	<div className="event-banner-with-timer" style={{ backgroundImage: `url(${imageName})` }}>
		{endTime && <EventTimer toDate={endTime} minWidth={232} isShowSeconds={isShowSeconds} timerText={timerText} />}
	</div>
);

EventBannerWithTimer.propTypes = {
	endTime: PropTypes.string,
	isShowSeconds: PropTypes.bool,
	timerText: PropTypes.string,
	imageName: PropTypes.string.isRequired,
};

export default EventBannerWithTimer;
